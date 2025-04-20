import React, { Fragment, useState } from 'react';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { FiChevronDown, FiCheck, FiUser, FiBriefcase } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

interface NewUser {
  username: string;
  password: string;
  role: string;
  fullName: string;
  email?: string;
  phone?: string;
  position?: string;
  address?: string;
}

const roles = [
  { id: 'admin', name: 'Admin' },
  { id: 'client', name: 'Client' },
  { id: 'tester', name: 'Tester' },
];

interface AddUserModalProps {
  isOpen: boolean;
  isCreating: boolean;
  onClose: () => void;
  onSubmit: (user: NewUser) => Promise<void>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, isCreating, onClose, onSubmit }) => {
  const [activeTab, setActiveTab] = useState<'user' | 'employee'>('user');
  const [newUser, setNewUser] = React.useState<NewUser>({
    username: '',
    password: '',
    role: 'client',
    fullName: '',
    email: '',
    phone: '',
    position: '',
    address: '',
  });

  const handleSubmit = async () => {
    await onSubmit(newUser);
    setNewUser({
      username: '',
      password: '',
      role: 'client',
      fullName: '',
      email: '',
      phone: '',
      position: '',
      address: '',
    });
  };

  const tabs = [
    { id: 'user', name: 'Account', icon: FiUser },
    { id: 'employee', name: 'Employee', icon: FiBriefcase },
  ];

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
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl shadow-lg transition-all">
                <div className="bg-white">
                  <Dialog.Title className="text-xl font-semibold text-gray-900 px-6 py-4 border-b border-gray-200">
                    Add New User
                  </Dialog.Title>

                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                      {tabs.map(tab => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'user' | 'employee')}
                            className={`
                              flex-1 flex items-center justify-center px-4 py-3 text-sm font-medium
                              ${
                                activeTab === tab.id
                                  ? 'border-b-2 border-blue-500 text-blue-600'
                                  : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }
                            `}
                          >
                            <Icon className="w-4 h-4 mr-2" />
                            {tab.name}
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  <div className="px-6 py-4">
                    {/* User Tab Content */}
                    {activeTab === 'user' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Username *
                          </label>
                          <input
                            type="text"
                            value={newUser.username}
                            onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                          </label>
                          <input
                            type="password"
                            value={newUser.password}
                            onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Role *
                          </label>
                          <Listbox
                            value={newUser.role}
                            onChange={value => setNewUser({ ...newUser, role: value })}
                          >
                            <div className="relative mt-1">
                              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
                                <span className="block truncate">
                                  {roles.find(role => role.id === newUser.role)?.name}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <FiChevronDown
                                    className="h-5 w-5 text-gray-400"
                                    aria-hidden="true"
                                  />
                                </span>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  {roles.map(role => (
                                    <Listbox.Option
                                      key={role.id}
                                      className={({ active, selected }) =>
                                        `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                          active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                        } ${selected ? 'bg-blue-100' : ''}`
                                      }
                                      value={role.id}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span
                                            className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                          >
                                            {role.name}
                                          </span>
                                          {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                              <FiCheck className="h-5 w-5" aria-hidden="true" />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>
                      </div>
                    )}

                    {/* Employee Tab Content */}
                    {activeTab === 'employee' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            value={newUser.fullName}
                            onChange={e => setNewUser({ ...newUser, fullName: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={newUser.email}
                            onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                          </label>
                          <input
                            type="tel"
                            value={newUser.phone}
                            onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Position
                          </label>
                          <input
                            type="text"
                            value={newUser.position}
                            onChange={e => setNewUser({ ...newUser, position: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address
                          </label>
                          <textarea
                            value={newUser.address}
                            onChange={e => setNewUser({ ...newUser, address: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isCreating}
                      className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4 inline" />
                          Creating...
                        </>
                      ) : (
                        'Add User'
                      )}
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

export default AddUserModal;
