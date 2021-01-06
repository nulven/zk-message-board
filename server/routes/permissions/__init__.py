from typing import Dict
from .permissions import to

permissions_table: Dict[str, Dict[str, str]] = { 'GET': {}, 'POST': {}, 'PUT': {}, 'DELETE': {} }

to(permissions_table)
