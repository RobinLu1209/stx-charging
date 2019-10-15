from flask import Flask, request, json
import os
import pymysql

app = Flask(__name__)
last_time = 0
this_time = 0

@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response

@app.route('/sendHistory',methods=['GET'])
def send_history():
    print("In send history function...")
    db = pymysql.connect(
        host='localhost',
        port=3306,
        user='test',
        passwd='123',
        db='charger_demo',
        charset='utf8'
    )
    cursor = db.cursor()
    # Record the LINES in TABLE
    this_time = cursor.execute("SELECT * from charger_information")
    if(last_time == 0):
        data = cursor.fetchall()
    elif(this_time > last_time):
        select_sql = "SELECT * from charger_information where list_id = (%s)"
        cursor.execute(select_sql%(this_time))
        data = cursor.fetchone()
    else:
        null_tuple = ("null",)
        data = null_tuple
    last_time = this_time
    return list(data)

if __name__ == '__main__':
    app.run(debug=True)
