#!/usr/bin/env python3
"""Build private, validated gallery ZIPs in R2 without running ZIP generation in Workers."""
import os, sys, tempfile, zipfile, hashlib
from pathlib import Path
import boto3
from botocore.config import Config

BUCKET = os.environ["R2_BUCKET"]
client = boto3.client("s3", endpoint_url=os.environ["R2_ENDPOINT"],
    aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
    aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
    region_name="auto", config=Config(retries={"max_attempts": 5, "mode": "standard"}))

def objects(prefix):
    items = []
    for page in client.get_paginator("list_objects_v2").paginate(Bucket=BUCKET, Prefix=prefix):
        for obj in page.get("Contents", []):
            key = obj["Key"]
            if key.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".heic")):
                items.append((key, obj["Size"], obj["ETag"]))
    return sorted(items)

def galleries():
    found = set()
    for page in client.get_paginator("list_objects_v2").paginate(Bucket=BUCKET, Prefix="galleries/", Delimiter="/"):
        for p in page.get("CommonPrefixes", []):
            found.add(p["Prefix"])
    return sorted(found)

def build(gallery):
    prefix = gallery + "photos/"
    files = objects(prefix)
    if not files:
        print("Skipping empty gallery:", gallery)
        return
    signature = hashlib.sha256(repr(files).encode()).hexdigest()
    archive_key = gallery + "gallery-download.zip"
    try:
        head = client.head_object(Bucket=BUCKET, Key=archive_key)
        if head.get("Metadata", {}).get("source-signature") == signature:
            print("Up to date:", gallery)
            return
    except client.exceptions.ClientError as e:
        if e.response["Error"]["Code"] not in ("404", "NoSuchKey", "NotFound"):
            raise
    print("Building:", gallery, len(files), "images")
    with tempfile.TemporaryDirectory() as directory:
        archive = Path(directory) / "gallery-download.zip"
        with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_STORED, allowZip64=True) as z:
            for key, size, _ in files:
                name = key[len(prefix):]
                if not name or name.startswith("/") or ".." in Path(name).parts:
                    raise ValueError("Unsafe ZIP entry: " + name)
                with client.get_object(Bucket=BUCKET, Key=key)["Body"] as source:
                    with z.open(name, "w", force_zip64=True) as dest:
                        while chunk := source.read(1024 * 1024):
                            dest.write(chunk)
        with zipfile.ZipFile(archive) as z:
            if z.testzip() is not None or len(z.namelist()) != len(files):
                raise ValueError("ZIP verification failed")
        if objects(prefix) != files:
            raise RuntimeError("Gallery changed while building; retry next run")
        client.upload_file(str(archive), BUCKET, archive_key,
            ExtraArgs={"ContentType": "application/zip", "Metadata": {"source-signature": signature}})
        print("Uploaded:", archive_key, archive.stat().st_size, "bytes")

if __name__ == "__main__":
    selected = os.getenv("GALLERY_SLUG", "").strip()
    if selected and (not selected.replace("-", "").isalnum() or "/" in selected):
        sys.exit("Invalid gallery slug")
    for gallery in ([f"galleries/{selected}/"] if selected else galleries()):
        build(gallery)
