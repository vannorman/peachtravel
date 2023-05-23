from django.shortcuts import render
from django.shortcuts import redirect
from peach_travel.util import *
import sqlite3

def party(request):
    return redirect("https://docs.google.com/forms/d/e/1FAIpQLScHjksqOaBXrBiPuGtu6W5v1tSK9NE_YJr9xjjTkINkhQR9lA/viewform?usp=sf_link")

def simple_page(template):
    def handler(request):
        context = {}
        return render(request,template,context)
    return handler


def main(request):
    obj = {}
    obj['works'] = []
    obj['works'].append({
        "title" : "Test",
        "content" : { "header": "content", "img" : "img.jpg" },
        })
    return renderWithNav(request,'index.html', obj)

db_file = "ourplan.db" 
def load(request):
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        success = False
        data = {"success":False}

        conn = create_or_open_db(db_file)
#        cursor = conn.execute("SELECT * FROM users;")
#        users = cursor.fetchall()
#        users_string = "\n".join([str(user) for user in users])
#        cursor = conn.execute("SELECT * FROM trips;")
#        trips = cursor.fetchall()
#        trips_string = "\n".join([str(trip) for trip in trips])

       
        cursor = conn.execute("SELECT trip_json FROM trips ORDER BY id DESC LIMIT 1;")
        trip_json = cursor.fetchall();

        success = True
        return JsonResponse({
            'success':success,
#            'users':users_string,
            'trip_json':trip_json,
            })

def save(request):
    # We need to save whatever data the user entered into SQLite
    if request.method == "POST": #and request.headers.get("contentType": "application/json"):
        data = json.loads(request.POST.get('data'))
        # print(data['first_name'])
        conn = create_or_open_db(db_file)
        cur = conn.cursor()
#        cur.execute("INSERT INTO users (first_name, last_name) VALUES (?, ?)", (data['first_name'],data['last_name']) )
        cur.execute("INSERT INTO trips (trip_name, trip_json) VALUES (?, ?)", (data['trip_name'],data['trip_json']) )
#        cur.execute(sql, values) # execute the SQL statement with the tuple of values
        conn.commit()
        conn.close()
        success=True
        
        return JsonResponse({
            'success':success,
        })
    else: 
        print("save fail")


