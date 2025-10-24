<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let loggedInUser: { name: string } | null = null;

  const dispatch = createEventDispatcher();

  function handleLogout() {
    dispatch('logout');
  }
</script>

<header class="pos-header">
  <div class="logo">WHIZ POS</div>
  <div class="user-info">
    {#if loggedInUser}
      <span>Welcome, {loggedInUser.name}</span>
    {/if}
    <button class="nav-btn" on:click={() => dispatch('navigate', 'productManagement')}>Product Management</button>
    <button class="nav-btn" on:click={() => dispatch('navigate', 'creditSettlement')}>Credit Settlement</button>
    <button class="nav-btn" on:click={() => dispatch('navigate', 'endOfDaySummary')}>End of Day Summary</button>
    <button class="nav-btn" on:click={() => dispatch('navigate', 'superadmin')}>Super Admin</button>
    <button on:click={handleLogout}>Logout</button>
  </div>
</header>

<style>
  .pos-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.5rem;
    height: 60px;
    background-color: #1e1e1e;
    color: white;
    border-bottom: 1px solid #444;
  }
  .logo {
    font-weight: bold;
    font-size: 1.5rem;
    color: #0047FF;
  }
  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  button {
    padding: 0.5rem 1rem;
    background-color: #dc3545;
    border-radius: 4px;
    cursor: pointer;
    border: none;
    color: white;
  }
  .nav-btn {
    background-color: #007bff;
  }
</style>
