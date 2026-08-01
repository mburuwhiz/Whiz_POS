# Checkout Modal Documentation

This document explains the implementation of the `CheckoutModal.tsx` component in our POS system. It handles the checkout flow, including payment method selection (Cash, M-Pesa, Credit) and transaction finalization.

## Overview

The `CheckoutModal` is a two-step wizard:
1. **Selection Step (`checkoutStep === 'select'`)**: The user selects the payment method (Cash, M-Pesa, or Credit).
2. **Details Step (`checkoutStep === 'details'`)**: The user provides specific details required for the chosen payment method (e.g., amount tendered for cash, M-Pesa code or phone number for M-Pesa, customer selection for credit).

## State Management

The component uses local state for the UI flow and relies on the global `usePosStore` for transaction data (cart, totals) and finalization logic.

### Local State
- `checkoutStep`: Tracks the current step (`'select'` or `'details'`).
- `paymentMethod`: The selected payment method (`'cash'`, `'mpesa'`, `'credit'`, or `null`).
- `amountTendered`: (Cash) The amount the customer handed over.
- `mpesaCode`: (M-Pesa Manual) The transaction confirmation code.
- `phoneNumber`: (M-Pesa STK Push) The customer's phone number.
- `mpesaVerificationMode`: (M-Pesa) Toggles between manual code entry and automated STK push (`'manual'` or `'auto'`).
- `creditCustomer`: (Credit) The name of the selected customer for credit sales.
- `isStkPushing`: Indicates if an M-Pesa STK push request is currently in progress.
- `isCreditModalOpen`: Controls the visibility of the `CreditCustomerModal` for selecting a customer.

### Store State (`usePosStore`)
- `cart`: The items currently being purchased.
- `businessSetup`: Contains configuration like M-Pesa API details.
- `isCheckoutOpen`: Controls the visibility of this modal.
- `closeCheckout`: Function to close the modal.
- `completeTransaction`: The core function that saves the transaction to the database.

## Step 1: Payment Method Selection

This step displays the subtotal, VAT (currently fixed at 0%), and total. It provides large buttons to select the payment method.

```tsx
// Inside CheckoutModal.tsx
const PaymentButton = ({ method, current, setMethod, icon, label }: any) => {
    const isSelected = method === current;
    return (
        <button
          onClick={() => handlePaymentMethodChange(method)}
          className={`w-full flex items-center p-4 rounded-xl border-2 transition-all duration-200 ${
            isSelected
              ? 'border-blue-500 bg-blue-50 shadow-lg'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          {icon}
          <span className="font-semibold text-lg ml-4">{label}</span>
          {isSelected && <CheckCircle className="w-6 h-6 text-blue-500 ml-auto" />}
        </button>
    );
  }
```

When a method is clicked, `handlePaymentMethodChange` updates the state and transitions to the next step. If 'credit' is selected, it immediately opens the `CreditCustomerModal`.

## Step 2: Payment Details & Completion

The UI changes dynamically based on the selected `paymentMethod`.

### 1. Cash Payment
Allows optional entry of the `amountTendered`. It calculates and displays the `change` to return or warns if the amount is insufficient.

```tsx
// Cash Handling Logic
const tendered = parseFloat(amountTendered) || 0;
const change = Math.max(0, tendered - total);

// Rendering (Simplified)
{paymentMethod === 'cash' && (
    <div>
        <input
            type="number"
            value={amountTendered}
            onChange={(e) => setAmountTendered(e.target.value)}
        />
        {/* Shows change if tendered >= total, or warning if tendered < total */}
    </div>
)}
```

### 2. M-Pesa Payment
M-Pesa has two modes depending on `businessSetup.mpesaConfig.enabled`:
- **Manual Mode**: User types in the confirmation code from the SMS.
- **Auto Mode (STK Push)**: User enters the customer's phone number. The app sends a prompt to the customer's phone to enter their PIN. It polls the backend API until the transaction completes or fails.

```tsx
// STK Push Execution (Simplified)
const handleStkPush = async () => {
    // 1. Validate phone number and config
    // 2. Send POST request to backend API to trigger STK Push
    // 3. Receive CheckoutRequestID
    // 4. Poll backend API status endpoint using CheckoutRequestID
    // 5. On success, extract MpesaReceiptNumber and call handleComplete(finalCode)
};
```

### 3. Credit Payment
Requires the selection of a customer. It displays a button that opens the `CreditCustomerModal`.

```tsx
{paymentMethod === 'credit' && (
  <button onClick={() => setIsCreditModalOpen(true)}>
    {creditCustomer || <span>Click to select customer...</span>}
  </button>
)}
```

## Transaction Completion (`handleComplete`)

This function validates the input, prepares the final data object, and calls the store's `completeTransaction` method.

```tsx
const handleComplete = (overrideMpesaCode?: string | React.MouseEvent | any) => {
    const finalMpesaCode = typeof overrideMpesaCode === 'string' ? overrideMpesaCode : undefined;

    // Validation
    if (paymentMethod === 'credit' && !creditCustomer.trim()) return alert('Select customer');
    if (paymentMethod === 'cash' && tendered < total && amountTendered !== '') return alert('Insufficient amount');

    // Data Preparation
    let additionalData: any = {};
    if (paymentMethod === 'cash' && amountTendered !== '') {
        additionalData.amountTendered = tendered;
        additionalData.change = change;
    }
    if (paymentMethod === 'mpesa') {
        if (finalMpesaCode || mpesaCode) additionalData.mpesaCode = finalMpesaCode || mpesaCode;
        if (phoneNumber) additionalData.phoneNumber = phoneNumber;
    }

    // Finalize
    completeTransaction(
        paymentMethod,
        paymentMethod === 'credit' ? creditCustomer : undefined,
        additionalData
    );
};
```

This modal provides a clean, step-by-step user experience for finalizing sales with robust handling for different payment scenarios.
