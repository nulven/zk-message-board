from flask import jsonify, request
import random
from server import db
from server.routes.nested_blueprint import nested_blueprint
from server.routes.helpers import generate_cookie


customers_bp = nested_blueprint('/api/customers', __name__)


@customers_bp.permissioned_route('/', methods=['POST'])
def create_customer_cookie():

    shop_id = request.cookies.get('shop_id')
    shop_id = '82878c46-9312-4e68-8081-a5aa571defbd'
    try:
        cookie = generate_cookie()

        customer = db.Customer.create(cookie=cookie, shop_id=shop_id)

        campaigns = db.Campaign.query.\
            filter(db.Campaign.shop_id == shop_id).\
            filter(db.Campaign.is_active == True).all()

        results = []
        for campaign in campaigns:
            experiments = db.Experiment.query.\
                filter(db.Experiment.campaign_id == campaign.id).\
                filter(db.Experiment.is_active == True).all()

            product = db.Product.get(campaign.product_id)

            experiment_ids = [experiment.id for experiment in experiments]
            weights = [experiment.customer_percentage
                       for experiment in experiments]
            experiment_id = random.choices(experiment_ids, weights)[0]

            db.CustomerExperimentAssoc.create(
                experiment_id=experiment_id,
                customer_id=customer.id)
            campaign_variants = db.session.\
                query(db.CampaignVariant.shopify_id).\
                filter(db.CampaignVariant.experiment_id == experiment_id).all()

            results.append({
                'product': product.shopify_id,
                'experiment': experiment_id,
                'variants': [v for (v,) in campaign_variants],
            })

        return jsonify({
            'success': True,
            'cookie': cookie,
            'products': results,
        })
    except Exception as error:
        return jsonify({'error': error}), 500


@customers_bp.permissioned_route('/<string:cookie>', methods=['GET'])
def get_customer_cookie(cookie: str):

    try:
        experiments = db.session.\
            query(
                db.Experiment.id,
                db.Product.shopify_id.label('product_shopify_id'),
            ).\
            join(db.CustomerExperimentAssoc).\
            join(db.Customer).\
            join(db.Campaign).\
            join(db.Product).\
            filter(db.Customer.cookie == cookie).all()

        results = []
        for experiment in experiments:
            campaign_variants = db.session.\
                query(db.CampaignVariant.shopify_id).\
                filter(db.CampaignVariant.experiment_id == experiment.id).all()
            results.append({
                'product': experiment.product_shopify_id,
                'experiment': experiment.id,
                'variants': [v for (v,) in campaign_variants],
            })

        return jsonify({'success': True, 'products': results})
    except Exception as error:
        return jsonify({'error': error}), 500
