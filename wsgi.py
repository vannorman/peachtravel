#!/usr/bin/python
import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/home/ubuntu/peach.travel/")
sys.path.insert(0,"/home/ubuntu/peach.travel/venv/lib/python3.8/site-packages")
from peach_travel.app import app as application
application.secret_key = "108436f942382b79b5b7ca43dece041d5b80d51cfc68c685a67a569addc1a0ef"

