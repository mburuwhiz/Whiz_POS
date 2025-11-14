const {
    create,
    _updateCreditCustomer,
    completeTransaction,
    addCreditPayment,
    loadInitialData,
  } = require('../src/store/posStore');

  // Mock necessary dependencies
  const mockStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };

  // Create a new store instance for testing
  let usePosStore;

  const resetStore = () => {
    // A function to reset the store state before each test
    const initialState = {
      // Define a minimal initial state for the test
      businessSetup: {
        isSetup: true,
        businessInfo: { name: 'Test Biz' },
      },
      products: [
        {
          _id: 'prod1',
          name: 'Test Product 1',
          price: 100,
          category: 'cat1',
          stock: 10,
        },
        {
          _id: 'prod2',
          name: 'Test Product 2',
          price: 50,
          category: 'cat1',
          stock: 20,
        },
      ],
      creditCustomers: [],
      users: [
        {
          _id: 'user1',
          name: 'Test Cashier',
          pin: '1234',
          role: 'Cashier',
          password: 'password',
        },
      ],
      currentCashier: {
        _id: 'user1',
        name: 'Test Cashier',
        pin: '1234',
        role: 'Cashier',
        password: 'password',
      },
      syncQueue: [],
      // ... other necessary initial state properties
    };

    // Create a fresh store instance
    usePosStore = create(() => initialState);

    // Manually apply middleware functions if they're not part of the core create logic
    // This is a simplified approach. For complex middleware, you might need a different setup.
    const originalSet = usePosStore.setState;
    usePosStore.setState = (...args) => {
      console.log('Setting state:', ...args);
      originalSet(...args);
    };

    // Bind standalone functions to the store instance
    usePosStore.getState()._updateCreditCustomer =
      _updateCreditCustomer.bind(usePosStore);
    usePosStore.getState().completeTransaction =
      completeTransaction.bind(usePosStore);
    usePosStore.getState().addCreditPayment = addCreditPayment.bind(usePosStore);
  };

  const testCreditLogic = () => {
    console.log('--- Starting Test: Credit Transaction Logic ---');

    // 1. Reset and initialize the store
    resetStore();
    console.log('Initial State:', usePosStore.getState().creditCustomers);

    // 2. Simulate a credit transaction
    console.log('\nStep 1: Simulating a credit transaction...');
    const cart = [
      {
        _id: 'prod1',
        name: 'Test Product 1',
        price: 100,
        quantity: 2,
        category: 'cat1',
        stock: 10,
      }, // 200
      {
        _id: 'prod2',
        name: 'Test Product 2',
        price: 50,
        quantity: 1,
        category: 'cat1',
        stock: 20,
      }, // 50
    ];
    const transactionDetails = {
      paymentMethod: 'credit',
      amountPaid: 0,
      customer: { name: 'John Doe', phone: '12345' },
    };

    usePosStore
      .getState()
      .completeTransaction(
        cart,
        transactionDetails.paymentMethod,
        transactionDetails.amountPaid,
        transactionDetails.customer,
      );

    let customers = usePosStore.getState().creditCustomers;
    console.log('State after credit sale:', JSON.stringify(customers, null, 2));

    if (customers.length !== 1 || customers[0].totalCredit !== 250) {
      console.error(
        '❌ Test Failed: Customer was not created or totalCredit is incorrect.',
      );
      return;
    }
    console.log('✅ Passed: Customer added with correct initial credit.');

    // 3. Simulate a partial payment
    console.log('\nStep 2: Simulating a partial payment...');
    const customerId = customers[0]._id;
    usePosStore.getState().addCreditPayment(customerId, 100);

    customers = usePosStore.getState().creditCustomers;
    const updatedCustomer = customers.find((c) => c._id === customerId);
    console.log(
      'State after partial payment:',
      JSON.stringify(updatedCustomer, null, 2),
    );

    if (
      updatedCustomer.paidAmount !== 100 ||
      updatedCustomer.balance !== 150
    ) {
      console.error(
        '❌ Test Failed: Paid amount or balance was not updated correctly after payment.',
      );
      return;
    }
    console.log('✅ Passed: Partial payment updated balance correctly.');

    // 4. Simulate another credit transaction for the same customer
    console.log('\nStep 3: Simulating another credit sale for same customer...');
    usePosStore
      .getState()
      .completeTransaction(
        [{ ...cart[0], quantity: 1 }],
        'credit',
        0,
        updatedCustomer,
      );

    customers = usePosStore.getState().creditCustomers;
    const finalCustomerState = customers.find((c) => c._id === customerId);
    console.log(
      'State after second credit sale:',
      JSON.stringify(finalCustomerState, null, 2),
    );

    if (
      finalCustomerState.totalCredit !== 350 ||
      finalCustomerState.balance !== 250
    ) {
      console.error(
        '❌ Test Failed: Total credit or balance did not update correctly on second purchase.',
      );
      return;
    }

    console.log('✅ Passed: Second credit sale updated totals correctly.');
    console.log('\n--- Test Completed Successfully ---');
  };

  testCreditLogic();

  module.exports = { testCreditLogic };
