import React from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaArrowLeft, FaCheck, FaQrcode, FaMoneyBill } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';

interface QRPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  amount: number;
  tableId?: number;
  reference?: string;
  onConfirm: (paymentData: { paymentMethod: string; amount: number; reference: string }) => void;
}

const QRPayment: React.FC<QRPaymentProps> = ({
  isOpen,
  onClose,
  onComplete,
  onConfirm,
  amount,
  tableId,
  reference,
}) => {
  const [showQR, setShowQR] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string>('Tiền Mặt');

  const formatCurrency = (amount: number) => {
    return `VND: ${amount.toLocaleString('vi-VN')}`;
  };

  const handlePayWithQR = () => {
    setShowQR(true);
    setPaymentMethod('Chuyển Khoản');
  };

  const handleBack = () => {
    setShowQR(false);
    setPaymentMethod('Tiền Mặt');
  };

  const handleClose = () => {
    setShowQR(false);
    setPaymentMethod('Tiền Mặt');
    onClose();
  };

  const handlePaymentConfirm = () => {
    onConfirm({
      paymentMethod: paymentMethod,
      amount: amount,
      reference: reference || '',
    });
    onComplete();
    console.log('Payment Confirm from QR Payment', paymentMethod + ' ' + amount + ' ' + reference);
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => e.target === e.currentTarget && handleClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-xl"
      >
        {!showQR ? (
          <>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Payment Options</h2>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500 w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-5">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="text-base font-semibold text-blue-600">
                  {formatCurrency(amount)}
                </span>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handlePayWithQR}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                           transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FaQrcode className="w-4 h-4" />
                  Pay with QR Code
                </button>

                <button
                  onClick={handlePaymentConfirm}
                  className="w-full py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 
                           transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FaMoneyBill className="w-4 h-4" />
                  Pay with Cash
                </button>

                <button
                  onClick={handleClose}
                  className="w-full py-2 border border-gray-200 text-gray-700 rounded-xl 
                           hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaArrowLeft className="text-gray-500 w-4 h-4" />
                </button>
                <h2 className="text-base font-semibold text-gray-800">QR Payment</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes className="text-gray-500 w-4 h-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">Total Amount</span>
                <span className="text-base font-semibold text-blue-600">
                  {formatCurrency(amount)}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl mb-4 flex justify-center">
                <QRCodeSVG
                  value={`https://example.com/pay?amount=${amount}&ref=${reference}`}
                  size={180}
                  level="H"
                  className="w-auto h-auto"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Bank</span>
                  <span className="font-medium text-gray-700">Vietcombank</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Account</span>
                  <span className="font-medium text-gray-700">1234567890</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Beneficiary</span>
                  <span className="font-medium text-gray-700">TabletTop Cafe</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">Reference</span>
                  <span className="font-medium text-gray-700">{reference}</span>
                </div>
              </div>

              <p className="text-center text-xs text-gray-500 mb-4">
                Scan the QR code with your banking app to complete the payment
              </p>

              <button
                onClick={handlePaymentConfirm}
                className="w-full py-2.5 bg-blue-600 text-white rounded-xl 
                         hover:bg-blue-700 transition-colors text-sm font-medium
                         flex items-center justify-center gap-2"
              >
                <FaCheck className="w-3.5 h-3.5" />
                Payment Complete
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
};

export default QRPayment;
