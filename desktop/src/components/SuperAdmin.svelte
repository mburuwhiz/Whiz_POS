<script lang="ts">
  import { onMount } from 'svelte';
  import Swal from 'sweetalert2';

  let businesses = [];
  let businessName = '';
  let region = 'KE';
  let adminName = '';
  let adminEmail = '';
  let adminPin = '';

  const apiBaseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:4001';

  async function fetchBusinesses() {
    try {
      const response = await fetch(`${apiBaseUrl}/businesses`);
      if (response.ok) {
        businesses = await response.json();
      } else {
        Swal.fire('Error', 'Failed to fetch businesses.', 'error');
      }
    } catch (error) {
      Swal.fire('Connection Error', 'Could not connect to the server.', 'error');
    }
  }

  onMount(fetchBusinesses);

  async function createBusiness() {
    try {
      const response = await fetch(`${apiBaseUrl}/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, region, adminName, adminEmail, adminPin }),
      });

      if (response.ok) {
        Swal.fire('Success!', 'Business and Admin created.', 'success');
        fetchBusinesses(); // Refresh the list
      } else {
        const error = await response.text();
        Swal.fire('Error', `Failed to create business: ${error}`, 'error');
      }
    } catch (error) {
      Swal.fire('Connection Error', 'Could not connect to the server.', 'error');
    }
  }

  async function issueApiKey(businessId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/businesses/${businessId}/issue-api-key`, {
        method: 'POST',
      });

      if (response.ok) {
        const updatedBusiness = await response.json();
        const newKey = updatedBusiness.apiKeys[updatedBusiness.apiKeys.length - 1];
        Swal.fire('API Key Issued!', `New Key: ${newKey.key}`, 'success');
        fetchBusinesses(); // Refresh to show the new key state
      } else {
        Swal.fire('Error', 'Failed to issue API key.', 'error');
      }
    } catch (error) {
      Swal.fire('Connection Error', 'Could not connect to the server.', 'error');
    }
  }
</script>

<div class="super-admin-container">
  <div class="card">
    <h2>Create New Business & Admin</h2>
    <form on:submit|preventDefault={createBusiness}>
      <input type="text" bind:value={businessName} placeholder="Business Name" required />
      <input type="text" bind:value={region} placeholder="Region (e.g., KE)" required />
      <hr />
      <input type="text" bind:value={adminName} placeholder="Admin Name" required />
      <input type="email" bind:value={adminEmail} placeholder="Admin Email" required />
      <input type="password" bind:value={adminPin} placeholder="Admin 4-Digit PIN" required pattern="\\d{4}" />
      <button type="submit">Create</button>
    </form>
  </div>

  <div class="card">
    <h2>Existing Businesses</h2>
    <ul>
      {#each businesses as business}
        <li>
          <strong>{business.name}</strong>
          <div>API Keys: {business.apiKeys.length > 0 ? business.apiKeys.map(k => k.key).join(', ') : 'None'}</div>
          <button on:click={() => issueApiKey(business._id)}>Issue New API Key</button>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .super-admin-container {
    display: flex;
    gap: 2rem;
    padding: 2rem;
    width: 100%;
  }
  .card {
    flex: 1;
    background-color: #1e1e1e;
    padding: 2rem;
    border-radius: 8px;
  }
  form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  input {
    padding: 0.75rem;
    border-radius: 4px;
  }
  hr {
    border-color: #444;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #444;
  }
</style>
