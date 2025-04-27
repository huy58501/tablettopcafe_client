import SpinningModal from '@/components/UI/SpinningModal';
import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiEdit2, FiTrash2, FiPlus, FiSearch, FiUser } from 'react-icons/fi';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';
import EmployeeModal from './EmployeeModal';
import { getUsers, updateUser, createUser, deleteUser, User } from '@/services/userServices';

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

const AccountPage: React.FC = () => {
  const [error, setError] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editUser, setEditUser] = useState<EditUserForm>({
    role: '',
    newPassword: '',
    currentPassword: '',
    isChangingPassword: false,
  });
  const [newUser, setNewUser] = useState<NewUser>({
    username: '',
    password: '',
    role: 'client',
    fullName: '',
    email: '',
    phone: '',
    position: '',
    address: '',
  });
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const toggleLoginHistory = (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      role: user.role || 'client',
      newPassword: '',
      currentPassword: '',
      isChangingPassword: false,
    });
    setShowEditModal(true);
  };

  const handleDelete = async (user: User) => {
    setSelectedUser(user);
    try {
      setIsDeleting(true);
      await deleteUser(user.id);
      await fetchUsersData();
      setIsDeleting(false);
    } catch (err) {
      console.error('Failed to delete user:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddUser = async (newUser: NewUser) => {
    try {
      setIsCreating(true);
      setError('');
      await createUser(newUser);
      await fetchUsersData();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create user:', err);
      setError(err instanceof Error ? err.message : 'Failed to create user');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateUser = async (data: {
    username: string;
    role: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    try {
      setIsEditing(true);
      setError('');
      const currentRole = users.find(user => user.username === data.username)?.role;
      const newRole = data.role;
      await updateUser({
        username: data.username,
        role: currentRole || '',
        newRole: newRole,
        password: data.currentPassword,
        newPassword: data.newPassword,
      });
      await fetchUsersData();
      setShowEditModal(false);
    } catch (err) {
      console.error('Failed to update user:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setIsEditing(false);
    }
  };

  const handleViewEmployee = (user: User) => {
    setSelectedUser(user);
    setShowEmployeeModal(true);
  };

  // Add search filter function
  const getFilteredAndSortedUsers = (users: User[]) => {
    const filteredUsers = users.filter(
      user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employee?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.employee?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const roleOrder = { admin: 0, client: 1, tester: 2 };

    return filteredUsers.sort((a, b) => {
      const roleA = a.role || 'client';
      const roleB = b.role || 'client';

      if (
        roleOrder[roleA as keyof typeof roleOrder] !== roleOrder[roleB as keyof typeof roleOrder]
      ) {
        return (
          roleOrder[roleA as keyof typeof roleOrder] - roleOrder[roleB as keyof typeof roleOrder]
        );
      }

      return (a.username || '').localeCompare(b.username || '');
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SpinningModal isOpen={loading} message="Loading Data ..." onClose={() => {}} />
      <SpinningModal isOpen={isDeleting} message="Deleting User ..." onClose={() => {}} />
      <div className="max-w-7xl mx-auto w-full p-4 space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* User Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">User Summary</h2>
            {/* Add Dish Floating Button */}
            <button
              className="fixed bottom-6 right-6 z-40 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition cursor-pointer"
              onClick={() => setShowAddModal(true)}
              aria-label="Add Dish"
            >
              <FiPlus className="w-6 h-6" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-semibold text-lg">{users.length}</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loading ? '...' : users.length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <span className="text-green-600 font-semibold text-lg">
                    {users.filter(user => user.role === 'admin').length}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Admin Users</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loading ? '...' : users.filter(user => user.role === 'admin').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-semibold text-lg">
                    {users.filter(user => user.role !== 'admin').length}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Regular Users</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loading ? '...' : users.filter(user => user.role !== 'admin').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                  <span className="text-orange-600 font-semibold text-lg">
                    {users.filter(user => user.loginHistory && user.loginHistory.length > 0).length}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {loading
                      ? '...'
                      : users.filter(user => user.loginHistory && user.loginHistory.length > 0)
                          .length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Users List</h3>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-4 text-center text-gray-600">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-600">No users found</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {getFilteredAndSortedUsers(users).map(user => (
                <div
                  key={user.id}
                  className="group cursor-pointer"
                  onClick={() => toggleLoginHistory(user.id)}
                >
                  <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex flex-col space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-150">
                            {user.username}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.role === 'admin'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.role || 'User'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleViewEmployee(user);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="View Employee Details"
                          >
                            <FiUser className="w-5 h-5" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleEdit(user);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                            title="Edit User"
                          >
                            <FiEdit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(user);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                            title="Delete User"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                          <div className="p-2 text-gray-400 group-hover:text-gray-600 transition-colors duration-150">
                            <FiChevronDown
                              className={`w-5 h-5 transform transition-transform duration-200 ${
                                expandedUserId === user.id ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-500">
                        <p>
                          <span className="font-bold">Name</span>:{' '}
                          {user.employee?.fullName || 'N/A'}
                        </p>
                        <p>
                          <span className="font-bold">Created</span>:{' '}
                          {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                        </p>
                        <p>
                          Last Login:{' '}
                          {user.loginHistory && user.loginHistory.length > 0
                            ? new Date(
                                user.loginHistory[user.loginHistory.length - 2].login_time
                              ).toLocaleString()
                            : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {/* Login History Panel */}
                    {expandedUserId === user.id &&
                      user.loginHistory &&
                      user.loginHistory.length > 0 && (
                        <div className="mt-4 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="p-4 border-b border-gray-100">
                            <h5 className="text-sm font-medium text-gray-900">Login History</h5>
                          </div>
                          <div className="max-h-[300px] overflow-y-auto">
                            <div className="p-4 space-y-3">
                              {[...user.loginHistory]
                                .sort(
                                  (a, b) =>
                                    new Date(b.login_time).getTime() -
                                    new Date(a.login_time).getTime()
                                )
                                .map(
                                  (
                                    login: { login_time: string; ip: string; device: string },
                                    index: number
                                  ) => (
                                    <div
                                      key={index}
                                      className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-colors duration-150"
                                    >
                                      <div className="grid grid-cols-1 gap-3">
                                        <div>
                                          <p className="text-xs text-gray-500">Login Time</p>
                                          <p className="text-sm font-medium text-gray-900 mt-1">
                                            {new Date(login.login_time).toLocaleString()}
                                          </p>
                                        </div>
                                        {!login.ip.includes('Localhost Testing IP') &&
                                          !login.ip.includes('localhost') && (
                                            <div>
                                              <p className="text-xs text-gray-500">IP Address</p>
                                              <p className="text-sm font-medium text-gray-900 mt-1">
                                                {login.ip}
                                              </p>
                                            </div>
                                          )}
                                        <div>
                                          <p className="text-xs text-gray-500">Device</p>
                                          <p className="text-sm font-medium text-gray-900 mt-1 whitespace-pre-line">
                                            {login.device}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )}
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddUserModal
        isOpen={showAddModal}
        isCreating={isCreating}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
      />

      <EditUserModal
        isOpen={showEditModal}
        isEditing={isEditing}
        selectedUser={selectedUser}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateUser}
      />

      <EmployeeModal
        isOpen={showEmployeeModal}
        onClose={() => setShowEmployeeModal(false)}
        employee={selectedUser}
      />
    </div>
  );
};

export default AccountPage;
