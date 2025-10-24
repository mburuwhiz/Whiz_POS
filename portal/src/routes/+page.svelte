<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  let email = '';
  let password = '';
  let error = '';

  const apiBaseUrl = 'http://localhost:4001'; // This should be in an env file

  async function login() {
    error = '';
    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('portal_token', data.access_token);
        goto('/dashboard/businesses');
      } else {
        error = 'Invalid credentials';
      }
    } catch (e) {
      error = 'Could not connect to the server.';
    }
  }
</script>

<div class="login-container">
  <h1>Whiz Cloud Portal</h1>
  <form on:submit|preventDefault={login}>
    <input type="email" placeholder="Email" bind:value={email} required />
    <input type="password" placeholder="Password" bind:value={password} required />
    <button type="submit">Login</button>
    {#if error}
      <p class="error">{error}</p>
    {/if}
  </form>
</div>

<style>
  .login-container {
    max-width: 400px;
    margin: 5rem auto;
    text-align: center;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .error {
    color: red;
  }
</style>
