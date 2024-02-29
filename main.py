import os
import jwt
import bcrypt
import smtplib
from datetime import datetime
from db import DATABASE
from bson import ObjectId
from flask_cors import CORS
from flask import Flask,jsonify,request
from dotenv import find_dotenv,load_dotenv
from helper import generate_account_number,share_message,verify_user,generate_pin

dotenv_path = find_dotenv()
load_dotenv(dotenv_path)


app = Flask(__name__)
CORS(app,supports_credentials=True)

# DATABASE CREATED
col = DATABASE()

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://127.0.0.1:5500')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type') 
    return response

# SIGN_UP
@app.route('/sign-up',methods=['POST'])
def sign_up():
    data = request.get_json()    
    user = col.user_collection.find_one({'email':data['email']})
    if user != None:
        return jsonify(share_message(success=False,message='Email alredy exist. Please try again with another email')),409
    
    account_number = col.user_collection.find_one({'account no.':generate_account_number()})
    if account_number != None:
        data['accountNo'] = str(generate_account_number() + 1)
    else:
        data['accountNo'] = str(generate_account_number())

    data['transaction'] = []
    data['account_balance'] = 0
    data['password'] = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    col.user_collection.insert_one(data)
    return jsonify(share_message(success=True,message='Account open Successful. Please Go to sigh in page to SIGN IN to your account')),200


# SIGN-IN
@app.route('/sign-in',methods=['POST','GET'])
def sign_in():
    # 
    data = request.get_json()

    user = col.user_collection.find_one({'email':data['email']})
    
    if user == None:
        return jsonify(share_message(success=False,message='Please Check your email id and try Again!'))
    if not bcrypt.checkpw(data['password'].encode('utf-8'),user['password']):
        return jsonify(share_message(success=False,message='Please check your password and try Again!'))
    del user['password']
    token = jwt.encode({'id':str(user['_id'])},os.getenv('SECRET_KEY'),os.getenv('ALGORITHM'))

    user['_id'] = str(user['_id'])
    user['success'] = True
    res = jsonify(user)   
    res.set_cookie('token',token,samesite='None',secure=True,path='/')
    return res

#USER
@app.route('/user',methods = ['GET'])
def user_info():   
    token = request.cookies.get('token') 
    decode = verify_user(token)
    if decode == False:    
        return jsonify(share_message(success=False,message='Unauthorized'))
    
    user =  col.user_collection.find_one({'_id':ObjectId(decode['id'])})
    user['success'] = True
    del user['password']
    del user['_id']
    del user['email']
    return jsonify(user)


#TRANSACTION
@app.route('/user/<type>',methods=['POST','GET'])
def transaction(type):
    token = request.cookies.get('token') 
    
    decode = verify_user(token)
    if decode == False:    
        return jsonify(share_message(success=False,message='Unauthorized'))
    
    data = request.get_json()
    current_date = datetime.now().strftime("%d/%m/%Y")
    if type == 'deposit':
        deposit_data = {
            'date':current_date,
            'description':'Deposit',
            'value': data['value']
        }
        filter = {'_id':ObjectId(decode['id'])}
        user = col.user_collection.find_one(filter)
        user['transaction'].append(deposit_data)
        user['account_balance'] = float(user['account_balance']) + float(deposit_data['value'])
        
        col.user_collection.update_one(filter,{'$set':{'transaction':user['transaction'],'account_balance':user['account_balance']}})
        return jsonify(share_message(success=True,message=f"You deposited {deposit_data['value']} rupees!"))
   
    if type == 'withdraw':
        withdraw_data = {
            'date':current_date,
            'description':'Withdraw',
            'value': data['value']
        }
        filter = {'_id':ObjectId(decode['id'])}
        user = col.user_collection.find_one(filter)
        if float(user['account_balance']) == 0 or float(user['account_balance']) - float(withdraw_data['value']) < 0:
            return jsonify(share_message(success=False,message="You don't have enough money to withdraw!"))
        
        user['transaction'].append(withdraw_data)
        user['account_balance'] = float(user['account_balance']) - float(withdraw_data['value'])
        
        col.user_collection.update_one(filter,{'$set':{'transaction':user['transaction'],'account_balance':user['account_balance']}})
        return jsonify(share_message(success=True,message=f"You withdrawed {withdraw_data['value']} rupees!"))
    if type == 'transfer':
        transfer_data = {
            'date':current_date,
            'description':"Transfer",
            'value': data['value'],
            'account_no' : data['accountNo']
        }
        filter = {'_id':ObjectId(decode['id'])}
        user = col.user_collection.find_one(filter)

        if float(user['account_balance']) == 0 or float(user['account_balance']) - float(transfer_data['value']) < 0:
            return jsonify(share_message(success=False,message="You don't have enough money to transfer!"))
        
        
        transfer_filter = {'accountNo': transfer_data['account_no']}
        transfer_account = col.user_collection.find_one(transfer_filter)

        if transfer_account == None:
            return jsonify(share_message(success=False,message='Please check your provided account number'))
        if str(transfer_account['_id']) == str(user['_id']):
            return jsonify(share_message(success=False,message='You cannot transfer to your own account'))
        
        del transfer_data['account_no']

        transfer_data['description'] = f"Transfer to {transfer_account['userName']}"
        user['transaction'].append(transfer_data)
        user['account_balance'] = float(user['account_balance']) - float(transfer_data['value'])
        col.user_collection.update_one(filter,{'$set':{'transaction':user['transaction'],'account_balance':user['account_balance']}})

        transfer_data['description'] = f"Transfer from {user['userName']}"
        transfer_account['transaction'].append(transfer_data)
        transfer_account['account_balance'] = float(transfer_account['account_balance']) + float(transfer_data['value'])
        col.user_collection.update_one(transfer_filter,{'$set':{'transaction':transfer_account['transaction'],'account_balance':transfer_account['account_balance']}})
        
        return jsonify(share_message(success=True,message=f"You Transferred {data['value']} to {transfer_account['userName']}"))
        

