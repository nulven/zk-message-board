from server.config import Config

shop = ''
api_key = Config.SHOPIFY_API_KEY
scopes = (',').join(
    [
        'read_products',
        'write_products',
    ]
)
redirect_uri = '%s/generate_token' % (Config.URL)

install_url = 'https://%s.myshopify.com/admin/oauth/authorize?client_id=%s&scope=%s&redirect_uri=%s' % (shop, api_key, scopes, redirect_uri)
