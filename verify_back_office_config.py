import time
import os
import subprocess
import signal

print("Starting back-office server...")

# Test 1: No MONGODB_URI -> Fallback
# We expect it to log "MongoDB Connected (Temporary In-Memory)"
proc = subprocess.Popen(
    ["node", "server.js"],
    cwd="back-office",
    env={},
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True,
    bufsize=1  # Line buffered
)

# Wait a bit for startup
time.sleep(10)

# Terminate
proc.send_signal(signal.SIGINT)
try:
    stdout, stderr = proc.communicate(timeout=5)
except subprocess.TimeoutExpired:
    proc.kill()
    stdout, stderr = proc.communicate()

print("STDOUT:", stdout)
print("STDERR:", stderr)

if "MongoDB Connected (Temporary In-Memory)" in stdout:
    print("SUCCESS: Fallback worked as expected when no URI provided.")
else:
    print("FAILURE: Fallback message not found.")
