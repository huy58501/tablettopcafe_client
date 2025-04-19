'use client';
import { useEffect, useState } from 'react';
import React from 'react';
import { FiChevronDown, FiChevronUp, FiFolder, FiGrid } from 'react-icons/fi';
import { useTables } from '@/hooks/useTable';
import SpinningModal from '@/components/UI/SpinningModal';

interface User {
  id: string;
  username: string;
  email?: string;
  role?: string;
  created_at?: string;
  loginHistory?: {
    ip: string;
    device: string;
    login_time: string;
  }[];
}

interface TableStatus {
  id: string;
  number: string;
  status: 'occupied' | 'available' | 'reserved';
  room: string;
  capacity: number;
  bookings?: {
    id: number;
    customerName: string;
    peopleCount: number;
    order?: {
      id: number;
      status: string;
      total: number;
      createdAt: string;
      orderItems: {
        id: number;
        quantity: number;
        price: number;
        dish: {
          id: number;
          name: string;
          price: number;
        };
      }[];
    };
  }[];
}

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: string;
  status: 'active' | 'ended';
  role: string;
}

interface Incident {
  id: string;
  type: 'accident' | 'spill' | 'equipment' | 'other';
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'open' | 'resolved' | 'in_progress';
  severity: 'low' | 'medium' | 'high';
}

