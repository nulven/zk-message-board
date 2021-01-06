class Config():
    DEVELOPMENT=True
    SECRET_KEY="changethis"
    SQLALCHEMY_TRACK_MODIFICATIONS=False
    HOST="localhost"
    PORT=8080
    URL="http://localhost:8080"
    JSON_SORT_KEYS=False
    SEND_FILE_MAX_AGE_DEFAULT=0
    ALEMBIC={"script_location": "server:migrations"}
    SHOPIFY_API_KEY="12808a16e88e24c04c87f36f3ff7ad09"
    SHOPIFY_SECRET="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"
    SHOPIFY_ACCESS_TOKEN="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"
    SHOPIFY_HOSTNAME="abelianteststore.myshopify.com"
    SHOPIFY_VERSION="2020-07"
    SHOPIFY_URL="https://12808a16e88e24c04c87f36f3ff7ad09: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@abelianteststore.myshopify.com/admin/api/2020-07"
    SQLALCHEMY_DATABASE_URI="postgres://nulven:Nau39674@localhost:5432/shopify"
