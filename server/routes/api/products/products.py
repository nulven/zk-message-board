from flask import jsonify, request
from sqlalchemy.sql import text
from server.routes.nested_blueprint import nested_blueprint
from server import db
from server.routes.api.helpers import parse_data
from .helpers import create_experiments


products_bp = nested_blueprint('/api/products', __name__)


@products_bp.permissioned_route('/', methods=['GET'])
def get_products():
    '''Get all products for a shop

    @returns { success: boolean, products: Products }
    '''

    shop_id = request.cookies.get('shop_id')

    raw_products = db.session.query(db.Product).\
        filter(db.Product.shop_id == shop_id).all()

    products = []
    for raw_product in raw_products:
        product = db.Product.to_dict(raw_product)
        products.append(product)

    return jsonify({'success': True, 'products': products})


@products_bp.permissioned_route('/<string:product>', methods=['GET'])
def get_product(product: str):
    '''Get a product

    @returns { success: boolean, product: Product }
    '''

    shop_id = request.cookies.get('shop_id')
    product_id = product

    owned_product = db.Product.query.\
        filter(db.Product.id == product_id).\
        filter(db.Product.shop_id == shop_id).one_or_none()
    if not owned_product:
        return jsonify({'error': 'Shop does not own product'})

    try:
        raw_product = db.Product.get(product_id)
        product = db.Product.to_dict(raw_product)

        return jsonify({'success': True, 'product': product})
    except Exception as error:
        raise Exception(error)


@products_bp.permissioned_route('/<string:product>/campaigns', methods=['GET'])
def get_product_campaigns(product: str):
    '''Get a product's active campaigns

    @returns { sucess: boolean, campaign: ProductCampaign }
    '''

    shop_id = request.cookies.get('shop_id')
    product_id = product

    owned_product = db.Product.query.\
        filter(db.Product.id == product_id).\
        filter(db.Product.shop_id == shop_id).one_or_none()
    if not owned_product:
        return jsonify({'error': 'Shop does not own product'})

    unit = request.args.get('unit')
    value = request.args.get('value')

    time_interval = {
        'unit': 'month' if not unit else unit,
        'value': 1 if not value else int(value),
    }

    try:
        campaign = db.Product.get_campaign_events(product_id)

        result_experiments = []
        for experiment in campaign['experiments']:
            result_experiment = {}

            result_experiment = {
                'id': experiment['id'],
                'bin': experiment['bin'],
                'customer_percentage': experiment['customer_percentage'],
                'created_at': experiment['created_at'],
                'updated_at': experiment['updated_at'],
                **parse_data(experiment, time_interval),
            }
            result_experiments.append(result_experiment)

        parsed_campaign = {
            **campaign,
            'experiments': result_experiments,
        }

        return jsonify({'success': True, 'campaign': parsed_campaign})
    except Exception as error:
        raise Exception(error)


@products_bp.permissioned_route(
    '/<string:product>/campaigns',
    methods=['POST'])
def create_campaign(product: str):
    '''Create a new campaign for a product

    Errors if active campaign exists

    @returns { success: boolean, campaign: Campaign }
    '''

    shop_id = request.cookies.get('shop_id')
    product_id = product

    owned_product = db.Product.query.\
        filter(db.Product.id == product_id).\
        filter(db.Product.shop_id == shop_id).one_or_none()
    if not owned_product:
        return jsonify({'error': 'Shop does not own product'})

    title = request.json.get('title')
    min_price = request.json.get('min_price')
    max_price = request.json.get('max_price')

    try:
        active_campaign = db.session.query(db.Campaign).\
            filter(db.Campaign.product_id == product_id).\
            filter(db.Campaign.is_active is True).first()
        if active_campaign:
            raise Exception('Active campaign already exists')

        campaign = db.Campaign.create(
            product_id=product_id,
            shop_id=shop_id,
            title=title,
            min_price=min_price,
            max_price=max_price)

        create_experiments(shop_id, campaign)

        return jsonify({'success': True})
    except Exception as error:
        raise Exception(error)


@products_bp.permissioned_route('/<string:product>/campaigns', methods=['PUT'])
def edit_campaign(product: str):
    '''Edit active campaign for a product

    Errors if no active campaign exists

    @returns { success: boolean, campaign: Campaign }
    '''

    shop_id = request.cookies.get('shop_id')
    product_id = product

    owned_product = db.Product.query.\
        filter(db.Product.id == product_id).\
        filter(db.Product.shop_id == shop_id).one_or_none()
    if not owned_product:
        return jsonify({'error': 'Shop does not own product'})

    title = request.json.get('title')
    min_price = request.json.get('min_price')
    max_price = request.json.get('max_price')

    try:
        shop = db.Shop.get(shop_id)

        active_campaign = db.session.query(db.Campaign).\
            filter(db.Campaign.product_id == product_id).\
            filter(db.Campaign.is_active is True).first()
        if not active_campaign:
            raise Exception('No active campaign found')

        # deactivate the old campaign
        db.session.execute(text('''
            UPDATE "Campaigns"
            SET
                is_active=false
            WHERE
                product_id=:product_id AND
                is_active=true;
            '''),
            {'product_id': product_id})

        # create a new campaign with the new values
        new_campaign = db.Campaign.create(
            shop_id=shop_id,
            product_id=active_campaign.product_id,
            title=title if title else active_campaign.title,

            min_price=min_price
            if min_price else active_campaign.min_price,

            max_price=max_price
            if max_price else active_campaign.max_price)

        # TODO: decide what to do with the rest of the variants

        c = db.Campaign.to_dict(new_campaign)

        return jsonify({'success': True, 'campaign': c})
    except Exception as error:
        raise Exception(error)


@products_bp.permissioned_route(
    '/<string:product>/campaigns',
    methods=['DELETE'])
def delete_campaign(product: str):
    '''Deactivate campaign for a product

    Errors if no active campaign exists

    @returns { success: boolean }
    '''

    shop_id = request.cookies.get('shop_id')
    product_id = product

    owned_product = db.Product.query.\
        filter(db.Product.id == product_id).\
        filter(db.Product.shop_id == shop_id).one_or_none()
    if not owned_product:
        return jsonify({'error': 'Shop does not own product'})

    try:
        active_campaign = db.session.query(db.Campaign).\
            filter(db.Campaign.product_id == product_id).\
            filter(db.Campaign.is_active is True).one()
        if not active_campaign:
            raise Exception('No active campaign found')

        campaign = db.Campaign.update().\
            where(db.Campaign.id == active_campaign.id).\
            values(is_active=False)

        db.CampaignVariant.update().\
            where(db.CampaignVariant.campaign_id == active_campaign.id).\
            value(is_active=False)

        return jsonify({'success': True})
    except Exception as error:
        raise Exception(error)
