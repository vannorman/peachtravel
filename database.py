import sqlite3
from os import environ as env
from dotenv import find_dotenv, load_dotenv

ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)
else:
    print("NO ENV FILE")

DB_NAME=env.get("DB_FILE")

import os


def setup():
    current_working_directory = os.getcwd()
    print(current_working_directory)
    print("DB:"+str(DB_NAME))
    conn = sqlite3.connect(DB_NAME)  
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            trip_name TEXT NOT NULL,
            trip_json TEXT NOT NULL,
            user_id INTEGER,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')

    conn.commit()
    conn.close()

def get_or_create_user(new_user_id):
    conn = sqlite3.connect(DB_NAME)  
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (new_user_id,))
    user = cursor.fetchone()

    
    if user is None:
        cursor.execute('INSERT INTO users (email) VALUES (?)', (new_user_id,))
        conn.commit()
        user_id = cursor.lastrowid
        print("CREATED: "+new_user_id+" with id: "+str(user_id))
    else:
        user_id = user[0] 
        print("EXISTS: "+new_user_id+" with id: "+str(user[0]))

    cursor.execute('SELECT * FROM users WHERE email = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return user


def get_trip(user_id, trip_name):
    conn = sqlite3.connect(DB_NAME)  
    cursor = conn.cursor()
    cursor.execute('SELECT trip_json FROM trips WHERE user_id = ? AND trip_name = ?', (user_id,trip_name))
    trip = cursor.fetchone()
    conn.close()
    return trip


def get_trips_for_user(user_id):
    print("Gettin trips:"+user_id)
    conn = sqlite3.connect(DB_NAME)  
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (user_id,))
    user = cursor.fetchone()
    print("user:"+str(user[0]))
    trips = []

    if user:
        # get table column names so that our return object has keys
        cursor.execute("PRAGMA table_info(trips)")
        columns = [column[1] for column in cursor.fetchall()]

        # get data from table 
        cursor.execute('SELECT * FROM trips WHERE user_id = ?', (user_id,))
        trips = cursor.fetchall()

        trip_list = [dict(zip(columns, trip)) for trip in trips]

        print("got trip! "+str(trips))
        conn.close()
        return trip_list
    else:
        conn.close()
        print("NO SUCH USER: "+user_id)


def create_or_update_trip(user_id, trip_name, trip_json):
    conn = sqlite3.connect(DB_NAME)  
    cursor = conn.cursor()
    # Check if the trip with the same title already exists
    cursor.execute('SELECT * FROM trips WHERE user_id = ? AND trip_name = ?', (user_id, trip_name))
    existing_trip = cursor.fetchone()

    if existing_trip:
        # Update the existing trip with the same title
        cursor.execute('UPDATE trips SET trip_name = ?, trip_json = ? WHERE id = ?', (trip_name, trip_json, existing_trip[0]))
        conn.commit()
        trip_id = existing_trip[0]
    else:
        
        cursor.execute('INSERT INTO trips (trip_name, trip_json, user_id) VALUES (?, ?, ?)', (trip_name, trip_json, user_id))
        conn.commit()
        trip_id = cursor.lastrowid
    conn.close()

    return trip_id

def delete_trip(user_id, trip_name):
    conn = sqlite3.connect(DB_NAME)  
    cursor = conn.cursor()
    # Check if the trip with the same title already exists
    cursor.execute('SELECT * FROM trips WHERE user_id = ? AND trip_name = ?', (user_id, trip_name))
    existing_trip = cursor.fetchone()

    if existing_trip:
        # Update the existing trip with the same title
        cursor.execute('DELETE FROM trips WHERE user_id = ? AND trip_name = ?', (user_id, trip_name))
        conn.commit()
        conn.close()
        return "Successfully deleted trip: "+trip_name+" from "+user_id
    else:
        conn.close()
        return "No trip with name: "+trip_name+" exists for user: "+user_id

def check_trip_exists(user_id, trip_name):
    conn = sqlite3.connect(DB_NAME)  
    cursor = conn.cursor()
    # Check if the trip with the same title already exists
    cursor.execute('SELECT * FROM trips WHERE user_id = ? AND trip_name = ?', (user_id, trip_name))
    existing_trip = cursor.fetchone()

    if existing_trip:
        conn.close()
        return True
    else:
        conn.close()
        return False
        # Update the existing trip with the same title

