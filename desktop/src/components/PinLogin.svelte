<script lang="ts">
  let pin = '';
  let selectedUser = 'user1'; // Mock user

  const users = [
    { id: 'user1', name: 'Jane Cashier' },
    { id: 'user2', name: 'John Manager' },
  ];

  function handleKeyPress(key: string) {
    if (pin.length < 4) {
      pin += key;
    }
  }

  function clearPin() {
    pin = '';
  }

  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  async function login() {
    if (pin.length !== 4) return;

    const apiBaseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:4001';

    try {
      const response = await fetch(`${apiBaseUrl}/auth/pin-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          pin: pin,
          deviceId: 'desktop-01', // Mock device ID
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        dispatch('loginsuccess');
      } else {
        alert('Login failed!');
        clearPin();
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Could not connect to the server.');
    }
  }
</script>

<div class="pin-login-container">
  <h2>PIN Login</h2>

  <div class="user-selection">
    <label for="user-select">Select User:</label>
    <select id="user-select" bind:value={selectedUser}>
      {#each users as user}
        <option value={user.id}>{user.name}</option>
      {/each}
    </select>
  </div>

  <div class="pin-display">
    <div class="pin-dot" class:filled={pin.length >= 1}></div>
    <div class="pin-dot" class:filled={pin.length >= 2}></div>
    <div class="pin-dot" class:filled={pin.length >= 3}></div>
    <div class="pin-dot" class:filled={pin.length >= 4}></div>
  </div>

  <div class="keypad">
    <button on:click={() => handleKeyPress('1')}>1</button>
    <button on:click={() => handleKeyPress('2')}>2</button>
    <button on:click={() => handleKeyPress('3')}>3</button>
    <button on:click={() => handleKeyPress('4')}>4</button>
    <button on:click={() => handleKeyPress('5')}>5</button>
    <button on:click={() => handleKeyPress('6')}>6</button>
    <button on:click={() => handleKeyPress('7')}>7</button>
    <button on:click={() => handleKeyPress('8')}>8</button>
    <button on:click={() => handleKeyPress('9')}>9</button>
    <button class="action" on:click={clearPin}>Clear</button>
    <button on:click={() => handleKeyPress('0')}>0</button>
    <button class="action" on:click={login}>Enter</button>
  </div>
</div>

<style>
  /* Styles for the PIN Login component */
  .pin-login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 320px;
    margin: auto;
    padding: 2rem;
    background-color: #2c2c2c;
    border-radius: 8px;
  }
  .user-selection {
    margin-bottom: 1.5rem;
    width: 100%;
  }
  select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 4px;
  }
  .pin-display {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .pin-dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #444;
  }
  .pin-dot.filled {
    background-color: #0047FF;
  }
  .keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    width: 100%;
  }
  button {
    padding: 1.5rem;
    font-size: 1.5rem;
    border: 1px solid #444;
    border-radius: 8px;
    background-color: #3a3a3a;
    cursor: pointer;
  }
  .action {
    background-color: #0047FF;
  }
</style>
