<script lang="ts">
  import { onMount } from 'svelte';
  import type { Transaction } from '../../../shared/models/Transaction';

  interface Summary {
    totalSales: number;
    cash: number;
    card: number;
    credit: {
      total: number;
      paid: number;
      unpaid: number;
    };
    mpesa: number;
  }

  let summary: Summary | null = null;

  const apiBaseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:4001';

  onMount(async () => {
    await fetchSummary();
  });

  async function fetchSummary() {
    try {
      const response = await fetch(`${apiBaseUrl}/transactions/summary/today`);
      if (response.ok) {
        summary = await response.json();
      } else {
        console.error('Failed to fetch summary');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  }

  function printSummary() {
    window.print();
  }
</script>

<div class="summary-container">
  <h2>End of Day Summary</h2>
  {#if summary}
    <div class="summary-details">
      <div class="summary-item total">
        <span>Total Sales:</span>
        <span>{summary.totalSales.toFixed(2)}</span>
      </div>
      <hr />
      <div class="summary-item">
        <span>Cash:</span>
        <span>{summary.cash.toFixed(2)}</span>
      </div>
      <div class="summary-item">
        <span>Card:</span>
        <span>{summary.card.toFixed(2)}</span>
      </div>
      <div class="summary-item">
        <span>M-Pesa:</span>
        <span>{summary.mpesa.toFixed(2)}</span>
      </div>
      <div class="summary-item credit-total">
        <span>Credit (Total):</span>
        <span>{summary.credit.total.toFixed(2)}</span>
      </div>
      <div class="summary-item credit-paid">
        <span>&nbsp;&nbsp;- Paid:</span>
        <span>{summary.credit.paid.toFixed(2)}</span>
      </div>
      <div class="summary-item credit-unpaid">
        <span>&nbsp;&nbsp;- Unpaid:</span>
        <span>{summary.credit.unpaid.toFixed(2)}</span>
      </div>
    </div>
    <button on:click={printSummary}>Print</button>
  {:else}
    <p>Loading summary...</p>
  {/if}
</div>

<style>
  .summary-container {
    padding: 1rem;
    max-width: 400px;
    margin: auto;
    background: #1e1e1e;
    border-radius: 8px;
  }
  .summary-details {
    margin-bottom: 1rem;
  }
  .summary-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  .total {
    font-weight: bold;
    font-size: 1.2rem;
  }
  hr {
    border-color: #444;
  }
</style>
