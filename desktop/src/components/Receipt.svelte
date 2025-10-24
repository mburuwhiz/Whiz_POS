<script lang="ts">
  import type { Transaction } from '../../../shared/models/Transaction';

  export let transaction: Transaction;

  function printReceipt() {
    window.print();
  }
</script>

<div class="receipt-container">
  <div class="receipt-header">
    <h2>WHIZ POS</h2>
    <p>Receipt</p>
  </div>
  <div class="receipt-body">
    <p><strong>Date:</strong> {new Date(transaction.createdAt).toLocaleString()}</p>
    <p><strong>Transaction ID:</strong> {transaction._id}</p>
    <hr />
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Qty</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        {#each transaction.items as item}
          <tr>
            <td>{item.name}</td>
            <td>{item.qty}</td>
            <td>{item.price.toFixed(2)}</td>
            <td>{(item.qty * item.price).toFixed(2)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
    <hr />
    <div class="totals">
      <p><strong>Total:</strong> {transaction.total.toFixed(2)}</p>
      <p><strong>Payment Method:</strong> {transaction.payments[0].method}</p>
    </div>
  </div>
  <div class="receipt-footer">
    <p>Thank you for your purchase!</p>
    <button on:click={printReceipt}>Print Receipt</button>
  </div>
</div>

<style>
  .receipt-container {
    width: 300px;
    margin: auto;
    padding: 1rem;
    border: 1px solid #ccc;
    font-family: 'Courier New', Courier, monospace;
  }
  .receipt-header, .receipt-footer {
    text-align: center;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    padding: 0.25rem;
  }
</style>
