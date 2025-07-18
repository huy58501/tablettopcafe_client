import React, { Fragment } from 'react';
import { Dialog, Listbox, Transition } from '@headlessui/react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { FaSpinner } from 'react-icons/fa';

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
  created_at?: string;
}

interface EditUserForm {
  role: string;
  newPassword: string;
  currentPassword: string;
  isChangingPassword: boolean;
}

const roles = [
  { id: 'admin', name: 'Admin' },
  { id: 'client', name: 'Client' },
  { id: 'tester', name: 'Tester' },
];

interface EditUserModalProps {
  isOpen: boolean;
  isEditing: boolean;
  selectedUser: User | null;
  onClose: () => void;
  onSubmit: (data: {
    username: string;
    role: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  isEditing,
  selectedUser,
  onClose,
  onSubmit,
}) => {
  const [editUser, setEditUser] = React.useState<EditUserForm>({
    role: '',
    newPassword: '',
    currentPassword: '',
    isChangingPassword: false,
  });

  React.useEffect(() => {
    if (selectedUser) {
      setEditUser({
        role: selectedUser.role || 'client',
        newPassword: '',
        currentPassword: '',
        isChangingPassword: false,
      });
    }
  }, [selectedUser]);

  const handleSubmit = async () => {
    await onSubmit({
      username: selectedUser?.username || '',
      role: editUser.role,
      ...(editUser.isChangingPassword && {
        currentPassword: editUser.currentPassword,
        newPassword: editUser.newPassword,
      }),
    });
  }; 

  const handleSubmitBlocked = () => {
    console.log("Save Change is Blocked");
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
          <div className="fixed inset-0 bg-gray-500/75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="bg-white px-6 py-6">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900 mb-6"
                  >
                    Edit User
                  </Dialog.Title>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                        Username
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <input
                          type="text"
                          value={selectedUser?.username || ''}
                          readOnly
                          className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 bg-gray-50 cursor-not-allowed sm:text-sm sm:leading-6"
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Username cannot be changed</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                        Role
                      </label>
                      <Listbox
                        value={editUser.role}
                        onChange={value => setEditUser({ ...editUser, role: value })}
                      >
                        <div className="relative mt-1">
                          <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white py-3 pl-4 pr-10 text-left ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6">
                            <span className="block truncate">
                              {roles.find(role => role.id === editUser.role)?.name || 'Select Role'}
                            </span>
                            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                              <FiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                          </Listbox.Button>
                          <Transition
                            as={Fragment}
                            leave="transition ease-in duration-100"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                          >
                            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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

                    <div className="border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          setEditUser(prev => ({
                            ...prev,
                            isChangingPassword: !prev.isChangingPassword,
                          }))
                        }
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
                      >
                        <span className="text-sm font-medium text-gray-900">Change Password</span>
                        <FiChevronDown
                          className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                            editUser.isChangingPassword ? 'transform rotate-180' : ''
                          }`}
                        />
                      </button>

                      {editUser.isChangingPassword && (
                        <div className="p-4 space-y-4 bg-white">
                          <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                              Current Password
                            </label>
                            <div className="relative rounded-md shadow-sm">
                              <input
                                type="password"
                                value={editUser.currentPassword}
                                onChange={e =>
                                  setEditUser({ ...editUser, currentPassword: e.target.value })
                                }
                                placeholder="Enter current password"
                                className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900 mb-2">
                              New Password
                            </label>
                            <div className="relative rounded-md shadow-sm">
                              <input
                                type="password"
                                value={editUser.newPassword}
                                onChange={e =>
                                  setEditUser({ ...editUser, newPassword: e.target.value })
                                }
                                placeholder="Enter new password"
                                className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitBlocked}
                    disabled={
                      isEditing ||
                      (editUser.isChangingPassword &&
                        (!editUser.currentPassword || !editUser.newPassword))
                    }
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isEditing ? (
                      <>
                        <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditUserModal;
