'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/button';
import Select from '@/components/select';
import '../../styles/globals.css';

interface AttendanceRecord {
  date: string;
  store: string;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  workHours: string;
  overtime: string;
}

const AttendanceRecordList: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<{ value: string, label: string }[]>([]);
  const [isSearched, setIsSearched] = useState<boolean>(false);

  useEffect(() => {
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      const parsedEmployees = JSON.parse(storedEmployees);
      const formattedEmployees = parsedEmployees.map((employee: { id: number, name: string }) => ({
        value: employee.id.toString(),
        label: employee.name,
      }));
      setEmployees(formattedEmployees);
    }
  }, []);

  const handleSearch = () => {
    // 仮のデータを設定
    setAttendanceRecords([
      { date: '2024-03-01', store: '東京店', startTime: '09:00', breakStart: '14:05', breakEnd: '16:58', endTime: '18:00', workHours: '8:00', overtime: '1:00' },
      { date: '2024-03-02', store: '大阪店', startTime: '10:00', breakStart: '', breakEnd: '', endTime: '18:00', workHours: '8:00', overtime: '0:00' },
    ]);
    setIsSearched(true);
  };

  return (
    <div className="min-h-screen p-6 mx-auto bg-custom-green">
      <div className="bg-custom-cream rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">勤怠記録一覧</h1>
        <div className="flex space-x-4 mb-6">
            <Select
            options={employees}
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-[120px] h-[30px] p-[4px]"
            />
            <Select
            options={[
              { value: '2023', label: '2023年' },
              { value: '2024', label: '2024年' },
              { value: '2025', label: '2025年' },
            ]}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-[100px] h-[30px] p-[4px]"
            />
            <Select
            options={Array.from({ length: 12 }, (_, i) => ({
              value: `${i + 1}`,
              label: `${i + 1}月`,
            }))}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-[90px] h-[30px] p-[4px]"
            />
            <Button 
            onClick={handleSearch}
            variant="primary"
            height="30px"
            >
            検索
            </Button>
        </div>
        
        {isSearched && attendanceRecords.length > 0 && (
            <table className="w-full border-collapse border border-gray-300">
            <thead>
                <tr className="bg-content-green">
                <th className="border border-gray-300 p-2">日付</th>
                <th className="border border-gray-300 p-2">店舗</th>
                <th className="border border-gray-300 p-2">開始時刻</th>
                <th className="border border-gray-300 p-2">休憩開始</th>
                <th className="border border-gray-300 p-2">休憩終了</th>
                <th className="border border-gray-300 p-2">終了時刻</th>
                <th className="border border-gray-300 p-2">勤務時間</th>
                <th className="border border-gray-300 p-2">時間外労働</th>
                </tr>
            </thead>
            <tbody>
                {attendanceRecords.map((record, index) => (
                <tr key={index}>
                    <td className="border border-gray-300 p-2 text-gray-800">{record.date}</td>
                    <td className="border border-gray-300 p-2 text-gray-800">{record.store}</td>
                    <td className="border border-gray-300 p-2 text-gray-800">{record.startTime}</td>
                    <td className="border border-gray-300 p-2 text-gray-800">{record.breakStart}</td>
                    <td className="border border-gray-300 p-2 text-gray-800">{record.breakEnd}</td>
                    <td className="border border-gray-300 p-2 text-gray-800">{record.endTime}</td>
                    <td className="border border-gray-300 p-2 text-gray-800">{record.workHours}</td>
                    <td className="border border-gray-300 p-2 text-gray-800">{record.overtime}</td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        
        {isSearched && attendanceRecords.length === 0 && (
            <p className="text-center mt-4 text-gray-800">該当する勤怠記録がありません。</p>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecordList;
