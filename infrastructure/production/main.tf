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
  region  = "us-west-2"
}

resource "aws_s3_bucket" "yer_song_ui_resource_bucket" {
  bucket = "yer-song-ui-production"
  force_destroy = true
}

resource "aws_s3_bucket_website_configuration" "yer_song_ui_resource_bucket" {
  bucket = aws_s3_bucket.yer_song_ui_resource_bucket.id
  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "yer_song_ui_resource_bucket" {
  bucket = aws_s3_bucket.yer_song_ui_resource_bucket.id
  block_public_acls = false
  block_public_policy = false
}

resource "aws_s3_bucket_policy" "yer_song_ui_resource_bucket_allow_public" {
  bucket = aws_s3_bucket.yer_song_ui_resource_bucket.bucket
  policy = data.aws_iam_policy_document.yer_song_ui_resource_bucket_allow_public.json
  depends_on = [aws_s3_bucket_public_access_block.yer_song_ui_resource_bucket]
}

data "aws_iam_policy_document" "yer_song_ui_resource_bucket_allow_public" {
  statement {
    sid = "AllPublicAccessToYerSongUI"
    actions = [
      "s3:GetObject"
    ]
    principals {
      identifiers = ["*"]
      type        = "AWS"
    }
    resources = [
      "${aws_s3_bucket.yer_song_ui_resource_bucket.arn}/*"
    ]
  }
  depends_on = [
    aws_s3_bucket.yer_song_ui_resource_bucket
  ]
}