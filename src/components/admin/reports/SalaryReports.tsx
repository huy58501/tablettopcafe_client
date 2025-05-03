import { useState } from 'react';
// import your hooks/services for fetching staff and shifts
// import a date picker component (e.g. react-datepicker or your own)

interface Staff {
  id: number;
  name: string;
  // ...other fields
}

interface Shift {
  id: number;
  staffId: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export default function ShiftReports() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'month'>('month');
  const [hourlyRate, setHourlyRate] = useState<number>(0); // You can add a UI for this later

  // Fetch staff and shifts here (replace with your actual data fetching logic)
  const staffList: Staff[] = []; // get from API
  const shifts: Shift[] = []; // get from API

  // Filter shifts for the selected period
  const filteredShifts = shifts.filter(shift => {
    const shiftDate = new Date(shift.startTime);
    if (viewMode === 'day') {
      return (
        shiftDate.getFullYear() === selectedDate.getFullYear() &&
        shiftDate.getMonth() === selectedDate.getMonth() &&
        shiftDate.getDate() === selectedDate.getDate()
      );
    } else {
      return (
        shiftDate.getFullYear() === selectedDate.getFullYear() &&
        shiftDate.getMonth() === selectedDate.getMonth()
      );
    }
  });

  // Calculate total hours per staff
  const staffReports = staffList.map(staff => {
    const staffShifts = filteredShifts.filter(shift => shift.staffId === staff.id);
    const totalHours = staffShifts.reduce((sum, shift) => {
      const start = new Date(shift.startTime);
      const end = new Date(shift.endTime);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }, 0);
    return {
      ...staff,
      totalHours,
      salary: totalHours * hourlyRate,
    };
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Shift Reports</h1>
      <div className="flex gap-4 mb-6">
        <select
          value={viewMode}
          onChange={e => setViewMode(e.target.value as 'day' | 'month')}
          className="border rounded px-2 py-1"
        >
          <option value="day">By Day</option>
          <option value="month">By Month</option>
        </select>
        {/* Replace with your date picker */}
        <input
          type={viewMode === 'day' ? 'date' : 'month'}
          value={
            viewMode === 'day'
              ? selectedDate.toISOString().slice(0, 10)
              : selectedDate.toISOString().slice(0, 7)
          }
          onChange={e => {
            const val = e.target.value;
            setSelectedDate(new Date(val));
          }}
          className="border rounded px-2 py-1"
        />
        {/* Hourly rate input (optional for now) */}
        <input
          type="number"
          placeholder="Hourly Rate"
          value={hourlyRate}
          onChange={e => setHourlyRate(Number(e.target.value))}
          className="border rounded px-2 py-1 w-32"
        />
      </div>
      <table className="w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th className="p-2 border-b">Staff</th>
            <th className="p-2 border-b">Total Hours</th>
            <th className="p-2 border-b">Salary</th>
          </tr>
        </thead>
        <tbody>
          {staffReports.map(report => (
            <tr key={report.id}>
              <td className="p-2 border-b">{report.name}</td>
              <td className="p-2 border-b">{report.totalHours.toFixed(2)}</td>
              <td className="p-2 border-b">{(report.salary || 0).toLocaleString()} ₫</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
