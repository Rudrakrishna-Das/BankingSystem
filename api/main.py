import bcrypt
from db import DATABASE
from flask_cors import CORS
from flask import Flask,jsonify,request
from helper import generate_account_number,error_message


app = Flask(__name__)
CORS(app)

# DATABASE CREATED
col = DATABASE()



@app.route('/sign-up',methods=['POST'])
def message():
    data = request.get_json()    
    user = col.user_collection.find_one({'email':data['email']})
    if user != None:
        return jsonify(error_message(message='Email alredy exist. Please try again with another email')),409
    
    account_number = col.user_collection.find_one({'account no.':generate_account_number()})
    if account_number != None:
        data['account no.'] = generate_account_number() + 1
    else:
        data['account no.'] = generate_account_number()

    data['transaction'] = []
    data['password'] = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
    col.user_collection.insert_one(data)
    return jsonify({'success':True,'message':'Account open Successful. Please Go to sigh in page to SIGN IN to your account'}),200




app.run(debug=True)