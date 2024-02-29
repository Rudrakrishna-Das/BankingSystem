import os
import jwt
import random
from dotenv import find_dotenv,load_dotenv

dotenv_path = find_dotenv()
load_dotenv(dotenv_path)

def generate_account_number ():
    return random.randint(1111111111,9999999999)

def generate_pin():
    return random.randint(111111,999999)

def share_message(success:bool,message:str):
    err_msg = {
        'success':success,
        'message':message
    }
    return err_msg

def verify_user(token):
    try:
        decode = jwt.decode(token,os.getenv('SECRET_KEY'),os.getenv('ALGORITHM'))
        return decode
    except:
        return False
