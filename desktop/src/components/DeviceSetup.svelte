<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  let apiKey = '';
  let errorMessage = '';

  const dispatch = createEventDispatcher();
  const apiBaseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:4001';

  async function linkDevice() {
    errorMessage = '';
    if (!apiKey) {
      errorMessage = 'API Key cannot be empty.';
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/device/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          fingerprint: 'mock-fingerprint-desktop-01', // In a real app, this would be generated
          deviceType: 'desktop',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('deviceToken', data.deviceToken);
        dispatch('linksuccess');
      } else {
        const error = await response.text();
        errorMessage = `Failed to link device: ${error}`;
      }
    } catch (err) {
      errorMessage = 'Could not connect to the server. Please ensure it is running and accessible.';
    }
  }
</script>

<div class="device-setup-container">
  <h2>Device Setup</h2>
  <p>Please enter the API Key provided by your administrator to link this terminal to your business.</p>

  <div class="input-group">
    <label for="api-key">API Key:</label>
    <input type="text" id="api-key" bind:value={apiKey} placeholder="WHIZ-XXXXX" />
  </div>

  {#if errorMessage}
    <p class="error-message">{errorMessage}</p>
  {/if}

  <button on:click={linkDevice}>Link Device</button>
</div>

<style>
  .device-setup-container {
    display: flex;
    flex-direction: column;
    width: 400px;
    margin: auto;
    padding: 2rem;
    background-color: #2c2c2c;
    border-radius: 8px;
    text-align: center;
  }
  .input-group {
    width: 100%;
    margin: 1.5rem 0;
  }
  input {
    width: 100%;
    padding: 0.75rem;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .error-message {
    color: #dc3545;
  }
  button {
    padding: 1rem;
    font-size: 1.2rem;
    border-radius: 8px;
    background-color: #007bff;
    cursor: pointer;
  }
</style>
