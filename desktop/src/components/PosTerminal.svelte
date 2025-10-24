<script lang="ts">
  import { onMount } from 'svelte';
  import Swal from 'sweetalert2';
  import type { Product } from '../../../shared/models/Product';

  let products: Product[] = [];
  let cart = [];
  let subtotal = 0;
  let tax = 0;
  let total = 0;

  const apiBaseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:4001';

  onMount(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/products`);
      if (response.ok) {
        products = await response.json();
      } else {
        console.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  });

  function addToCart(product: Product) {
    const existingItem = cart.find(item => item.sku === product.sku);
    if (existingItem) {
      existingItem.qty++;
    } else {
      cart.push({ ...product, qty: 1 });
    }
    cart = cart; // Trigger reactivity
    calculateTotals();
  }

  function calculateTotals() {
    subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    tax = subtotal * 0.16; // Assuming 16% tax
    total = subtotal + tax;
  }

  function clearCart() {
    cart = [];
    calculateTotals();
  }

  async function createTransaction(paymentMethod: 'cash' | 'card' | 'credit' | 'mpesa') {
    if (cart.length === 0) return;

    const transactionData = {
      businessId: 'bzn_001_dev', // Mock
      deviceId: 'desktop-01', // Mock
      items: cart.map(item => ({ sku: item.sku, name: item.name, qty: item.qty, price: item.price })),
      total: total,
      payments: [{ method: paymentMethod, amount: total }],
      status: 'COMPLETED',
    };

    try {
      const response = await fetch(`${apiBaseUrl}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(transactionData),
      });

      if (response.ok) {
        Swal.fire({
          title: 'Success!',
          text: 'Sale completed successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        clearCart();
      } else {
        Swal.fire({
          title: 'Error',
          text: 'Failed to save the transaction.',
          icon: 'error',
        });
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      Swal.fire({
        title: 'Connection Error',
        text: 'Could not connect to the server.',
        icon: 'error',
      });
    }
  }

  async function initiateMpesaPayment() {
    if (cart.length === 0) return;

    const { value: phoneNumber } = await Swal.fire({
      title: 'Enter Phone Number',
      input: 'text',
      inputLabel: 'Phone Number',
      inputPlaceholder: 'Enter phone number...',
      showCancelButton: true,
    });

    if (phoneNumber) {
      try {
        const response = await fetch(`${apiBaseUrl}/mpesa/stk-push`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ amount: total, phoneNumber }),
        });

        if (response.ok) {
          const responseData = await response.json();
          const checkoutRequestID = responseData.CheckoutRequestID;

          Swal.fire({
            title: 'Processing M-Pesa Payment...',
            text: 'Please check your phone to complete the payment.',
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          // Poll for payment status
          const interval = setInterval(async () => {
            const statusResponse = await fetch(`${apiBaseUrl}/mpesa/status/${checkoutRequestID}`);
            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.ResultCode === '0') {
                clearInterval(interval);
                Swal.close();
                await createTransaction('mpesa');
              } else if (statusData.ResultCode !== '0' && statusData.ResultDesc !== 'The transaction is being processed') {
                clearInterval(interval);
                Swal.fire({
                  title: 'Error',
                  text: statusData.ResultDesc,
                  icon: 'error',
                });
              }
            }
          }, 2000);

        } else {
          Swal.fire({
            title: 'Error',
            text: 'Failed to initiate STK push.',
            icon: 'error',
          });
        }
      } catch (error) {
        console.error('Error initiating M-Pesa payment:', error);
        Swal.fire({
          title: 'Connection Error',
          text: 'Could not connect to the server.',
          icon: 'error',
        });
      }
    }
  }
</script>

<div class="pos-terminal-container">
  <div class="product-grid">
    {#each products as product}
      <button class="product-item" on:click={() => addToCart(product)}>
        <span class="product-name">{product.name}</span>
        <span class="product-price">{product.price.toFixed(2)}</span>
      </button>
    {/each}
  </div>

  <div class="cart-view">
    <h3>Current Order</h3>
    <ul class="cart-items">
      {#each cart as item}
        <li>
          <span>{item.name} (x{item.qty})</span>
          <span>{(item.price * item.qty).toFixed(2)}</span>
        </li>
      {/each}
    </ul>
    <div class="totals">
      <div><span>Subtotal:</span><span>{subtotal.toFixed(2)}</span></div>
      <div><span>Tax (16%):</span><span>{tax.toFixed(2)}</span></div>
      <div class="grand-total"><span>Total:</span><span>{total.toFixed(2)}</span></div>
    </div>
  </div>

  <div class="action-panel">
    <button class="action-btn cash" on:click={() => createTransaction('cash')}>Cash</button>
    <button class="action-btn card" on:click={() => createTransaction('card')}>Card</button>
    <button class="action-btn credit" on:click={() => createTransaction('credit')}>Credit</button>
    <button class="action-btn mpesa" on:click={initiateMpesaPayment}>M-Pesa</button>
    <button class="action-btn void" on:click={clearCart}>Void</button>
  </div>
</div>

<style>
  /* Basic styling for the POS Terminal */
  .pos-terminal-container {
    display: grid;
    grid-template-columns: 3fr 2fr;
    grid-template-rows: 1fr auto;
    gap: 1rem;
    height: 100vh;
    padding: 1rem;
    box-sizing: border-box;
  }
  .product-grid {
    grid-row: 1 / 3;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
    overflow-y: auto;
    background-color: #1e1e1e;
    padding: 1rem;
    border-radius: 8px;
  }
  .product-item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background-color: #3a3a3a;
    border: 1px solid #444;
    border-radius: 8px;
    cursor: pointer;
  }
  .cart-view {
    display: flex;
    flex-direction: column;
    background-color: #1e1e1e;
    padding: 1rem;
    border-radius: 8px;
  }
  .cart-items {
    list-style: none;
    padding: 0;
    flex-grow: 1;
  }
  .cart-items li {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }
  .totals {
    border-top: 1px solid #444;
    padding-top: 1rem;
  }
  .totals div {
    display: flex;
    justify-content: space-between;
  }
  .grand-total {
    font-weight: bold;
    font-size: 1.2rem;
  }
  .action-panel {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }
  .action-btn {
    padding: 2rem;
    font-size: 1.5rem;
    border-radius: 8px;
    cursor: pointer;
  }
  .cash { background-color: #28a745; }
  .card { background-color: #007bff; }
  .credit { background-color: #ffc107; }
  .mpesa { background-color: #42b883; }
  .void { background-color: #dc3545; }
</style>
