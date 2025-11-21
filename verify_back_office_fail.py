import time
import os
import subprocess
import signal

print("Starting back-office server with INVALID URI...")

env = os.environ.copy()
env["MONGODB_URI"] = "mongodb://localhost:27017/nonexistent_db_should_fail" # Actually this might work if mongo is local.
# Let's use a bad port to force connection failure
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

time.sleep(5)

proc.kill()
stdout, stderr = proc.communicate()

print("STDOUT:", stdout)
print("STDERR:", stderr)

if "CRITICAL: Failed to connect" in stderr:
    print("SUCCESS: Error caught and logged.")
elif "MongoDB Connected (Temporary In-Memory)" in stdout:
    print("FAILURE: It fell back to memory even with explicit URI!")
else:
    print("INFO: Maybe it is still trying to connect? (Timeout is 5000ms)")
