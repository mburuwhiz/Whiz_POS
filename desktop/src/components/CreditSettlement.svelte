<script lang="ts">
  import { onMount } from 'svelte';
  import Swal from 'sweetalert2';
  import type { Transaction } from '../../../shared/models/Transaction';

  let unpaidTransactions: Transaction[] = [];

  const apiBaseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:4001';

  onMount(async () => {
    await fetchUnpaidTransactions();
  });

  async function fetchUnpaidTransactions() {
    try {
      const response = await fetch(`${apiBaseUrl}/transactions/unpaid`);
      if (response.ok) {
        unpaidTransactions = await response.json();
      } else {
        console.error('Failed to fetch unpaid transactions');
      }
    } catch (error) {
      console.error('Error fetching unpaid transactions:', error);
    }
  }

  async function markAsPaid(transactionId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/transactions/${transactionId}/pay`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Transaction marked as paid.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        await fetchUnpaidTransactions(); // Refresh the list
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update the transaction.',
          icon: 'error',
        });
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      Swal.fire({
        title: 'Connection Error',
        text: 'Could not connect to the server.',
        icon: 'error',
      });
    }
  }
</script>

<div class="credit-settlement-container">
  <h2>Unpaid Credit Transactions</h2>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Total</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {#each unpaidTransactions as transaction}
        <tr>
          <td>{new Date(transaction.createdAt).toLocaleString()}</td>
          <td>{transaction.total.toFixed(2)}</td>
          <td>
            <button on:click={() => markAsPaid(transaction._id)}>Mark as Paid</button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .credit-settlement-container {
    padding: 1rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #444;
    padding: 0.5rem;
    text-align: left;
  }
</style>
