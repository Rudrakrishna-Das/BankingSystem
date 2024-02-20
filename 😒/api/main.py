import os
import jwt
import bcrypt
from db import DATABASE
from bson import ObjectId
from flask_cors import CORS
from flask import Flask,jsonify,request,session
from dotenv import find_dotenv,load_dotenv
from helper import generate_account_number,share_message

dotenv_path = find_dotenv()
load_dotenv(dotenv_path)


app = Flask(__name__)
CORS(app,supports_credentials=True)
app.secret_key = os.getenv('SESSION_SECRET')

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
        data['account no.'] = generate_account_number() + 1
    else:
        data['account no.'] = generate_account_number()

    data['transaction'] = []
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
    session['token'] = token
    res = jsonify(user)   
    res.set_cookie('token',token,samesite='None',secure=True)
    return res

#USER
@app.route('/user',methods = ['GET'])
def user_info():
    
    print(request.cookies)
    return jsonify({'got':'all'})
    
    # try:
    #     decode = jwt.decode(token,os.getenv('SECRET_KEY'),os.getenv('ALGORITHM'))
    # except:
    #     return jsonify(share_message(success=False,message='Unauthorized'))
    
    # user =  col.user_collection.find_one({'_id':ObjectId(decode['id'])})
    # user['_id'] = str(user['_id'])
    # del user['password']
    # user['status'] = True




app.run(debug=True)