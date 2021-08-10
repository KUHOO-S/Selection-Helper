from flask import Flask,abort, redirect, url_for,session,render_template
from flask import request
import datetime
app = Flask(__name__, static_url_path='/static')
xpage=""
text=""
final=[]
#pages=[]
@app.route('/')
def index():
    return render_template("index.html")

@app.route('/APIKey',methods=['POST'])
def login():
    secret=request.form["page"]
    return redirect(url_for('secretlog'))

@app.route('/secretlog')
def secretlog():
    print("IN secretlogOOO")
    return render_template("index.html",final=final)


if __name__ == '__main__':
    app.run(debug=True)