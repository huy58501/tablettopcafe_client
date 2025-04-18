import React from 'react';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

interface SpinningModalProps {
  isOpen: boolean;
  message?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  overlayColor?: string;
  onClose?: () => void;
}

const SpinningModal: React.FC<SpinningModalProps> = ({
  isOpen,
  message = 'Loading...',
  size = 'medium',
  color = 'blue',
  overlayColor = 'rgba(0, 0, 0, 0.5)',
  onClose,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl',
  };

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    red: 'text-red-500',
    yellow: 'text-yellow-500',
    purple: 'text-purple-500',
    gray: 'text-gray-500',
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: overlayColor }}
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center"
      >
        <FaSpinner
          className={`${sizeClasses[size]} ${colorClasses[color as keyof typeof colorClasses]} animate-spin mb-4`}
        />
        <p className="text-gray-700 font-medium">{message}</p>
      </motion.div>
    </motion.div>
  );
};

export default SpinningModal;
