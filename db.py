import os
from dotenv import find_dotenv,load_dotenv
from pymongo import MongoClient
dotenv_path = find_dotenv()
load_dotenv(dotenv_path)

class DATABASE():
    def __init__(self):
        client = MongoClient(os.getenv('MONGO_CLIENT'))
        self.db = client['BankingSystem']
        self.user_collection = self.db['user']






