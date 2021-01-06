from ..permissions import rules as R
from ..permissions import rate_limits as L
from ..permissions import auth as A


def log(message):
    def wrapper(func):
        def inner(*args, **kwargs):
            print(message)
            return func(*args, **kwargs)
        return inner
    return wrapper


def to(table):
    table['POST']['/auth/logout'] = []
    table['POST']['/api/hooks/checkouts/create'] = [A.verify_webhook]
    table['POST']['/api/hooks/products/create'] = [A.verify_webhook]
    table['POST']['/api/hooks/products/update'] = [A.verify_webhook]
    table['POST']['/api/hooks/products/delete'] = [A.verify_webhook]
    table['POST']['/api/hooks/products/click'] = [A.verify_webhook]
    table['POST']['/api/hooks/customers/create'] = [A.verify_webhook]
    table['POST']['/api/hooks/customers/update'] = [A.verify_webhook]
    table['POST']['/api/hooks/app/uninstalled'] = [A.verify_webhook]

    table['GET']['/api/products/'] = []
    table['GET']['/api/products/<string:product>'] = []
    table['GET']['/api/products/<string:product>/campaigns'] = []
    table['POST']['/api/products/<string:product>/campaigns'] = []
    table['PUT']['/api/products/<string:product>/campaigns'] = []
    table['DELETE']['/api/products/<string:product>/campaigns'] = []

    table['GET']['/api/campaigns/'] = []

    table['POST']['/api/customers/'] = []
    table['GET']['/api/customers/<string:cookie>'] = []
