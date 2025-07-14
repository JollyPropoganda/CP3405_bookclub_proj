import os
import sys
import time
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Force stdout to be unbuffered with UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)

class JSONChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith("mock.json"):
            print("[🔄] mock.json changed, updating database...", flush=True)
            try:
                # Replace this with your actual update function call
                print("Update_json.py is running!!!", flush=True)
            except Exception as e:
                print(f"[❌] Error updating database: {e}", flush=True)

def start_watching():
    # Confirm current working directory
    print(f"[👁️] Current working directory: {os.getcwd()}", flush=True)

    # Adjust this path to wherever your mock.json really is, relative to cwd
    watch_path = os.path.abspath(os.path.join(os.getcwd(), "routes"))
    print(f"[👁️] Watching for changes in: {watch_path}", flush=True)

    event_handler = JSONChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, watch_path, recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    try:
        start_watching()
    except Exception as e:
        print(f"[ERROR] Watcher crashed: {e}", flush=True)