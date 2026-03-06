import React, { useState, useEffect } from 'react';
import { usePosStore } from '../store/posStore';
import { X, CreditCard, Smartphone, Wallet, CheckCircle, Loader2 } from 'lucide-react';
import CreditCustomerModal from './CreditCustomerModal';
import { soundManager } from '../lib/soundUtils';
import { useToast } from './ui/use-toast';

/**
 * Modal component for handling the checkout process.
 * Allows selecting payment method (Cash, M-Pesa, Credit) and completing the transaction.
 */
export default function CheckoutModal() {
  const { isCheckoutOpen, closeCheckout, cart, completeTransaction, businessSetup } = usePosStore();
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'credit'>('cash');
  const [creditCustomer, setCreditCustomer] = useState('');
  const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
  const [amountTendered, setAmountTendered] = useState<string>('');
  const [isStkPushing, setIsStkPushing] = useState(false);
  const { toast } = useToast();

  // M-Pesa specific state
  const [mpesaCode, setMpesaCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpesaVerificationMode, setMpesaVerificationMode] = useState<'manual' | 'auto'>('manual');

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const tax = subtotal * 0; // Tax is set to 0 as per user instruction
  const total = subtotal + tax;

  // Calculate change
  const tendered = parseFloat(amountTendered) || 0;
  const change = Math.max(0, tendered - total);

  // Reset state when modal opens
  useEffect(() => {
    if (isCheckoutOpen) {
      setAmountTendered('');
      setPaymentMethod('cash');
      setCreditCustomer('');
      setMpesaCode('');
      setPhoneNumber('');
      setMpesaVerificationMode('manual');
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  /**
   * Finalizes the transaction.
   * Validates credit customer selection if payment method is credit.
   */
  const handleComplete = () => {
    if (paymentMethod === 'credit' && !creditCustomer.trim()) {
      soundManager.playError();
      alert('Please select a customer for credit payment');
      return;
    }
    if (paymentMethod === 'cash' && tendered < total && amountTendered !== '') {
      soundManager.playError();
      alert('Amount tendered is less than the total.');
      return;
    }

    soundManager.playCheckout();

    let additionalData: any = {};
    if (paymentMethod === 'cash' && amountTendered !== '') {
        additionalData.amountTendered = tendered;
        additionalData.change = change;
    }
    if (paymentMethod === 'mpesa') {
        if (mpesaCode) additionalData.mpesaCode = mpesaCode;
        if (phoneNumber) additionalData.phoneNumber = phoneNumber;
    }

    completeTransaction(
        paymentMethod,
        paymentMethod === 'credit' ? creditCustomer : undefined,
        additionalData
    );
  };

  /**
   * Callback when a customer is selected from the CreditCustomerModal.
   * @param customerName - The name of the selected customer.
   */
  const handleSelectCustomer = (customerName: string) => {
    setCreditCustomer(customerName);
    setIsCreditModalOpen(false);
  };

  /**
   * Updates the selected payment method.
   * Opens the credit customer selection modal if 'credit' is chosen.
   */
  const handlePaymentMethodChange = (method: 'cash' | 'mpesa' | 'credit') => {
    soundManager.playPop();
    setPaymentMethod(method);
    if (method === 'credit') {
      setIsCreditModalOpen(true);
    }
  };

  const handleStkPush = async () => {
    if (!phoneNumber) {
      toast("Please enter a phone number", "error");
      return;
    }

    if (!businessSetup?.mpesaConfig?.consumerKey || !businessSetup?.mpesaConfig?.shortcode) {
      toast("M-Pesa Daraja credentials not configured in Developer settings.", "error");
      return;
    }

    setIsStkPushing(true);
    soundManager.playClick();

    try {
      // Simulate API Call to Daraja
      toast("Initiating STK Push...", "default");
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast(`Prompt sent to ${phoneNumber}. Waiting for user to enter PIN...`, "default");

      // Simulate polling/waiting for callback
      await new Promise(resolve => setTimeout(resolve, 4000));

      soundManager.playSuccess();
      toast("Payment Received Successfully!", "success");

      // Auto-fill a mock receipt code
      const generatedCode = "MPESA" + Math.random().toString(36).substring(2, 8).toUpperCase();
      setMpesaCode(generatedCode);
      setMpesaVerificationMode('manual'); // Switch to manual to show the code before completion

    } catch (error) {
      soundManager.playError();
      toast("STK Push failed or timed out", "error");
    } finally {
      setIsStkPushing(false);
    }
  };

  /**
   * Reusable button component for payment methods.
   */
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

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
            <button
              onClick={closeCheckout}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between text-md">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">KES {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-md">
                <span className="text-gray-600">VAT (0%)</span>
                <span className="font-medium">KES {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-800 pt-3 border-t-2 border-dashed">
                <span>Total</span>
                <span className="text-blue-600">KES {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-2 text-lg">Payment Method</h3>

              <PaymentButton
                  method="cash"
                  current={paymentMethod}
                  setMethod={setPaymentMethod}
                  icon={<Wallet className="w-8 h-8 text-green-500" />}
                  label="Cash"
              />

              {paymentMethod === 'cash' && (
                  <div className="bg-gray-50 p-4 rounded-xl space-y-3 mt-2 animate-in fade-in slide-in-from-top-2">
                      <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                              Amount Tendered (Optional)
                          </label>
                          <input
                              type="number"
                              value={amountTendered}
                              onChange={(e) => setAmountTendered(e.target.value)}
                              placeholder={`e.g. ${total}`}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                          />
                      </div>
                      {amountTendered !== '' && tendered >= total && (
                          <div className="flex justify-between text-lg font-bold text-green-600 bg-green-50 p-2 rounded-lg">
                              <span>Change:</span>
                              <span>KES {change.toFixed(2)}</span>
                          </div>
                      )}
                  </div>
              )}

              <PaymentButton
                  method="mpesa"
                  current={paymentMethod}
                  setMethod={setPaymentMethod}
                  icon={<Smartphone className="w-8 h-8 text-blue-500" />}
                  label="M-Pesa"
              />

              {paymentMethod === 'mpesa' && (
                  <div className="bg-gray-50 p-4 rounded-xl space-y-4 mt-2 animate-in fade-in slide-in-from-top-2 border border-blue-100">
                      <div className="flex gap-2 p-1 bg-white rounded-lg border border-gray-200">
                          <button
                              onClick={() => setMpesaVerificationMode('manual')}
                              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mpesaVerificationMode === 'manual' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                              Manual Code
                          </button>
                          <button
                              onClick={() => setMpesaVerificationMode('auto')}
                              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${mpesaVerificationMode === 'auto' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                          >
                              Auto (STK Push)
                          </button>
                      </div>

                      {mpesaVerificationMode === 'manual' ? (
                          <div className="space-y-3">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                      M-Pesa Code
                                  </label>
                                  <input
                                      type="text"
                                      value={mpesaCode}
                                      onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                                      placeholder="e.g. QWE123RTY"
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-mono"
                                  />
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-3">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Customer Phone Number
                                  </label>
                                  <input
                                      type="tel"
                                      value={phoneNumber}
                                      onChange={(e) => setPhoneNumber(e.target.value)}
                                      placeholder="07... or 01..."
                                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                  />
                              </div>
                              <button
                                  className={`w-full py-3 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${isStkPushing ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                  onClick={handleStkPush}
                                  disabled={isStkPushing}
                              >
                                  {isStkPushing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Smartphone className="w-5 h-5" />}
                                  {isStkPushing ? 'Processing Payment...' : 'Send Payment Prompt'}
                              </button>
                          </div>
                      )}
                  </div>
              )}

              <PaymentButton
                  method="credit"
                  current={paymentMethod}
                  setMethod={setPaymentMethod}
                  icon={<CreditCard className="w-8 h-8 text-orange-500" />}
                  label="Credit"
              />
            </div>

            {paymentMethod === 'credit' && (
              <div className="mt-6 animate-in fade-in slide-in-from-top-2">
                <label className="block text-md font-medium text-gray-700 mb-2">
                  Customer
                </label>
                <button
                  onClick={() => setIsCreditModalOpen(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left"
                >
                  {creditCustomer || 'Select a customer'}
                </button>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button
                onClick={closeCheckout}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleComplete}
                className="flex-1 px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
              >
                Complete Payment
              </button>
            </div>
          </div>
        </div>
      </div>
      <CreditCustomerModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        onSelectCustomer={handleSelectCustomer}
      />
    </>
  );
}
