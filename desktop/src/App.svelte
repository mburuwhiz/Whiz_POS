<script lang="ts">
  import { onMount } from 'svelte';
  import PinLogin from './components/PinLogin.svelte';
  import PosTerminal from './components/PosTerminal.svelte';
  import DeviceSetup from './components/DeviceSetup.svelte';

  let appState: 'setup' | 'login' | 'pos' = 'setup';

  onMount(() => {
    const deviceToken = localStorage.getItem('deviceToken');
    if (deviceToken) {
      appState = 'login';
    } else {
      appState = 'setup';
    }
  });

  function handleLinkSuccess() {
    appState = 'login';
  }

  function handleLoginSuccess() {
    appState = 'pos';
  }

  function handleLogout() {
    localStorage.removeItem('token');
    appState = 'login';
  }
</script>

<main>
  {#if appState === 'setup'}
    <DeviceSetup on:linksuccess={handleLinkSuccess} />
  {:else if appState === 'login'}
    <PinLogin on:loginsuccess={handleLoginSuccess} />
  {:else if appState === 'pos'}
    <PosTerminal />
    <!-- A proper logout button should be part of a persistent layout -->
    <button class="logout-btn" on:click={handleLogout}>Logout</button>
  {/if}
</main>

<style>
  main {
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  .logout-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    padding: 0.5rem 1rem;
    background-color: #dc3545;
    border-radius: 4px;
    cursor: pointer;
  }
</style>
