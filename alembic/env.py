import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

# alembic.ini uses the following config keys for python:
config_ini = {
    "sqlalchemy": {
        "url": os.getenv("DATABASE_URL", "sqlite:///./crmsqlite.db"),
    }
}

# Set of all the environment variables that shouldn't be passed to the DBAPI.
env_vars = {"PASSWORD"}

if config_ini["sqlalchemy"]["url"].startswith("sqlite://"):
    pass
else:
    config_ini["sqlalchemy"]["connect_args"] = {k: v for k, v in os.environ.items() if k not in env_vars}

config_file_name = "alembic.ini"
if config_ini["sqlalchemy"]["url"].startswith("sqlite://"):
    config_file_name = "alembic.sqlite.ini"

fileConfig(config_ini, config_file_name)

from sqlalchemy import engine_from_config

config = config_ini["sqlalchemy"]
target_metadata = None

def run_migrations_offline():
    url = config["url"]
    if target_metadata is not None:
        bindable = engine_from_config(config, connect_args={})
        target_metadata.bind = bindable

    url += "?map_uri=True"
    from alembic import command
    command.main(["upgrade"], uri=url)

def run_migrations_online():
    if target_metadata is not None:
        bindable = engine_from_config(config, connect_args={})
        target_metadata.bind = bindable

    with engine_from_config(config) as connection:
        from alembic.operation import op
        op.init_db(connection)
        op.run_migrations(target_metadata)

def run_migrations(connection):
    if target_metadata is not None:
        target_metadata.bind = connection

    with connection.begin() as transaction:
        from alembic.operation import op
        op.run_migrations(target_metadata)

if __name__ == "__main__":
    run_migrations_offline()
