"""
Firebase Admin initialization and helpers.
"""

import json
import logging
import os
from typing import Optional

import firebase_admin
from firebase_admin import credentials, storage

logger = logging.getLogger("memorybook")

_bucket = None


def _init_firebase_app() -> firebase_admin.App:
    if firebase_admin._apps:
        return firebase_admin.get_app()

    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if service_account_json:
        cred_info = json.loads(service_account_json)
        cred = credentials.Certificate(cred_info)
    else:
        cred = credentials.ApplicationDefault()

    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")
    if not bucket_name:
        raise RuntimeError("FIREBASE_STORAGE_BUCKET is not set")

    return firebase_admin.initialize_app(cred, {"storageBucket": bucket_name})


def get_storage_bucket() -> storage.bucket:
    global _bucket
    if _bucket is not None:
        return _bucket

    _init_firebase_app()
    _bucket = storage.bucket()
    logger.info("[firebase] Storage bucket initialized")
    return _bucket
