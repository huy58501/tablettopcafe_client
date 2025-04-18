import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaTimes, FaMoneyBill, FaQrcode, FaArrowLeft } from 'react-icons/fa';

interface QRPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  amount: number;
  tableId: number;
  reference?: string;
}

const QRPayment: React.FC<QRPaymentProps> = ({
  isOpen,
  onClose,
  onComplete,
  amount,
  tableId,
  reference,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'qr' | 'cash' | null>(null);
  const [cashAmount, setCashAmount] = useState<string>('');
  const [tempCashAmount, setTempCashAmount] = useState<string>('');

  // Reset payment method when modal opens
  useEffect(() => {
    if (isOpen) {
      setPaymentMethod(null);
      setCashAmount('');
      setTempCashAmount('');
    }
  }, [isOpen]);

  // Format currency to VND with thousands separators
  const formatCurrency = (amount: number) => {
    return `VND: ${amount.toLocaleString('vi-VN')}`;
  };

  const handleNumberClick = (num: number) => {
    // Convert the clicked number to string
    const newValue = tempCashAmount + num.toString();
    setTempCashAmount(newValue);

    // Update cashAmount if it's a valid number
    const parsedValue = parseInt(newValue);
    if (!isNaN(parsedValue)) {
      setCashAmount(newValue);
    }
  };

  const handleClearNumber = () => {
    setTempCashAmount('');
    setCashAmount('');
  };

  const handleBackspace = () => {
    // Remove the last digit
    const newValue = tempCashAmount.slice(0, -1);
    setTempCashAmount(newValue);

    // Update cashAmount
    const parsedValue = parseInt(newValue);
    if (!isNaN(parsedValue)) {
      setCashAmount(newValue);
    } else {
      setCashAmount('');
    }
  };

  const handlePaymentComplete = () => {
    onComplete();
  };

  const calculateChange = () => {
    const paid = parseInt(cashAmount) || 0;
    return paid - amount;
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {paymentMethod === 'qr'
                ? 'QR Payment'
                : paymentMethod === 'cash'
                  ? 'Cash Payment'
                  : 'Payment Options'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors"
            >
              <FaTimes className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-700">Total Amount</h4>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(amount)}</span>
          </div>

          {!paymentMethod ? (
            // Payment Method Selection
            <div className="space-y-4 my-6">
              <button
                onClick={() => setPaymentMethod('qr')}
                className="w-full py-4 px-6 bg-blue-600 text-white font-medium 
                         rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
              >
                <FaQrcode className="text-xl" />
                <span>Pay with QR Code</span>
              </button>
              <button
                onClick={() => setPaymentMethod('cash')}
                className="w-full py-4 px-6 bg-green-600 text-white font-medium 
                         rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-3"
              >
                <FaMoneyBill className="text-xl" />
                <span>Pay with Cash</span>
              </button>
            </div>
          ) : paymentMethod === 'qr' ? (
            // QR Payment Content
            <>
              <div className="flex justify-center my-6">
                <div className="bg-gray-100 p-4 rounded-lg">
                  <img src="/images/qr-code.png" alt="QR Payment Code" className="w-48 h-48" />
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-medium">Vietcombank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account:</span>
                  <span className="font-medium">1234567890</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Beneficiary:</span>
                  <span className="font-medium">TabletTop Cafe</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Reference:</span>
                  <span className="font-medium">{reference || `Table ${tableId}`}</span>
                </div>
              </div>

              <div className="text-sm text-gray-500 text-center mb-6">
                Scan the QR code with your banking app to complete the payment
              </div>
            </>
          ) : (
            // Cash Payment Content
            <>
              <div className="mb-6">
                <div className="bg-white border-2 border-blue-100 rounded-xl p-6 mb-4 text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {cashAmount ? formatCurrency(parseInt(cashAmount)) : 'VND: 0'}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <FaMoneyBill className="text-blue-400" />
                    <p className="text-sm">Enter amount paid</p>
                  </div>
                </div>

                {parseInt(cashAmount) > amount && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">Change:</span>
                      <span className="text-green-700 font-bold">
                        {formatCurrency(calculateChange())}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Number Pad */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => handleNumberClick(num)}
                    className="aspect-square flex items-center justify-center bg-white border-2 border-gray-200 
                             hover:border-blue-400 hover:bg-blue-50 text-2xl font-semibold text-gray-700 
                             rounded-xl transition-all duration-200 active:scale-95"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleClearNumber}
                  className="aspect-square flex items-center justify-center bg-white border-2 border-red-200 
                           hover:border-red-400 hover:bg-red-50 text-lg font-medium text-red-600 
                           rounded-xl transition-all duration-200 active:scale-95"
                >
                  Clear
                </button>
                <button
                  onClick={() => handleNumberClick(0)}
                  className="aspect-square flex items-center justify-center bg-white border-2 border-gray-200 
                           hover:border-blue-400 hover:bg-blue-50 text-2xl font-semibold text-gray-700 
                           rounded-xl transition-all duration-200 active:scale-95"
                >
                  0
                </button>
                <button
                  onClick={handleBackspace}
                  className="aspect-square flex items-center justify-center bg-white border-2 border-gray-200 
                           hover:border-gray-400 hover:bg-gray-50 text-lg font-medium text-gray-600 
                           rounded-xl transition-all duration-200 active:scale-95"
                >
                  ←
                </button>
              </div>
            </>
          )}

          <div className="flex gap-3">
            {paymentMethod && (
              <button
                onClick={() => setPaymentMethod(null)}
                className="py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium 
                         rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <FaArrowLeft className="text-sm" />
                <span>Back</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-gray-200 text-gray-700 font-medium 
                       rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePaymentComplete}
              disabled={paymentMethod === 'cash' && (parseInt(cashAmount) || 0) < amount}
              className="flex-1 py-3 px-4 bg-blue-600 text-white font-medium 
                       rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCheck className="text-sm" />
              <span>Payment Complete</span>
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRPayment;
