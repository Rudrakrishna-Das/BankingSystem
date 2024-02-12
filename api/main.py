from flask import Flask,jsonify,request
from flask_cors import CORS
from db import DATABASE


app = Flask(__name__)
CORS(app)

# DATABASE CREATED
col = DATABASE()



# @app.route('/sign-up',methods=['POST'])
# def message():
#     data = request.get_json()


# app.run(debug=True)