from watchdog.observers.polling import PollingObserver
from watchdog.events import FileSystemEventHandler
import time
import os

class Handler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith("mock.json"):
            print("🔄 mock.json was modified!")

if __name__ == "__main__":
    path = os.path.abspath("routes")
    print(f"👁️ Watching: {path}")
    observer = PollingObserver()
    observer.schedule(Handler(), path=path, recursive=False)
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()