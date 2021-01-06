from flask import jsonify, request, session
from server.routes.nested_blueprint import nested_blueprint
from server import db
from server.enums import EventTypes
from sqlalchemy.sql import text

hooks_bp = nested_blueprint('/api/hooks', __name__)


@hooks_bp.permissioned_route('/checkouts/create', methods=['POST'])
def create_checkout():
    '''Create purchase events for a checkout

    '''

    shop_name = session.get('shop_name')
    shopify_customer = request.json.get('customer')
    customer_shopify_id = shopify_customer['id']
    customer_email = shopify_customer['email']
    products = map(lambda x: x['product_id'], request.json.get('line_items'))

    try:
        shop = db.Shop.get(name=shop_name)

        events = []
        for shopify_id in products:
            product = db.Product.get(shopify_id=shopify_id)

            if customer_shopify_id:
                customer = db.Customer.get(shopify_id=customer_shopify_id)
            else:
                customer = db.Customer.query.\
                    filter(db.Customer.email == customer_email).\
                    filter(db.Customer.shop_id == shop.id).one()
            if not customer:
                # TODO garbage collection
                raise Exception('Cannot find a PriceRight customer')

            campaign_variant = db.CampaignVariant.query.\
                join(db.Experiment.customers).\
                join(db.Campaign).\
                filter(db.Customer.id == customer.id).\
                filter(db.Campaign.product_id == product.id).one()
            if not campaign_variant:
                # TODO garbage collection
                raise Exception('Cannot find variant associated with customer')

            event = db.Event(
                customer_id=customer.id,
                campaign_variant_id=campaign_variant.id,
                event_type=EventTypes.purchase.value)
            events.append(event)

        db.session.add_all(events)
        db.session.commit()

        return jsonify({'success': True})
    except Exception as error:
        return jsonify({'error': error}), 500


@hooks_bp.permissioned_route('/products/create', methods=['POST'])
def create_product():
    '''Create a product
    '''

    shop_name = session.get('shop_name')
    shopify_id = request.json.get('id')
    title = request.json.get('title')
    variants = request.json.get('variants')

    try:
        shop = db.Shop.get(name=shop_name)

        product = db.Product.get(shopify_id=shopify_id)

        # create new product
        new_product = db.Product.create(
            shopify_id=shopify_id,
            shop_id=shop.id,
            title=title)
        new_product_id = new_product.id

        # create variants
        for variant in variants:
            db.Variant.create(
                shopify_id=variant['id'],
                product_id=new_product.id,
                price=variant['price'],
            )

        return jsonify({'success': True})
    except Exception as error:
        return jsonify({'error': error}), 500


@hooks_bp.permissioned_route('/products/update', methods=['POST'])
def update_product():
    '''Update a product
    '''

    shop_name = session.get('shop_name')
    shopify_id = request.json.get('id')
    title = request.json.get('title')
    variants = request.json.get('variants')

    try:
        shop = db.Shop.get(name=shop_name)

        # update existing product
        product = db.Product.update().\
            where(db.Product.shopify_id == shopify_id).\
            values(
                shopify_id=shopify_id,
                title=title,
                shop_id=shop.id)
        db.session.execute(product)
        db.session.commit()

        # update variants
        for variant in variants:
            # deprecate old variant
            old_variant = db.Variant.update().\
                where(db.Variant.shopify_id == variant['id']).\
                values(deleted=True)
            db.session.execute(old_variant)

            # create new variant
            db.Variant.create(
                shopify_id=variant['id'],
                product_id=product.id,
                price=variant['price'],
                campaign_id=old_variant.campaign_id)

        return jsonify({'success': True})
    except Exception as error:
        return jsonify({'error': error}), 500


@hooks_bp.permissioned_route('/products/delete', methods=['POST'])
def delete_product():
    '''Delete a product
    '''

    shop_name = session.get('shop_name')
    shopify_id = request.json.get('id')

    try:
        shop = db.Shop.get(name=shop_name)
        product_update = db.Product.update().\
            where(db.Product.shopify_id == shopify_id).\
            where(db.Product.shop_id == shop.id).\
            values(deleted=True)
        db.session.execute(product_update)
        db.session.commit()

        return jsonify({'success': True})
    except Exception as error:
        return jsonify({'error': error}), 500


@hooks_bp.permissioned_route('/products/click', methods=['POST'])
def create_product_click():
    '''Create click events for a product

    '''

    shop_name = session.get('shop_name')
    customer_shopify_id = request.json.get('id')
    customer_cookie = request.json.get('cookie')
    product_shopify_id = request.json.get('product_id')

    try:
        shop = db.Shop.get(name=shop_name)
        product = db.Product.get(shopify_id=product_shopify_id)

        campaign_variant = db.CampaignVariant.query.\
            join(db.Experiment.customers).\
            join(db.Campaign).\
            filter(db.Customer.shopify_id == customer_shopify_id).\
            filter(db.Campaign.product_id == product.id).one()

        customer = db.Customer.get(
            shopify_id=customer_shopify_id,
            cookie=customer_cookie)

        db.Event.create(
            customer_id=customer.id,
            campaign_variant_id=campaign_variant.id,
            event_type=EventTypes.click.value)

        return jsonify({'success': True})
    except Exception as error:
        return jsonify({'error': error}), 500


