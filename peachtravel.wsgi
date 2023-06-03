#!/usr/bin/python
import sys
import logging
logging.basicConfig(stream=sys.stderr)
sys.path.insert(0,"/home/ubuntu/peachtravel/")
sys.path.insert(0,"/home/ubuntu/peachtravel/venv/lib/python3.8/site-packages")

from peachtravel import app as application
application.secret_key = "f48be930d0ed803a8f0a1c7b54b273c156c0e085458dca170b71cd56001c1699"

