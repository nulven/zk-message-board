from flask import jsonify, request, render_template, make_response, redirect, session
import random
from .nested_blueprint import nested_blueprint
from server import db
from .api import api
from .helpers import empty
from server.enums import ShopifyPermissions
from server.shopify_api.authentication import get_access_token
from server.config import Config

app_bp = nested_blueprint('', __name__)

app_bp.register_blueprint(api.api_bp)


@app_bp.route('/')
def lander():
    return render_template('lander.html')


@app_bp.route('/login')
@app_bp.route('/register')
@app_bp.route('/allproducts')
@app_bp.route('/product')
@app_bp.route('/addnew')
@app_bp.route('/dashboard')
def index():
    res = make_response(render_template('index.html'))
    res.set_cookie('shop_id', '82878c46-9312-4e68-8081-a5aa571defbd')
    return res


@app_bp.route('/install')
def install():
    shop = request.args.get('shop')
    api_key = Config.SHOPIFY_API_KEY
    scopes = (',').join(
        [member.value
            for name, member in ShopifyPermissions.__members__.items()]
    )
    redirect_uri = '%s/generate_token' % (Config.URL)
    nonce = random.randint(0, 100000000)
    access_mode = 'per-user'

    session[shop] = nonce

    install_url = '''
        https://%s.myshopify.com/admin/oauth/authorize?client_id=%s&scopes%s&redirect_uri=%s&state=%s&grant_options[]=%s
        ''' % (shop, api_key, scopes, redirect_uri, nonce, access_mode)
    return redirect(install_url)


@app_bp.route('/generate-token')
def generate_token():
    get_access_token(request)


@app_bp.route('/auth/register', methods=['POST'])
def register():
    '''Create a new account

    Requires and email and a password
    '''

    first_name = request.json.get('first_name')
    email = request.json.get('email')
    password = request.json.get('password')

    # Ensure both forms have values
    if empty([email, password]):
        return jsonify({'user_authenticated': False,
                        'empty_values': True}), 404

    # Check if the email is valid
    if not valid_email(email):
        return jsonify({'user_authenticated': False,
                        'invalid_email': True}), 404

    # Check if the email is already registered
    user = db.User.get_user(email=email)
    if user is not None:
        return jsonify({'user_authenticated': False,
                        'email_registered': True}), 404

    try:
        new_user = db.User.create(
            first_name='Nick',
            last_name='Ulven',
            email=email,
            password=password)

        # Successfully registered
        res = make_response(jsonify({'success': True}))
        res.set_cookie('user_id', str(new_user.id))
        return res
    except Exception as error:
        return jsonify({'success': False}), 500


@app_bp.route('/auth/login', methods=['POST'])
def login():
    '''Accepts user email / password.

    Hashes password and checks that user in db.

    Returns a session_id that shoudl be included
    with all requests that have to do with the user.
    '''
    email = request.json.get('email')
    password = request.json.get('password')

    # Ensure both forms have values
    if empty([email, password]):
        return jsonify({'user_authenticated': False,
                        'empty_values': True}), 404

    user = db.User.get_user(email=email)
    # Return error if user doesn't exist
    if user is None:
        return jsonify({'user_authenticated': False,
                        'email_not_registered': True}), 404

    authenticate = user.check_password(password)
    # Return error if password is incorrect
    if not authenticate:
        return jsonify({'user_authenticated': False,
                        'incorrect_password': True,
                        'email_registered': True}), 404

    # Successfully logged in
    res = make_response(jsonify({'success': True}))
    res.set_cookie('user_id', str(user.id))
    return res


@app_bp.permissioned_route('/auth/logout', methods=['POST'])
def logout():
    '''Logout of account.

    Requires a session_id. Checks that user is logged in.
    '''
    '''
    current_user = get_current_user(session, request)
    if current_user is None:
        return '', 401
    '''
    # Successfully logged out
    return jsonify({'logged_out': True}), 200
