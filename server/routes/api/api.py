from server.routes.nested_blueprint import nested_blueprint
from .products import products_bp
from .campaigns import campaigns_bp
from .customers import customers_bp
from .hooks import hooks_bp

api_bp = nested_blueprint('/api', __name__)
api_bp.register_blueprint(products_bp)
api_bp.register_blueprint(campaigns_bp)
api_bp.register_blueprint(customers_bp)
api_bp.register_blueprint(hooks_bp)
