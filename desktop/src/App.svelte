<script lang="ts">
  import { onMount } from 'svelte';
  import PinLogin from './components/PinLogin.svelte';
  import PosTerminal from './components/PosTerminal.svelte';
  import DeviceSetup from './components/DeviceSetup.svelte';
  import Header from './components/Header.svelte';
  import type { User } from '../../shared/models/User';

  let appState: 'setup' | 'login' | 'pos' = 'setup';
  let currentUser: User | null = null;

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

  function handleLoginSuccess(event) {
    currentUser = event.detail.user;
    appState = 'pos';
  }

  function handleLogout() {
    localStorage.removeItem('token');
    currentUser = null;
    appState = 'login';
  }
</script>

{#if appState === 'pos'}
  <Header loggedInUser={currentUser} on:logout={handleLogout} />
  <main class="pos-view">
    <PosTerminal />
  </main>
{:else}
  <main class="centered-view">
    {#if appState === 'setup'}
      <DeviceSetup on:linksuccess={handleLinkSuccess} />
    {:else if appState === 'login'}
      <PinLogin on:loginsuccess={handleLoginSuccess} />
    {/if}
  </main>
{/if}

<style>
  .centered-view {
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .pos-view {
    height: calc(100vh - 60px); /* Full height minus header */
  }
</style>
