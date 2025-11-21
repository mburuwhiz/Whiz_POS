import time
import os
import subprocess
import signal

print("Starting back-office server with INVALID URI...")

env = os.environ.copy()
env["MONGODB_URI"] = "mongodb://localhost:27999/test"

proc = subprocess.Popen(
    ["node", "server.js"],
    cwd="back-office",
    env=env,
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    bufsize=1
)

time.sleep(8) # Wait longer than 5s timeout

proc.kill()
stdout, stderr = proc.communicate()

print("STDERR Snippet:")
print(stderr)

if "CRITICAL: Failed to connect" in stderr:
    print("SUCCESS: Error caught and logged.")
elif "MongoDB Connected (Temporary In-Memory)" in stdout:
    print("FAILURE: It fell back to memory!")
else:
    print("FAILURE: Unknown state.")
