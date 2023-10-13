terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.21"
    }
  }

  required_version = ">= 1.6.1"
}

provider "aws" {
  region  = "us-west-2"
}

resource "aws_s3_bucket" "yer_song_ui_resource_bucket" {
  bucket = "somerfield-tf-state"
}

