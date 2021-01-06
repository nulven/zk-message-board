from .default_config import Config as DefaultConfig
import os
from dotenv import load_dotenv
load_dotenv()

class Config(DefaultConfig):
    DEVELOPMENT=True
