from flask import Flask,abort, redirect, url_for,session,render_template, jsonify
from flask import request
import datetime
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
from flask import Response

config = ".env" if os.path.exists(".env") else "example.env"
load_dotenv(dotenv_path=config)

SendGridKey=os.getenv("SendGridKey")
nse=[]
final=[]
app = Flask(__name__, static_url_path='/static')
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/APIKey',methods=['POST'])
def login():
    toEmail=request.form["toEmail"]
    data=request.form["data"]
    print(toEmail)
    print(data)

    message = Mail(
        from_email='searchtap.team@gmail.com',
        to_emails=toEmail,
        subject='Copied URLS from SearchTap',
        html_content=data)
    try:
        sg = SendGridAPIClient(SendGridKey)
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
    
    except Exception as e:
        print(e.message)
        return e.message
    
    return "Sent"

@app.route('/advanced',methods=['POST','GET'])
def advanced():
    print("advanced")
    final=request.form["selectedText"]
    print(final)
    return render_template("advanced.html",final=final)


if __name__ == '__main__':
    app.run(debug=True)