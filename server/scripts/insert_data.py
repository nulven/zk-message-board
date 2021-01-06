from server import db
from server.config import Config
from server.enums import EventTypes
from random import randint
from faker import Faker
from datetime import datetime
from monthdelta import monthdelta
import uuid

fake = Faker()

def insert_data():
    shop=insert_shop()
    print('Creating Shop')
    insert_products(shop)
    print('Creating Products')
    campaigns=create_campaigns(shop)
    print('Creating Product Campaigns')
    customers=insert_customers(shop)
    print('Creating Customers')
    connect_variants_to_customers(customers, campaigns)
    print('Creating CampaignVariants and Events')


def insert_shop():
    return db.Shop.create(
        id='82878c46-9312-4e68-8081-a5aa571defbd',
        access_token=Config.SHOPIFY_ACCESS_TOKEN,
        name=Config.SHOPIFY_HOSTNAME)


def insert_products(shop):
    products = shop.products.get_all()
    for product in products:
        new_product = db.Product.create(
                shopify_id=product['id'],
                title=product['title'],
                shop_id=shop.id)

def create_campaigns(shop):
    products = db.session.query(db.Product).filter(db.Product.shop_id==shop.id).all()

    campaigns = []
    for product in products:
        campaign = db.Campaign.create(
                product_id=product.id,
                shop_id=shop.id,
                min_price=0,
                max_price=10000,
                created_at=datetime.utcnow()-monthdelta(12))
        variants = shop.variants.get_all(product.shopify_id)
        experiments = []
        for i in range(3):
            experiment = db.Experiment.create(
                    bin=-10 + 10*i,
                    customer_percentage=33,
                    campaign_id=campaign.id,
                    created_at=datetime.utcnow()-monthdelta(12))
            experiments.append(experiment)
        for variant in variants:
            our_variant = db.Variant.create(
                    shopify_id=variant['id'],
                    option_1=variant['option1'],
                    option_2=variant['option2'],
                    option_3=variant['option3'],
                    product_id=product.id,
                    created_at=datetime.utcnow()-monthdelta(12),
                    price=int(float(variant['price']))*100)
            for experiment in experiments:
                campaign_variant = db.CampaignVariant.create(
                        shopify_id=variant['id'],
                        option_1=variant['option1'],
                        option_2=variant['option2'],
                        option_3=variant['option3'],
                        variant_id=our_variant.id,
                        campaign_id=campaign.id,
                        experiment_id=experiment.id,
                        created_at=datetime.utcnow()-monthdelta(12),
                        price=int(float(variant['price']))*(100+experiment.bin))
        campaigns.append(experiments)
    return campaigns


def insert_customers(shop):
    customers = []
    for i in range(10):
        customer = db.Customer.create(shopify_id=randint(0, 100000), shop_id=shop.id)
        customers.append(customer)
    return customers


def connect_variants_to_customers(customers, campaigns):
    for campaign in campaigns:
        for customer in customers:
            experiment = campaign[randint(0, len(campaign)-1)]
            db.CustomerExperimentAssoc.create(
                customer_id=customer.id,
                experiment_id=experiment.id)
            variants = db.CampaignVariant.query.\
                    filter(db.CampaignVariant.experiment_id == experiment.id).all()
            for variant in variants:
                for i in range(randint(0, 100)):
                    db.Event.create(
                        event_type=EventTypes.purchase.value,
                        customer_id=customer.id,
                        campaign_variant_id=variant.id,
                        created_at=fake.date_time_between(start_date='-1y', end_date='now'))
                for i in range(randint(0, 100)):
                    db.Event.create(
                        event_type=EventTypes.click.value,
                        customer_id=customer.id,
                        campaign_variant_id=variant.id,
                        created_at=fake.date_time_between(start_date='-1y', end_date='now'))
    

if (__name__ == '__main__'):
    insert_data()
