from flask import jsonify, request
from server.routes.nested_blueprint import nested_blueprint
from server import db
from server.routes.api.helpers import parse_data


campaigns_bp = nested_blueprint('/api/campaigns', __name__)


@campaigns_bp.permissioned_route('/', methods=['GET'])
def get_campaigns():
    '''Get all active campaigns for a shop

    @returns { success: boolean, campaigns: Campaigns }
    '''

    shop_id = request.cookies.get('shop_id')

    unit = request.args.get('unit')
    value = request.args.get('value')

    time_interval = {
        'unit': 'month' if not unit else unit,
        'value': 1 if not value else int(value),
    }

    campaigns = db.Campaign.get_active_campaigns(shop_id)
    if not campaigns:
        return jsonify({'success': True, 'campaigns': []})

    result_campaigns = []
    for campaign in campaigns:
        result_campaign = {
            'id': campaign['id'],
            'product_id': campaign['product_id'],
            'title': campaign['title'],
            'min_price': campaign['min_price'],
            'max_price': campaign['max_price'],
            'initial_price': campaign['initial_price'],
            **parse_data(campaign, time_interval),
        }
        result_campaigns.append(result_campaign)

    return jsonify({'success': True, 'campaigns': result_campaigns})
