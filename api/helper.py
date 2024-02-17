import random
def generate_account_number ():
    return random.randint(1111111111,9999999999)

def share_message(success:bool,message:str):
    err_msg = {
        'success':success,
        'message':message
    }
    return err_msg
