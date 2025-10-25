<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Business } from '../../../../shared/models/Business';

  let businesses: Business[] = [];
  let showModal = false;
  let newBusiness = {
    businessName: '',
    region: '',
    adminName: '',
    adminEmail: '',
    adminPin: '',
  };
  const apiBaseUrl = 'http://localhost:4001'; // This should be in an env file

  onMount(async () => {
    const token = localStorage.getItem('portal_token');
    if (!token) {
      goto('/');
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/businesses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        businesses = await response.json();
      } else {
        console.error('Failed to fetch businesses');
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
    }
  });

  async function createBusiness() {
    const token = localStorage.getItem('portal_token');
    try {
      const response = await fetch(`${apiBaseUrl}/businesses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newBusiness),
      });

      if (response.ok) {
        showModal = false;
        await onMount(); // Refresh the list
      } else {
        console.error('Failed to create business');
      }
    } catch (error) {
      console.error('Error creating business:', error);
    }
  }

  async function issueApiKey(businessId: string) {
    const token = localStorage.getItem('portal_token');
    try {
      const response = await fetch(`${apiBaseUrl}/businesses/${businessId}/issue-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        await onMount(); // Refresh the list
      } else {
        console.error('Failed to issue API key');
      }
    } catch (error) {
      console.error('Error issuing API key:', error);
    }
  }

  async function activateApiKey(businessId: string, key: string) {
    const token = localStorage.getItem('portal_token');
    try {
      const response = await fetch(`${apiBaseUrl}/businesses/${businessId}/activate-key`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key }),
      });

      if (response.ok) {
        await onMount(); // Refresh the list
      } else {
        console.error('Failed to activate API key');
      }
    } catch (error) {
      console.error('Error activating API key:', error);
    }
  }
</script>

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 5px;
  }
</style>

<h1>Business Management</h1>

<button on:click={() => showModal = true}>Add New Business</button>

{#if showModal}
  <div class="modal">
    <div class="modal-content">
      <h2>Add New Business</h2>
      <form on:submit|preventDefault={createBusiness}>
        <input type="text" placeholder="Business Name" bind:value={newBusiness.businessName} required />
        <input type="text" placeholder="Region" bind:value={newBusiness.region} required />
        <input type="text" placeholder="Admin Name" bind:value={newBusiness.adminName} required />
        <input type="email" placeholder="Admin Email" bind:value={newBusiness.adminEmail} required />
        <input type="password" placeholder="Admin PIN" bind:value={newBusiness.adminPin} required />
        <button type="submit">Create</button>
        <button on:click={() => showModal = false}>Cancel</button>
      </form>
    </div>
  </div>
{/if}

<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Region</th>
      <th>API Keys</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each businesses as business}
      <tr>
        <td>{business.name}</td>
        <td>{business.region}</td>
        <td>
          {#if business.apiKeys.length > 0}
            {#each business.apiKeys as apiKey}
              <div>{apiKey.key} ({apiKey.status})</div>
            {/each}
          {:else}
            No keys issued
          {/if}
        </td>
        <td>
          {#if business.apiKeys.length === 0}
            <button on:click={() => issueApiKey(business._id)}>Issue Key</button>
          {:else}
            {#each business.apiKeys as apiKey}
              {#if apiKey.status === 'Inactive'}
                <button on:click={() => activateApiKey(business._id, apiKey.key)}>Activate Key</button>
              {/if}
            {/each}
          {/if}
        </td>
      </tr>
    {/each}
  </tbody>
</table>
