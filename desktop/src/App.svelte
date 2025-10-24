<script lang="ts">
  import { onMount } from 'svelte';
  import DeviceSetup from './lib/DeviceSetup.svelte';

  let isDeviceLinked = false;
  const electron = (window as any).electron;

  onMount(async () => {
    // Check if a token is already stored.
    const token = await electron.getToken?.();
    if (token) {
      isDeviceLinked = true;
    }
  });
</script>

<main>
  {#if isDeviceLinked}
    <!-- If the device is linked, we will show the login screen. -->
    <!-- For now, we'll just show a message. -->
    <h1>Device is already linked.</h1>
    <p>Ready to proceed to login.</p>
  {:else}
    <!-- If not linked, show the setup component. -->
    <DeviceSetup />
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
  }
</style>
