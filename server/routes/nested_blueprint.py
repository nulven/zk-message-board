from flask import Blueprint, Flask
from typing import Callable, Dict, List
from .permissions import permissions_table


def outer(permissions):
    def inner(passed_func):
        if len(permissions) > 1:
            return permissions[0](outer(permissions[1:]))(passed_func)
        elif len(permissions) == 1:
            return permissions[0](passed_func)
        else:
            return passed_func
    return inner


class NestedBlueprint(Blueprint):
    def __init__(self, prefix: str, import_name: str, table):
        super().__init__(prefix, import_name)
        self.url_prefix = prefix
        self.permissions_table: Dict[str, List[Callable]] = table

    def permissioned_route(self, path, methods=[]):
        permissions = permissions_table[methods[0]][self.url_prefix + path]

        def inner(func):
            self.route(path, methods=methods)(outer(permissions)(func))
            return func

        return inner

    def route(self, rule, **options):
        def decorator(f):
            endpoint = options.pop('endpoint', f.__name__)
            self.add_url_rule(rule, endpoint, f, **options)
            return f
        return decorator

    def register_blueprint(self, blueprint, **options):
        def deferred(state):
            url_prefix = \
                (options.get('url_prefix', blueprint.url_prefix) or u"")
            if 'url_prefix' in options:
                del options['url_prefix']

            state.app.register_blueprint(
                blueprint,
                url_prefix=url_prefix,
                **options)
        self.record(deferred)


def nested_blueprint(prefix: str, import_name: str):
    return NestedBlueprint(prefix, import_name, permissions_table)
