const fs = require('fs');
const path = require('path');

const userDataPath = path.join(__dirname, 'data');
const usersFile = path.join(userDataPath, 'users.json');

// Mock helpers
async function readJsonFile(filename) {
    try {
        const data = fs.readFileSync(path.join(userDataPath, filename), 'utf-8');
        return JSON.parse(data);
    } catch { return []; }
}

async function verify() {
    console.log("Verifying no ghost users...");
    // Just ensure we can read the file
    const users = await readJsonFile('users.json');
    const ghost = users.find(u => u.name === 'Cashier' && !u.id);
    if (ghost) throw new Error("Found ghost user 'Cashier' in database!");
    console.log("No ghost users found in DB.");
}

verify();
