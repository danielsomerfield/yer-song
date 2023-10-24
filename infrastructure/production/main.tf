terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.21"
    }
  }

  backend "s3" {
    bucket = "somerfield-tf-state"
    key    = "yer-song/production"
    region = "us-west-2"
  }

  required_version = ">= 1.6.1"
}

provider "aws" {
  region = "us-west-2"
}

provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

resource "aws_s3_bucket" "yer_song_ui_resource_bucket" {
  bucket        = "yer-song-ui-production"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "yer_song_ui_resource_bucket" {
  bucket = aws_s3_bucket.yer_song_ui_resource_bucket.id
  index_document {
    suffix = "index.html"
  }
  error_document {
    key = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "yer_song_ui_resource_bucket" {
  bucket              = aws_s3_bucket.yer_song_ui_resource_bucket.id
  block_public_acls   = false
  block_public_policy = false
}

resource "aws_s3_bucket_policy" "yer_song_ui_resource_bucket_allow_public" {
  bucket     = aws_s3_bucket.yer_song_ui_resource_bucket.bucket
  policy     = data.aws_iam_policy_document.yer_song_ui_resource_bucket_allow_public.json
  depends_on = [aws_s3_bucket_public_access_block.yer_song_ui_resource_bucket]
}

data "aws_iam_policy_document" "yer_song_ui_resource_bucket_allow_public" {
  statement {
    sid     = "AllPublicAccessToYerSongUI"
    actions = [
      "s3:GetObject",
    ]
    principals {
      identifiers = ["*"]
      type        = "AWS"
    }
    resources = [
      "${aws_s3_bucket.yer_song_ui_resource_bucket.arn}/*"
    ]
  }

  statement {
    sid     = "ListBucketToYerSongUI"
    actions = [
      "s3:ListBucket"
    ]
    principals {
      identifiers = ["*"]
      type        = "AWS"
    }
    resources = [
      aws_s3_bucket.yer_song_ui_resource_bucket.arn
    ]
  }


  depends_on = [
    aws_s3_bucket.yer_song_ui_resource_bucket
  ]
}

resource "aws_acm_certificate" "spa_cert" {
  provider          = aws.us-east-1
  domain_name       = local.fqdn
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

}


resource "aws_acm_certificate_validation" "cert_validation" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.spa_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.cert_validation : record.fqdn]
}

resource "aws_route53_record" "cert_validation" {
  provider = aws.us-east-1
  for_each = {
    for dvo in aws_acm_certificate.spa_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.rwwf_zone.id
}

resource "aws_cloudfront_origin_access_identity" "spa_cdn" {}

locals {
  s3_origin_id = "spa_s3_origin"
  fqdn         = "${var.spa_host}.${var.spa_domain_name}"
}

resource "aws_cloudfront_distribution" "spa_cdn" {
  origin {
    domain_name = aws_s3_bucket.yer_song_ui_resource_bucket.bucket_domain_name
    origin_id   = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.spa_cdn.cloudfront_access_identity_path

    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations        = ["US", "CA"]
    }
  }

  aliases = [local.fqdn]

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.spa_cert.arn
    ssl_support_method  = "sni-only"
    #    minimum_protocol_version = "TLSv1.2_2019"
    #    cloudfront_default_certificate = true
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"

    min_ttl     = 0
    // TODO: increase this once we've stabilized or have configured invalidation
    default_ttl = 5
    max_ttl     = 60
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  enabled             = true
  default_root_object = "index.html"
}

resource "aws_route53_zone" "rwwf_zone" {
  name = local.fqdn
}

resource "aws_route53_record" "yersong_a_record" {
  name    = local.fqdn
  type    = "A"
  zone_id = aws_route53_zone.rwwf_zone.id

  alias {
    name                   = aws_cloudfront_distribution.spa_cdn.domain_name
    zone_id                = aws_cloudfront_distribution.spa_cdn.hosted_zone_id
    evaluate_target_health = false
  }
}