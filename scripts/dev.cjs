const inquirer = require('inquirer');
const { spawn } = require('child_process');

async function startDev() {
  console.clear();
  console.log('\x1b[36m%s\x1b[0m', '=== Whiz POS Development Mode ===');
  console.log('Select the instance type you want to run for local testing.\n');

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'mode',
      message: 'Which mode do you want to launch?',
      choices: [
        { name: '🖥️  Main Server (Port 3000, instance-server DB)', value: 'server' },
        { name: '📱 Checkout Outlet (Port 3001, instance-outlet DB)', value: 'outlet' },
        { name: '❌ Cancel', value: 'cancel' }
      ],
    }
  ]);

  if (answers.mode === 'cancel') {
    console.log('Cancelled.');
    process.exit(0);
  }

  const scriptToRun = answers.mode === 'server' ? 'dev:server' : 'dev:outlet';

  console.log(`\nStarting ${answers.mode.toUpperCase()} instance...`);

  const child = spawn('npm', ['run', scriptToRun], {
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (error) => {
    console.error(`Error starting process: ${error.message}`);
  });

  child.on('exit', (code, signal) => {
    if (code !== 0) {
      console.log(`Process exited with code ${code} and signal ${signal}`);
    }
  });
}

startDev();