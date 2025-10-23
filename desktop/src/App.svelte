<script lang="ts">
  import PinLogin from './components/PinLogin.svelte';

  let loggedIn = false;

  function handleLoginSuccess() {
    loggedIn = true;
  }
</script>

<script lang="ts">
  import PinLogin from './components/PinLogin.svelte';
  import PosTerminal from './components/PosTerminal.svelte';

  let loggedIn = false;

  function handleLoginSuccess() {
    loggedIn = true;
  }
</script>

<main>
  {#if loggedIn}
    <PosTerminal />
  {:else}
    <PinLogin on:loginsuccess={handleLoginSuccess} />
  {/if}
</main>

<style>
  main {
    height: 100vh;
    box-sizing: border-box;
  }
</style>
