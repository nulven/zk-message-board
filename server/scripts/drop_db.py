import json
import os
from server.manage import manager
from flask_migrate import stamp
from server import db, app

def drop_db():
    stamp(directory='server/migrations', revision='base', sql=False, tag=None)
    with app.app_context():
        db.sql.drop_all()

if (__name__ == '__main__'):
    drop_db()
