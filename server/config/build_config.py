import configparser
import os
from dotenv import load_dotenv
load_dotenv()

env = os.getenv('FLASK_ENV')

config = configparser.ConfigParser()
config.read(os.path.dirname(__file__) + '/default.ini')

config['default']['SQLALCHEMY_DATABASE_URI'] = 'postgres://%s:%s@%s:5432/%s' % (
        os.getenv('PG_USER'),
        os.getenv('PG_PASSWORD'),
        os.getenv('PG_HOST'),
        os.getenv('PG_DATABASE'))


config_class = 'class Config():\n'
for item in config['default'].items():
    if item[0] == 'alembic' or item[1].isdigit() or item[1] == 'True' or item[1] == 'False':
        config_class += '    %s=%s\n' % (item[0].upper(), item[1])
    else:
        config_class += '    %s="%s"\n' % (item[0].upper(), item[1])

print(config_class)
with open(os.path.dirname(__file__) + '/config.py', 'w') as config_file:
    config_file.write(config_class)
