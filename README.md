# shopify

## Prerequisites
- Python 3.7
- Node.js 10.16.3
- PostgresSQL 10

### Installing python

#### Linux (Ubuntu)
```
$ sudo apt-get update
$ sudo add-apt-repository ppa:deadsnakes/ppa
$ sudo apt-get install python3.7
```

#### Mac
```
$ brew install python3
```


### Installing Node.js
Install `nvm` 
```
$ wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
```

Use `nvm` to install Node
```
$ nvm install node
$ nvm install 10.16.3
```

### Installing PostgreSQL
```
$ wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
$ sudo apt-get update
$ sudo apt-get install postgresql-10
```

Configuring permissions

Create user and set passwords
```
$ sudo su - postgres
postgres $ psql
# alter role postgres with password '[POSTGRES_PASSWORD]';
# create role [USERNAME] with password '[USER_PASSWORD]';
# alter role [USERNAME] with superuser;
# alter role [USERNAME] with login;
# alter role [USERNAME] with createdb;
# alter role [USERNAME] with createrole;
# alter role [USERNAME] with replication;
# \q
postgres $ exit
```

Open `pg_hba.conf` in `/etc/postgresql/10/main`
Edit the bottom of the file so every `peer` is changed to `md5` if you want postgres to be password protected and `trust` otherwise.

Restart the postgres server
```
$ sudo service postgresql restart
```

Add the following line to `~/.bashrc` or `~/.profile`:
```
export PG_USER=[USERNAME]
```

## Developing Environment

Create configuration
```
cp .env.config .env
```

Edit `.env` settings
```
PG_USER=[USERNAME]
PG_PASSWORD=[USER_PASSWORD]
PG_DATABASE=[DB_NAME]
PG_HOST=localhost
PG_TEST_DATABASE=[TEST_DB_NAME]
```


### Backend
Create virtual environment
```
$ pip3 install virtualenv
$ virtualenv -p /usr/bin/python3.7 [VENV_NAME]
$ source [VENV_NAME]/bin/activate
```

Develop python environment
```
$ sudo apt-get install python3.7-dev
$ python3 setup.py install
$ python3 setup.py develop
$ pip3 install -r requirements.txt
```

### Frontend
```
$ npm install
```

### Database
Load tables into database
```
$ npm run migrations
```

Insert test data
```
$ npm run insert-data
```

Restart database
```
$ npm run drop-db
$ npm run migrations
```

#### Run Server
```
$ npm run dev
```

### Run Tests
```
$ npm run test:server
```


## Development

### Database
#### Adding New Model
- Make a new file in `./server/models` under the row name (singular table name)
- Create a function to return the table class
```
def [ROW_NAME_CAPITALIZED](db):
  class [ROW_NAME_CAPITALIZED](db.Model):
      __tablename__ = '[TABLE_NAME]'
      
     [COLUMNS AND RELATIONSHIPS]
     
  return [ROW_NAME_CAPITALIZED]
```
- Add the model to the `db` class
Import the function
In `./server/models/__init__.py` add the following under `# models`
```
[ROW_NAME_CAPITALIZED] = [ROW_NAME_CAPITALIZED](sql)
```

#### Adding Migration
```
$ npm run revision '[REVISION TITLE]'
```


### API Endpoints

#### Adding an endpoint
For large endpoint paths, we should create a separate file to hold the endpoints. For example, `/api/user` has it's own file.
To create a new subpath file:
- Go to the nearest parent path directory and create a new directory with the name of the subpath you're creating
- Create a file in that directory with the same name
- All endpoints need the following modules
```
from flask import request, jsonify
from server.routes.nested_blueprints impport NestedBlueprint
from server import db
```
- Create the blueprint
```
[SUBPATH_NAME]_bp = NestedBlueprint('[SUBPATH_NAME]', __name__)
```
- Add the blueprint to your path's parent
```
from .[SUBPATH_NAME] import [SUBPATH_NAME]

[PARENT_PATH_NAME]_bp.register_blueprint([SUBPATH_NAME].[SUBPATH_NAME]_bp)
```
- Now you can create endpoints in your subpath file by create functions with the decorator
```
@[SUBPATH_NAME]_bp.route('[TRAILING_PATH]', methods...)
```

### Adding Page
In `client/App.tsx`:
- Import the page function/class
- Add a new `Page` object to the html with the url path as the `path` prop and function/class as the `Subpage` prop

In `server/routes/__init__.py`:
- Add the following decorator to before the `index` function
```
@app_bp.route([PATH])
```
