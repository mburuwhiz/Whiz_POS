<script lang="ts">
  import PinLogin from './components/PinLogin.svelte';

  let loggedIn = false;

  function handleLoginSuccess() {
    loggedIn = true;
  }
</script>

<main>
  {#if loggedIn}
    <h1>POS Terminal</h1>
    <p>Welcome!</p>
    <button on:click={() => { loggedIn = false; localStorage.removeItem('token'); }}>Logout</button>
  {:else}
    <PinLogin on:loginsuccess={handleLoginSuccess} />
  {/if}
</main>

<style>
  main {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }
</style>
