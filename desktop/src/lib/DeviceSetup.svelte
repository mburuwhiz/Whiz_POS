<script lang="ts">
  import { api } from './api';

  let apiKey = '';
  let isLoading = false;
  let errorMessage = '';

  // This gives us access to the methods exposed in the preload script.
  const electron = (window as any).electron;

  async function handleSubmit() {
    isLoading = true;
    errorMessage = '';

    try {
      const response = await api.linkDevice({
        apiKey,
        fingerprint: 'placeholder-fingerprint', // We will replace this later
        deviceType: 'desktop',
      });

      // Securely store the token using the main process.
      electron.storeToken(response.deviceToken);

      console.log('Device linked and token stored successfully!');

    } catch (error) {
      errorMessage = error.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<main>
  <div class="setup-container">
    <h1>Device Setup</h1>
    <p>Please enter the API key provided by your business administrator.</p>

    <form on:submit|preventDefault={handleSubmit}>
      <div class="input-group">
        <label for="apiKey">API Key</label>
        <input
          type="text"
          id="apiKey"
          bind:value={apiKey}
          placeholder="WHIZ-XXXXXXXXXX"
          disabled={isLoading}
        />
      </div>
      <button type="submit" class="submit-button" disabled={isLoading}>
        {#if isLoading}
          <span>Linking...</span>
        {:else}
          <span>Link Device</span>
        {/if}
      </button>
      {#if errorMessage}
        <p class="error-message">{errorMessage}</p>
      {/if}
    </form>
  </div>
</main>

<style>
  .setup-container {
    max-width: 400px;
    margin: 50px auto;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
  }
  h1 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  p {
    margin-bottom: 1.5rem;
    color: #666;
  }
  .input-group {
    margin-bottom: 1.5rem;
  }
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .submit-button {
    width: 100%;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    background-color: #0047FF; /* Royal Blue */
    color: white;
    font-size: 1rem;
    cursor: pointer;
  }
  .error-message {
    color: red;
    margin-top: 1rem;
  }
</style>