interface SalesMetrics {
  today: {
    total: number;
    orders: number;
    averageOrderValue: number;
  };
  yesterday: {
    total: number;
    orders: number;
    averageOrderValue: number;
  };
  week: {
    total: number;
    orders: number;
    averageOrderValue: number;
    dailyBreakdown: {
      date: string;
      total: number;
      orders: number;
    }[];
  };
  month: {
    total: number;
    orders: number;
    averageOrderValue: number;
    weeklyBreakdown: {
      week: string;
      total: number;
      orders: number;
    }[];
  };
}

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tables, setTables] = useState<TableStatus[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [totalOrderAmount, setTotalOrderAmount] = useState<number>(0);
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics>({
    today: { total: 0, orders: 0, averageOrderValue: 0 },
    yesterday: { total: 0, orders: 0, averageOrderValue: 0 },
    week: { total: 0, orders: 0, averageOrderValue: 0, dailyBreakdown: [] },
    month: { total: 0, orders: 0, averageOrderValue: 0, weeklyBreakdown: [] },
  });
  const [error, setError] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const { tablesData, tablesLoading } = useTables();

  const fetchUsers = async () => {
    try {
      const response = await fetch(`/api/get-users`, {
        headers: {
          credentials: 'include',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      setError('Failed to load users');
    }
  };

  const fetchOperationalData = async () => {
    if (tablesLoading) {
      return;
    }
    setTables(tablesData.allTable);

    // Calculate total order amount
    const total = tablesData.allTable.reduce((sum: number, table: TableStatus) => {
      const currentBooking =
        table.status === 'occupied' && table.bookings && table.bookings.length > 0
          ? table.bookings[table.bookings.length - 1]
          : null;
      return sum + (currentBooking?.order?.total || 0);
    }, 0);

    setTotalOrderAmount(total);
  };

  useEffect(() => {
    console.log('tablesData', tablesData);
    console.log('tables: ', tables);
    console.log('salesMetrics: ', salesMetrics);
    fetchOperationalData();
    fetchUsers();
    // Refresh operational data every 5 minutes
    const interval = setInterval(() => {
      fetchOperationalData();
    }, 300000);
    return () => clearInterval(interval);
  }, [tablesData]);

  const toggleLoginHistory = (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900">
      <SpinningModal isOpen={tablesLoading} message="Loading Data ..." onClose={() => {}} />
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 w-full">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-3 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Operational Metrics Section */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
              Operational Metrics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Table Occupancy Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-medium text-white mb-2">Table Occupancy</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {tables.filter(t => t.status === 'occupied').length}/{tables.length}
                    </p>
                    <p className="text-sm text-gray-400">Tables Occupied</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Available</p>
                    <p className="text-lg font-medium text-green-400">
                      {tables.filter(t => t.status === 'available').length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-medium text-white mb-2">Total Orders</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {
                        tables.filter(
                          t =>
                            t.status === 'occupied' &&
                            t.bookings &&
                            t.bookings.length > 0 &&
                            t.bookings[t.bookings.length - 1].order
                        ).length
                      }
                    </p>
                    <p className="text-sm text-gray-400">Active Orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Total Amount</p>
                    <p className="text-lg font-medium text-yellow-400">
                      VND {totalOrderAmount.toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Active Shifts Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-medium text-white mb-2">Active Shifts</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">{shifts.length}</p>
                    <p className="text-sm text-gray-400">Employees On Duty</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Roles</p>
                    <p className="text-lg font-medium text-blue-400">
                      {[...new Set(shifts.map(s => s.role))].length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Incidents Card */}
              <div className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
                <h3 className="text-lg font-medium text-white mb-2">Recent Incidents</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">
                      {incidents.filter(i => i.status === 'open').length}
                    </p>
                    <p className="text-sm text-gray-400">Open Incidents</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">High Priority</p>
                    <p className="text-lg font-medium text-red-400">
                      {incidents.filter(i => i.severity === 'high' && i.status === 'open').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Views */}
          <div className="space-y-6">
            {/* Tables List */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-medium text-white">Table Status</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Table #</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Room</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Status</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">
                        Party Size
                      </th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">
                        Start Time
                      </th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Duration</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">
                        Order Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...tables]
                      .sort((a, b) => parseInt(a.id) - parseInt(b.id))
                      .map(table => {
                        // Get the most recent booking if table is occupied
                        const currentBooking =
                          table.status === 'occupied' && table.bookings && table.bookings.length > 0
                            ? table.bookings[table.bookings.length - 1]
                            : null;

                        const startTime = currentBooking?.order?.createdAt
                          ? new Date(parseInt(currentBooking.order.createdAt))
                          : null;

                        const duration = startTime
                          ? Math.floor((Date.now() - startTime.getTime()) / (1000 * 60))
                          : 0;

                        return (
                          <tr key={table.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-4 text-white">{table.number}</td>
                            <td className="p-4 text-white">{table.room}</td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  table.status === 'occupied'
                                    ? 'bg-red-500/20 text-red-400'
                                    : table.status === 'reserved'
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-green-500/20 text-green-400'
                                }`}
                              >
                                {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                              </span>
                            </td>
                            <td className="p-4 text-white">{currentBooking?.peopleCount || '-'}</td>
                            <td className="p-4 text-white">
                              {startTime ? startTime.toLocaleTimeString() : '-'}
                            </td>
                            <td className="p-4 text-white">
                              {duration > 0 ? `${duration} mins` : '-'}
                            </td>
                            <td className="p-4 text-white">
                              {currentBooking?.order?.total
                                ? `${currentBooking.order.total.toLocaleString('vi-VN')}`
                                : '-'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-white/10 bg-white/5">
                      <td colSpan={6} className="p-4 text-right font-medium text-white">
                        Total:
                      </td>
                      <td className="p-4 text-white font-bold">
                        {tables
                          .reduce((sum, table) => {
                            const currentBooking =
                              table.status === 'occupied' &&
                              table.bookings &&
                              table.bookings.length > 0
                                ? table.bookings[table.bookings.length - 1]
                                : null;
                            return sum + (currentBooking?.order?.total || 0);
                          }, 0)
                          .toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Active Shifts List */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-medium text-white">Active Shifts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Employee</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Role</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">
                        Start Time
                      </th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map(shift => (
                      <tr key={shift.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4 text-white">{shift.employeeName}</td>
                        <td className="p-4 text-white">{shift.role}</td>
                        <td className="p-4 text-white">
                          {new Date(shift.startTime).toLocaleTimeString()}
                        </td>
                        <td className="p-4 text-white">
                          {Math.floor(
                            (Date.now() - new Date(shift.startTime).getTime()) / (1000 * 60)
                          )}{' '}
                          mins
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Incidents List */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-medium text-white">Recent Incidents</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Type</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">
                        Description
                      </th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">
                        Reported By
                      </th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Status</th>
                      <th className="text-left p-4 text-gray-400 text-sm font-medium">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map(incident => (
                      <tr key={incident.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              incident.type === 'accident'
                                ? 'bg-red-500/20 text-red-400'
                                : incident.type === 'spill'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : incident.type === 'equipment'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                          </span>
                        </td>
                        <td className="p-4 text-white">{incident.description}</td>
                        <td className="p-4 text-white">{incident.reportedBy}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              incident.status === 'open'
                                ? 'bg-red-500/20 text-red-400'
                                : incident.status === 'in_progress'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {incident.status.replace('_', ' ').charAt(0).toUpperCase() +
                              incident.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              incident.severity === 'high'
                                ? 'bg-red-500/20 text-red-400'
                                : incident.severity === 'medium'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-green-500/20 text-green-400'
                            }`}
                          >
                            {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/5 backdrop-blur-lg rounded-xl shadow-xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-lg font-medium text-white">Users Logs</h3>
                </div>
                <table className="w-full whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-2 md:p-4 text-gray-400 text-sm md:text-base font-medium">
                        Username
                      </th>
                      <th className="text-left p-2 md:p-4 text-gray-400 text-sm md:text-base font-medium hidden md:table-cell">
                        Role
                      </th>
                      <th className="text-left p-2 md:p-4 text-gray-400 text-sm md:text-base font-medium hidden md:table-cell">
                        Created At
                      </th>
                      <th className="text-left p-2 md:p-4 text-gray-400 text-sm md:text-base font-medium">
                        Last Login
                      </th>
                      <th className="text-left p-2 md:p-4 text-gray-400 text-sm md:text-base font-medium hidden md:table-cell">
                        IP Address
                      </th>
                      <th className="text-left p-2 md:p-4 text-gray-400 text-sm md:text-base font-medium hidden md:table-cell">
                        Device Info
                      </th>
                      <th className="text-left p-2 md:p-4 text-gray-400 text-sm md:text-base font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <React.Fragment key={user.id}>
                        <tr className="border-b border-white/5 hover:bg-white/5 transition-colors duration-200">
                          <td className="p-2 md:p-4">
                            <a
                              href={`/${user.username}/table-reservations`}
                              className="text-white text-sm md:text-base font-medium hover:text-blue-400 transition-colors duration-200"
                            >
                              {user.username}
                            </a>
                          </td>
                          <td className="p-2 md:p-4 hidden md:table-cell">
                            <div className="text-white text-sm md:text-base font-medium">
                              {user.role}
                            </div>
                          </td>
                          <td className="p-2 md:p-4 hidden md:table-cell">
                            <div className="text-white text-sm md:text-base font-medium">
                              {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                            </div>
                          </td>
                          <td className="p-2 md:p-4 text-gray-300 text-sm md:text-base">
                            {user.loginHistory && user.loginHistory.length > 0
                              ? new Date(user.loginHistory[0].login_time).toLocaleString()
                              : 'N/A'}
                          </td>
                          <td className="p-2 md:p-4 text-gray-300 text-sm md:text-base hidden md:table-cell">
                            {user.loginHistory && user.loginHistory.length > 0
                              ? user.loginHistory[0].ip
                              : 'N/A'}
                          </td>
                          <td className="p-2 md:p-4 text-gray-300 text-sm md:text-base hidden md:table-cell">
                            <div className="max-w-xs truncate">
                              {user.loginHistory && user.loginHistory.length > 0
                                ? user.loginHistory[0].device
                                : 'N/A'}
                            </div>
                          </td>
                          <td className="p-2 md:p-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleLoginHistory(user.id)}
                                className="px-2 py-1 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 transition-colors duration-200"
                              >
                                {expandedUserId === user.id ? (
                                  <>
                                    Hide
                                    <FiChevronUp className="w-3 h-3 md:w-4 md:h-4" />
                                  </>
                                ) : (
                                  <>
                                    View
                                    <FiChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* Login History Panel */}
                        {expandedUserId === user.id && (
                          <tr>
                            <td colSpan={7} className="p-0">
                              <div className="bg-slate-800/50 border-t border-white/10 p-3 md:p-4">
                                <h4 className="text-white text-sm md:text-base font-medium mb-2 md:mb-3">
                                  Login History for {user.username}
                                </h4>

                                {user.loginHistory && user.loginHistory.length > 0 ? (
                                  <div className="space-y-2 md:space-y-3">
                                    {user.loginHistory.map((login, index) => (
                                      <div
                                        key={index}
                                        className="bg-white/5 rounded-lg p-2 md:p-3 border border-white/10"
                                      >
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                                          <div>
                                            <p className="text-gray-400 text-xs md:text-sm">
                                              Login Time
                                            </p>
                                            <p className="text-white text-sm md:text-base font-medium">
                                              {new Date(login.login_time).toLocaleString()}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-400 text-xs md:text-sm">
                                              IP Address
                                            </p>
                                            <p className="text-white text-sm md:text-base font-medium">
                                              {login.ip}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="text-gray-400 text-xs md:text-sm">
                                              Device
                                            </p>
                                            <p className="text-white text-sm md:text-base font-medium truncate">
                                              {login.device}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-3 md:py-4 text-gray-400 text-sm md:text-base">
                                    No login history available for this user.
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="p-3 md:p-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 md:gap-4">
                <div className="flex items-center gap-2">
                  <button className="px-2 md:px-3 py-1 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 text-sm">
                    &lt;
                  </button>
                  <button className="px-2 md:px-3 py-1 rounded-lg bg-blue-600 text-white text-sm">
                    1
                  </button>
                  <button className="px-2 md:px-3 py-1 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 text-sm">
                    &gt;
                  </button>
                </div>
                <select
                  value={itemsPerPage}
                  onChange={e => setItemsPerPage(Number(e.target.value))}
                  className="w-full sm:w-auto bg-white/5 border border-white/10 text-gray-400 rounded-lg px-2 md:px-3 py-1 text-sm"
                >
                  <option value="10">10 rows</option>
                  <option value="20">20 rows</option>
                  <option value="50">50 rows</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
