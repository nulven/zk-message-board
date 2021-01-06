from .default_config import Config as DefaultConfig
import os
from dotenv import load_dotenv
load_dotenv()

class Config(DefaultConfig):
    SQLALCHEMY_DATABASE_URI = 'postgres://%s:%s@%s:5432/%s' % (
            os.getenv('PG_USER'),
            os.getenv('PG_PASSWORD'),
            os.getenv('PG_HOST'),
            os.getenv('PG_TEST_DATABASE'))
    SHOPIFY_ACCESS_TOKEN='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'
    SHOPIFY_HOSTNAME='abelianteststore.myshopify.com'
