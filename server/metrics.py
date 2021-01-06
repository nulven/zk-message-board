import os
import beeline
from beeline.middleware.flask import HoneyMiddleware

def honey_middleware(app):
    api_key = os.getenv('HONEYCOMB_API_KEY')
    dataset = os.getenv('HONEYCOMB_DATASET')
    has_key = api_key and dataset
    if (has_key):
        beeline.init(
            writekey=api_key,
            dataset=dataset,
            service_name='priceright')

        HoneyMiddleware(app, db_events=True)
