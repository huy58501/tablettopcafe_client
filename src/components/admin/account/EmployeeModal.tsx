import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiUser } from 'react-icons/fi';
import { User } from '../../../services/userServices';

interface EmployeeData {
  id: number;
  fullName: string;
  email?: string;
  phone?: string;
  position?: string;
  address?: string;
  startDate: string;
  isActive: boolean;
}

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: User | null;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({ isOpen, onClose, employee }) => {
  if (!employee) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="relative">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <Dialog.Title className="text-xl font-semibold text-white">
                        Employee Information
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        <FiX className="h-6 w-6" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Profile Header */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-2xl font-semibold text-blue-600">
                          {employee.employee?.fullName.charAt(0).toUpperCase() ||
                            employee.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {employee.employee?.fullName || employee.username}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {employee.employee?.position || 'No position specified'}
                        </p>
                      </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Contact Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 text-gray-600">
                            <FiUser className="h-5 w-5 text-gray-400" />
                            <span>{employee.username}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-600">
                            <FiMail className="h-5 w-5 text-gray-400" />
                            <span>{employee.employee?.email || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-600">
                            <FiPhone className="h-5 w-5 text-gray-400" />
                            <span>{employee.employee?.phone || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-600">
                            <FiMapPin className="h-5 w-5 text-gray-400" />
                            <span>{employee.employee?.address || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Account Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Account Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 text-gray-600">
                            <FiBriefcase className="h-5 w-5 text-gray-400" />
                            <span className="capitalize">{employee.role}</span>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-600">
                            <FiCalendar className="h-5 w-5 text-gray-400" />
                            <span>
                              Started{' '}
                              {formatDate(
                                employee.employee?.startDate ||
                                  employee.created_at ||
                                  new Date().toISOString()
                              )}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3 text-gray-600">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                employee.employee?.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {employee.employee?.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EmployeeModal;
