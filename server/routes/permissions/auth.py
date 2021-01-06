from flask import request, session
import hmac
import hashlib
import base64
from server.config import Config

SECRET = Config.SHOPIFY_SECRET


def verify_webhook(func):

    def inner(*args, **kwargs):
        data = request.get_data()
        hmac_header = request.headers.get('X-Shopify-Hmac-Sha256')

        digest = hmac.new(
            SECRET.encode('utf-8'),
            data,
            hashlib.sha256,
        ).digest()
        computed_hmac = base64.b64encode(digest)

        verified = hmac.compare_digest(
            computed_hmac,
            hmac_header.encode('utf-8'))

        if verified:
            shop_name = request.headers.get('X-Shopify-Shop-Domain')
            session['shop_name'] = shop_name

        return func(*args, **kwargs)
    inner.__name__ = func.__name__
    return inner
