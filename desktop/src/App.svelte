<script lang="ts">
  import { onMount } from 'svelte';
  import PinLogin from './components/PinLogin.svelte';
  import PosTerminal from './components/PosTerminal.svelte';
  import DeviceSetup from './components/DeviceSetup.svelte';
  import Header from './components/Header.svelte';
  import SuperAdmin from './components/SuperAdmin.svelte';
  import type { User } from '../../shared/models/User';

  let appState: 'setup' | 'login' | 'pos' | 'superadmin' = 'setup';
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

  function handleNavigate(event) {
    appState = event.detail;
  }
</script>

{#if appState === 'pos' || appState === 'superadmin'}
  <Header loggedInUser={currentUser} on:logout={handleLogout} on:navigate={handleNavigate} />
  <main class="pos-view">
    {#if appState === 'pos'}
      <PosTerminal />
    {:else if appState === 'superadmin'}
      <SuperAdmin />
      <button class="nav-btn-back" on:click={() => appState = 'pos'}>Back to POS</button>
    {/if}
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
