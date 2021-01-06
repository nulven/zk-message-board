from server import db


def create_experiments(shop_id: str, campaign):
    '''Create experiment bins for a new campaign
    '''

    shop = db.Shop.get(shop_id)

    variants = db.Variant.query.\
        filter(db.Variant.product_id == campaign.product_id).all()

    for i in range(-10, 10):
        experiment = db.Experiment.create(
            bin=10 * i,
            customer_percentage=5 if i != 0 else 0,
            campaign_id=campaign.id)

        metafield = {
            'namespace': 'pricedright',
            'key': 'experiment',
            'value': experiment.id,
        }

        for variant in variants:

            if i == 0:
                shop.variants.add_metafield(variant.shopify_id, metafield)

                campaign_variant = db.CampaignVariant.create(
                    shopify_id=variant.shopify_id,
                    option_1=variant.option_1,
                    option_2=variant.option_2,
                    option_3=variant.option_3,
                    price=variant.price,
                    experiment_id=experiment.id,
                    campaign_id=campaign.id,
                    variant_id=variant.id)

                continue

            if i < 0:
                price = variant.price +\
                    (variant.price - campaign.min_price) *\
                    (experiment.bin / 100)
            elif i > 0:
                price = variant.price +\
                    (campaign.max_price - variant.price) *\
                    (experiment.bin / 100)

            # Create shopify variant
            new_variant = shop.variants.create({
                'price': price,
                'option1': variant.option_1,
                'option2': variant.option_2,
                'option3': variant.option_3,
                'metafields': [metafield],
            })

            db.CampaignVariant.create(
                shopify_id=new_variant['id'],
                option_1=variant.option_1,
                option_2=variant.option_2,
                option_3=variant.option_3,
                price=price,
                experiment_id=experiment.id,
                campaign_id=campaign.id,
                variant_id=variant.id)
