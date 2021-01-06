import os
import time
import uuid
from typing import List
from server.enums import WebhookTopics, WebhookTopicsToPath
from server import db


def empty(it: List[str]) -> bool:
    '''Check if any strings in an array are empty
    '''
    return any([i is None or i.strip() == '' for i in it])


def set_timezone_eastern():
    '''Set our timezone to eastern
    '''
    os.environ['TZ'] = 'US/Eastern'
    time.tzset()


def get_timestamp() -> str:
    '''Get current time in human readable format
    '''
    time.ctime()
    return time.strftime('%l:%M%p %Z on %b %d, %Y')


def generate_cookie():
    return str(uuid.uuid4())


def onboard_shop(shop):

    # process customers
    print('Processing customers')
    customers = shop.customers.get_all()
    for customer in customers:
        db.Customer.create(
            shopify_id=customer['id'],
            email=customer['email'],
            shop_id=shop.id,
            cookie=generate_cookie())

    # process products
    print('Processing products')
    products = shop.products.get_all()
    for product in products:
        new_product = db.Product.create(
            shopify_id=product['id'],
            title=product['title'],
            shop_id=shop.id)
        variants = shop.variants.get_all(product['id'])
        for variant in variants:
            db.Variant.create(
                shopify_id=variant['id'],
                product_id=new_product.id,
                price=int(float(variant['price'])) * 100)

    # add script tags
    '''
    for script_tag in ScriptTags:
        shop.script_tags.create({
            'event': 'onload',
            'src': script_tag,
        })
    '''

    # add webhooks
    for topic in WebhookTopics:
        shop.webhooks.create(
            topic.value,
            WebhookTopicsToPath[topic.name].value)
