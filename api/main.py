import os
import jwt
import bcrypt
from datetime import datetime
from db import DATABASE
from bson import ObjectId
from flask_cors import CORS
from flask import Flask,jsonify,request
from dotenv import find_dotenv,load_dotenv
from helper import generate_account_number,share_message,verify_user

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
    data = request.get_json()

    user = col.user_collection.find_one({'email':data['email']})
    
    if user == None:
        return jsonify(share_message(success=False,message='Please Check your email id and try Again!'))
    if not bcrypt.checkpw(data['password'].encode('utf-8'),user['password']):
        return jsonify(share_message(success=False,message='Please check your password and try Again!'))
    del user['password']
    token = jwt.encode({'id':str(user['_id'])},os.getenv('SECRET_KEY'),os.getenv('ALGORITHM'))

    user['_id'] = str(user['_id'])
    user['status'] = True
    res = jsonify(user)   
    res.set_cookie('token',token,samesite='None',secure=True)
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

#LOGOUT
@app.route('/logout',methods=['GET'])
def logout():
    token = request.cookies.get('token') 

    decode = verify_user(token)
    if decode == False:    
        return jsonify(share_message(success=False,message='Unauthorized'))
    
    res = jsonify(share_message(success=True,message='Logout Successful'))
    res.set_cookie('token','',max_age=0,samesite='None',secure=True)
    print(request.cookies)
    return res

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
        



app.run(debug=True)