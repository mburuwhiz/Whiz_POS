<script lang="ts">
  import { onMount } from 'svelte';
  import Swal from 'sweetalert2';
  import type { Product } from '../../../shared/models/Product';

  let products: Product[] = [];
  let selectedProduct: Partial<Product> = {};
  let isEditing = false;

  const apiBaseUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:4001';

  onMount(async () => {
    await fetchProducts();
  });

  async function fetchProducts() {
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
  }

  function selectProduct(product: Product) {
    selectedProduct = { ...product };
    isEditing = true;
  }

  function clearSelection() {
    selectedProduct = {};
    isEditing = false;
  }

  async function saveProduct() {
    const method = isEditing ? 'PATCH' : 'POST';
    const url = isEditing ? `${apiBaseUrl}/products/${selectedProduct._id}` : `${apiBaseUrl}/products`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(selectedProduct),
      });

      if (response.ok) {
        Swal.fire('Success!', 'Product saved successfully.', 'success');
        await fetchProducts();
        clearSelection();
      } else {
        Swal.fire('Error', 'Failed to save the product.', 'error');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      Swal.fire('Connection Error', 'Could not connect to the server.', 'error');
    }
  }

  async function deleteProduct(id: string) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${apiBaseUrl}/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
        });

        if (response.ok) {
          Swal.fire('Deleted!', 'Product has been deleted.', 'success');
          await fetchProducts();
        } else {
          Swal.fire('Error', 'Failed to delete the product.', 'error');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire('Connection Error', 'Could not connect to the server.', 'error');
      }
    }
  }
</script>

<div class="product-management-container">
  <div class="form-container">
    <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
    <input type="text" placeholder="SKU" bind:value={selectedProduct.sku} />
    <input type="text" placeholder="Name" bind:value={selectedProduct.name} />
    <input type="number" placeholder="Price" bind:value={selectedProduct.price} />
    <button on:click={saveProduct}>{isEditing ? 'Update' : 'Save'}</button>
    {#if isEditing}
      <button on:click={clearSelection}>Cancel</button>
    {/if}
  </div>

  <div class="product-list-container">
    <h3>Existing Products</h3>
    <table>
      <thead>
        <tr>
          <th>SKU</th>
          <th>Name</th>
          <th>Price</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each products as product}
          <tr>
            <td>{product.sku}</td>
            <td>{product.name}</td>
            <td>{product.price.toFixed(2)}</td>
            <td>
              <button on:click={() => selectProduct(product)}>Edit</button>
              <button on:click={() => deleteProduct(product._id)}>Delete</button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<style>
  .product-management-container {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1rem;
    padding: 1rem;
  }
  .form-container {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
