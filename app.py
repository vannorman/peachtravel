from flask import Flask, render_template
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def hello():
    now = datetime.now()
    return render_template('index.html', now=now)
    return 'Hello, World!'

if __name__ == '__main__':
    app.run()