#PROFILE
@app.route('/profile',methods=['GET'])
def profile():
    token = request.cookies.get('token')
    
    decode = verify_user(token)
    
    if decode == False:    
        return jsonify(share_message(success=False,message='Unauthorized'))
    
    filter = {'_id':ObjectId(decode['id'])}
    user = col.user_collection.find_one(filter)
    del user['password']
    del user['_id']
    del user['account_balance']
    del user['transaction']
    user['status'] = True

    return jsonify(user)

#UPDATE
@app.route('/update',methods=['POST'])
def update():
    token = request.cookies.get('token') 

    decode = verify_user(token)
    if decode == False:    
        return jsonify(share_message(success=False,message='Unauthorized'))
    
    form_data = request.get_json()

    if form_data['userName'].strip() == '':
        del form_data['userName']
    if form_data['email'].strip() == '':
        del form_data['email']
    if form_data['password'].strip() == '':
        del form_data['password']
    
    filter = {'_id':ObjectId(decode['id'])}
    user = col.user_collection.find_one(filter)
    chnaged_data = {}

    for key in form_data:
        if form_data[key] != user[key]:
            chnaged_data[key] = form_data[key]

    if 'password' in form_data:
        chnaged_data['password'] = bcrypt.hashpw(form_data['password'].encode('utf-8'), bcrypt.gensalt())

    if 'email' in chnaged_data.keys():
        email_filter = {'email':chnaged_data['email']}
        email_found = col.user_collection.find_one(email_filter)
        if email_found != None:
            return jsonify(share_message(success=False,message='Email alredy exist please try another'))

    data_changed = bool(chnaged_data)
    del user['password']
    del user['_id']
    if data_changed:       
        col.user_collection.update_one(filter,{'$set':chnaged_data})
        return jsonify(share_message(success=True,message='Updated Successfully'))
    else :
        return jsonify(user,share_message(success=False,message='You have Nothing to update'))
pin = ''
email = ''
#FORGOT PASSWORD
@app.route('/forgot-password',methods=['POST'])
def forgot_password():
    global pin,email
    email = request.get_json()
    filter = {'email':email['email']}
    user = col.user_collection.find_one(filter)
    email = user['email']
    if user == None:
        return jsonify(share_message(success=False,message='No user found. Please check your email'))
    pin = generate_pin()
    my_email = os.getenv('MY_EMAIL')
    my_password = os.getenv('PASSWORD')
    to_send = user['email']

    connection = smtplib.SMTP('smtp.gmail.com',port=587)
    connection.starttls()
    connection.login(user=my_email,password=my_password)
    connection.sendmail(from_addr=my_email,to_addrs=to_send,msg=f"Subject:OTP pin\n\n{pin}")
    
    return jsonify(share_message(success=True,message='user found'))

# MATCH PIN
@app.route('/pin-match',methods=['POST'])
def match_pin():
    global pin,email
    user_pin = request.get_json()
    if int(user_pin['userPin']) != pin:
        pin = ''
        email = ''
        return jsonify(share_message(success=False,message='Entered wrong pin'))    
    pin = ''
    return jsonify(share_message(success=True,message=''))

@app.route('/update-password',methods=['POST'])
def update_password():
    global email
    new_password = request.get_json()    
    new_password['newPassword'] = bcrypt.hashpw(new_password['newPassword'].encode('utf-8'), bcrypt.gensalt())
    
    col.user_collection.update_one({'email':email},{'$set':{'password':new_password['newPassword']}})
    return jsonify(share_message(success=True,message=''))
    






    


#LOGOUT
@app.route('/logout',methods=['GET'])
def logout():
    token = request.cookies.get('token') 

    decode = verify_user(token)
    if decode == False:    
        return jsonify(share_message(success=False,message='Unauthorized'))
    
    res = jsonify(share_message(success=True,message='Logout Successful'))
    res.set_cookie('token','',max_age=0,samesite='None')
    return res


# DELETE USER
@app.route('/delete-user',methods=['GET'])
def delete_user():
    token = request.cookies.get('token')
    decode = verify_user(token)
    if decode == False:
        return jsonify(share_message(success=False,message='Unauthorized'))
    
    filter = {'_id':ObjectId(decode['id'])}
    user = col.user_collection.find_one(filter)

    if float(user['account_balance']) > 0:
        return jsonify(share_message(success=False,message=f"You have rs {user['account_balance']:.2f}. Please withdraw that and then delete"))
    col.user_collection.delete_one(filter)
    res = jsonify(share_message(success=True,message=''))
    res.set_cookie('token','',max_age=0,samesite='None')
    return res
    
app.run(debug=True)