@hooks_bp.permissioned_route('/customers/create', methods=['POST'])
def create_customer():
    '''Create a customer

    '''

    shop_name = session.get('shop_name')
    shopify_id = request.json.get('id')
    email = request.json.get('email')
    # cookie = request.json.get('metaattributes')['cookie']

    try:
        shop = db.Shop.get(name=shop_name)

        if shopify_id:
            # logged in customer
            customer = db.Customer.get(shopify_id=shopify_id)
        else:
            # logged out customer
            customer = db.Customer.query.\
                filter(db.Customer.email == email).\
                filter(db.Customer.shop_id == shop.id).\
                one()

        if not customer:
            # create a new customer
            new_customer = db.Customer.create(
                shopify_id=shopify_id,
                shop_id=shop.id,
                email=email)
        else:
            # update exisiting customer
            new_customer = db.Customer.update().\
                where(db.Customer.id == customer.id).\
                values(
                    shopify_id=shopify_id,
                    email=email,
                    shop_id=shop.id)
            db.session.add(new_customer)
            db.session.commit()

        return jsonify({'success': True})
    except Exception as error:
        return jsonify({'error': error}), 500


@hooks_bp.permissioned_route('/customers/update', methods=['POST'])
def update_customer():
    '''Update a customer

    '''

    shop_name = session.get('shop_name')
    shopify_id = request.json.get('id')
    email = request.json.get('email')
    # cookie = request.json.get('metaattributes')['cookie']

    try:
        shop = db.Shop.get(name=shop_name)

        if shopify_id:
            # logged in customer
            customer = db.Customer.get(shopify_id=shopify_id)
        else:
            # logged out customer
            customer = db.Customer.query.\
                filter(db.Customer.email == email).\
                filter(db.Customer.shop_id == shop.id).\
                one()

        if not customer:
            # create a new customer
            new_customer = db.Customer.create(
                shopify_id=shopify_id,
                shop_id=shop.id,
                email=email)
        else:
            # update exisiting customer
            new_customer = db.Customer.update().\
                where(db.Customer.id == customer.id).\
                values(
                    shopify_id=shopify_id,
                    email=email,
                    shop_id=shop.id)
            db.session.add(new_customer)
            db.session.commit()

        return jsonify({'success': True})
    except Exception as error:
        return jsonify({'error': error}), 500


@hooks_bp.permissioned_route('/app/uninstalled', methods=['POST'])
def delete_shop():
    '''Delete a shop

    '''

    shop_name = session.get('shop_name')

    try:
        shop = db.Shop.get(name=shop_name)

        # Remove events
        delete_events = '''
            DELETE FROM
                "Events"
            WHERE
                "Events".id IN (
                    SELECT "Events".id
                    FROM "Events"
                    INNER JOIN "Customers"
                        ON "Events".customer_id = "Customers".id
                    WHERE
                        "Customers".shop_id=:shop_id
                );'''
        db.session.execute(
            text(delete_events),
            {'shop_id': shop.id},
        )

        # Remove customer <> variants associations
        delete_associations = '''
            DELETE FROM
                "CustomerExperimentAssocs"
            WHERE
                "CustomerExperimentAssocs".id IN (
                    SELECT "CustomerExperimentAssocs".id
                    FROM "CustomerExperimentAssocs"
                    INNER JOIN "Customers"
                        ON customer_id="Customers".id
                    WHERE
                        "Customers".shop_id=:shop_id
                );'''
        db.session.execute(
            text(delete_associations),
            {'shop_id': shop.id},
        )

        # Remove campaign variants
        delete_campaign_variants = '''
            DELETE FROM
                "CampaignVariants"
            WHERE
                "CampaignVariants".id IN (
                    SELECT "CampaignVariants".id
                    FROM "CampaignVariants"
                    INNER JOIN "Campaigns"
                        ON "CampaignVariants".campaign_id = "Campaigns".id
                    WHERE
                        "Campaigns".shop_id=:shop_id
                );'''
        db.session.execute(
            text(delete_campaign_variants),
            {'shop_id': shop.id},
        )

        # Remove experiments
        delete_variants = '''
            DELETE FROM
                "Experiments"
            WHERE
                "Experiments".id IN (
                    SELECT "Experiments".id
                    FROM "Experiments"
                    INNER JOIN "Campaigns"
                        ON "Experiments".campaign_id = "Campaigns".id
                    WHERE
                        "Campaigns".shop_id=:shop_id
                );'''
        db.session.execute(
            text(delete_variants),
            {'shop_id': shop.id},
        )

        # Remove variants
        delete_variants = '''
            DELETE FROM
                "Variants"
            WHERE
                "Variants".id IN (
                    SELECT "Variants".id
                    FROM "Variants"
                    INNER JOIN "Products"
                        ON "Variants".product_id = "Products".id
                    WHERE
                        "Products".shop_id=:shop_id
                );'''
        db.session.execute(
            text(delete_variants),
            {'shop_id': shop.id},
        )

        # Remove customers
        delete_customers = '''
            DELETE FROM
                "Customers"
            WHERE
                "Customers".shop_id=:shop_id;'''
        db.session.execute(
            text(delete_customers),
            {'shop_id': shop.id},
        )

        # Remove campaigns
        delete_campaigns = '''
            DELETE FROM
                "Campaigns"
            WHERE
                "Campaigns".shop_id=:shop_id;'''
        db.session.execute(
            text(delete_campaigns),
            {'shop_id': shop.id},
        )

        # Remove products
        delete_products = '''
            DELETE FROM
                "Products"
            WHERE
                "Products".shop_id=:shop_id;'''
        db.session.execute(
            text(delete_products),
            {'shop_id': shop.id},
        )

        # Remove shop
        delete_shop = '''
            DELETE FROM
                "Shops"
            WHERE
                "Shops".id=:shop_id;'''
        db.session.execute(
            text(delete_shop),
            {'shop_id': shop.id},
        )
        db.session.commit()

        return jsonify({'success': True})
    except Exception as error:
        return jsonify({'error': error}), 500
