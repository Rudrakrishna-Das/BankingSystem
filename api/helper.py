import random
def generate_account_number ():
    return random.randint(1111111111,9999999999)

def error_message(message):
    err_msg = {
        'success':False,
        'message':message
    }
    return err_msg
