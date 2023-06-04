inotifywait -e close_write,moved_to,create -m . |
while read -r . events filename; do
  if [ "$filename" = "myfile.py" ]; then
    ./myfile.py
  fi
done


