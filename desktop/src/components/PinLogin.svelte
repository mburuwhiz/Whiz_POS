<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import Swal from 'sweetalert2';
  import type { User } from '../../../shared/models/User';

  let pin = '';
  let selectedUser: string | null = null;
  let users: User[] = [];
  let showPin = false;
  let serverUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:4001';
  let connectionError = false;
  let customServerUrl = '';

  const dispatch = createEventDispatcher();

  onMount(async () => {
    try {
      const response = await fetch(`${serverUrl}/users`);
      if (response.ok) {
        users = await response.json();
        if (users.length > 0) {
          selectedUser = users[0]._id;
        }
      } else {
        connectionError = true;
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      connectionError = true;
    }
  });

  function handleKeyPress(key: string) {
    if (pin.length < 4) {
      pin += key;
    }
  }

  function clearPin() {
    pin = '';
  }

  async function login() {
    if (pin.length !== 4 || !selectedUser) return;

    try {
      const response = await fetch(`${serverUrl}/auth/pin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser,
          pin: pin,
          deviceId: 'desktop-01', // Mock device ID
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        dispatch('loginsuccess', { user: data.user });
        connectionError = false;
      } else {
        Swal.fire({
          title: 'Login Failed',
          text: 'Please check your PIN and try again.',
          icon: 'error',
        });
        clearPin();
      }
    } catch (error) {
      console.error('Login error:', error);
      connectionError = true;
      Swal.fire({
        title: 'Connection Error',
        text: 'Could not connect to the server. Please check the server address.',
        icon: 'error',
      });
    }
  }

  function useCustomServer() {
    serverUrl = customServerUrl;
    connectionError = false;
    // Retry fetching users with the new URL
    onMount();
  }
</script>

<div class="pin-login-container">
  {#if connectionError}
    <h2>Server Connection Failed</h2>
    <p>Please enter the address of your main POS server terminal.</p>
    <div class="custom-server-form">
      <input type="text" bind:value={customServerUrl} placeholder="http://192.168.1.100:4001" />
      <button on:click={useCustomServer}>Connect</button>
    </div>
  {:else}
    <h2>PIN Login</h2>

    <div class="user-selection">
      <label for="user-select">Select User:</label>
      <select id="user-select" bind:value={selectedUser}>
        {#each users as user}
          <option value={user._id}>{user.name}</option>
        {/each}
      </select>
    </div>

  <div class="pin-display-wrapper">
    <div class="pin-display">
      {#if showPin}
        <span class="pin-text">{pin}</span>
      {:else}
        <div class="pin-dot" class:filled={pin.length >= 1}></div>
        <div class="pin-dot" class:filled={pin.length >= 2}></div>
        <div class="pin-dot" class:filled={pin.length >= 3}></div>
        <div class="pin-dot" class:filled={pin.length >= 4}></div>
      {/if}
    </div>
    <button class="toggle-pin-visibility" on:mousedown={() => showPin = true} on:mouseup={() => showPin = false} on:mouseleave={() => showPin = false}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
    </button>
    </div>

    <div class="keypad">
      <!-- Keypad buttons -->
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
  {/if}
</div>

<style>
  /* Styles are the same as before */
  .custom-server-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }
  input {
    padding: 0.5rem;
    border-radius: 4px;
  }
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
  .pin-display-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  .pin-display {
    display: flex;
    gap: 1rem;
    min-width: 128px; /* 4 dots * 20px + 3 gaps * 1rem */
    justify-content: center;
  }
  .pin-text {
    font-size: 2rem;
    letter-spacing: 0.5rem;
  }
  .toggle-pin-visibility {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    color: white;
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
