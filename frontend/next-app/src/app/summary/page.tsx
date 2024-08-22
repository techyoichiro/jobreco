'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/button';
import Select from '@/components/select';
import '@/styles/globals.css';
import { formatDate, formatTime } from '@/utils/formatter';

interface BreakRecordResponse {
  BreakStart: string;
  BreakEnd: string | null;
}

interface AttendanceRecord {
  WorkDate: string;
  StartTime: string;
  EndTime: string | null;
  TotalWorkTime: number;
  BreakRecords: BreakRecordResponse[] | null;
  Overtime: number;
  Remarks: string;
  HourlyPay: number;
}

const AttendanceRecordList: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<{ value: string, label: string }[]>([]);
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [roleID, setRoleID] = useState<number | null>(null);

  useEffect(() => {
    // 役割ID取得
    const storedRoleID = localStorage.getItem('roleID');
    if (storedRoleID) {
      const roleID = Number(storedRoleID);
      setRoleID(roleID);

      // 一般権限従業員の場合従業員IDを自動で設定
      if (roleID === 2) {
        const storedEmployeeID = localStorage.getItem('empID');
        if (storedEmployeeID) {
          setSelectedEmployee(storedEmployeeID);
        }
      } else {
        // ローカルストレージに従業員IDと名前を保存
        const storedEmployees = localStorage.getItem('employees');
        if (storedEmployees) {
          const parsedEmployees = JSON.parse(storedEmployees);
          const formattedEmployees = parsedEmployees.map((employee: { id: number, name: string }) => ({
            value: employee.id.toString(),
            label: employee.name,
          }));
          setEmployees(formattedEmployees);
        }
      }
    }
  }, []);

  const handleSearch = async () => {
    // Check if all required fields have values
    if (!selectedEmployee) {
      alert('従業員を選択してください');
      return;
    }
    if (!selectedYear) {
      alert('年を選択してください');
      return;
    }
    if (!selectedMonth) {
      alert('月を選択してください');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/summary/${selectedEmployee}/${selectedYear}/${selectedMonth}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: AttendanceRecord[] | undefined = await response.json();

      if (!data) {
        throw new Error('No data received');
      }

      const formattedData = data.map(record => ({
        WorkDate: formatDate(record.WorkDate),
        StartTime: formatTime(record.StartTime),
        EndTime: record.EndTime ? formatTime(record.EndTime) : '-',
        TotalWorkTime: record.TotalWorkTime,
        BreakRecords: record.BreakRecords
          ? record.BreakRecords.map(breakRecord => ({
              BreakStart: breakRecord.BreakStart ? formatTime(breakRecord.BreakStart) : '-',
              BreakEnd: breakRecord.BreakEnd ? formatTime(breakRecord.BreakEnd) : '-',
            }))
          : [],
        Overtime: record.Overtime,
        Remarks: record.Remarks,
        HourlyPay: record.HourlyPay,
      }));

      setAttendanceRecords(formattedData);
      setIsSearched(true);
    } catch (error) {
      console.error('Fetch error:', error);
    }
  };

  const formatRemarks = (remarks: string) => {
    const storeMap: { [key: string]: string } = {
      '1': '我家',
      '2': 'Ate',
    };
  
    return remarks
      .split(', ')
      .map((remark) => {
        const [timeRange, storeID] = remark.split(' ');
        const storeName = storeMap[storeID] || storeID;
        return `${storeName}：${timeRange}`;
      })
      .join('\n');
  };

  const getTotalWorkTime = () => {
    return attendanceRecords.reduce((total, record) => total + record.TotalWorkTime, 0).toFixed(2);
  };

  const getTotalOvertime = () => {
    return attendanceRecords.reduce((total, record) => total + record.Overtime, 0).toFixed(2);
  };

  const getTotalFee = () => {
    const totalWorkTime = parseFloat(getTotalWorkTime());
    const totalOvertime = parseFloat(getTotalOvertime());
    const regularWorkTime = totalWorkTime - totalOvertime;
    const hourlyPay = attendanceRecords.length > 0 ? attendanceRecords[0].HourlyPay : 0;
    const regularPay = regularWorkTime * hourlyPay;
    const overtimePay = totalOvertime * hourlyPay * 1.25;
    const totalFee = parseInt((regularPay + overtimePay).toFixed(2))
    return `予定支給額：${totalFee}円`;
  };

  return (
    <div className="min-h-screen p-6 mx-auto bg-custom-green">
      <div className="bg-custom-cream rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">勤怠記録一覧</h1>
        <div className="flex space-x-4 mb-6">
          {roleID === 1 && (
            <Select
              options={employees}
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-[150px] h-[30px] p-[4px]"
              placeholder="従業員を選択"
            />
          )}
          <Select
            options={[
              { value: '2023', label: '2023年' },
              { value: '2024', label: '2024年' },
              { value: '2025', label: '2025年' },
            ]}
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="w-[120px] h-[30px] p-[4px]"
            placeholder="年を選択"
          />
          <Select
            options={Array.from({ length: 12 }, (_, i) => ({
              value: `${i + 1}`,
              label: `${i + 1}月`,
            }))}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-[120px] h-[30px] p-[4px]"
            placeholder="月を選択"
          />
          <Button
            onClick={handleSearch}
            variant="primary"
            className="h-[30px] px-4 py-2 rounded-md font-semibold bg-blue-500 text-white hover:bg-blue-600"
          >
            検索
          </Button>
        </div>

        {isSearched && attendanceRecords.length > 0 && (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-content-green">
                <th className="border border-gray-300 p-2">日付</th>
                <th className="border border-gray-300 p-2">開始時刻</th>
                <th className="border border-gray-300 p-2">休憩開始</th>
                <th className="border border-gray-300 p-2">休憩終了</th>
                <th className="border border-gray-300 p-2">終了時刻</th>
                <th className="border border-gray-300 p-2">勤務時間</th>
                <th className="border border-gray-300 p-2">時間外労働</th>
                <th className="border border-gray-300 p-2">備考</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2 text-gray-800">{record.WorkDate}</td>
                  <td className="border border-gray-300 p-2 text-gray-800">{record.StartTime}</td>
                  <td className="border border-gray-300 p-2 text-gray-800">
                    {record.BreakRecords && record.BreakRecords.length > 0
                      ? record.BreakRecords.map((br, i) => (
                        <div key={i}>
                          {br.BreakStart}
                        </div>
                      ))
                      : '-'}
                  </td>
                  <td className="border border-gray-300 p-2 text-gray-800">
                    {record.BreakRecords && record.BreakRecords.length > 0
                      ? record.BreakRecords.map((br, i) => (
                        <div key={i}>
                          {br.BreakEnd}
                        </div>
                      ))
                      : '-'}
                  </td>
                  <td className="border border-gray-300 p-2 text-gray-800">{record.EndTime}</td>
                  <td className="border border-gray-300 p-2 text-gray-800">{record.TotalWorkTime}</td>
                  <td className="border border-gray-300 p-2 text-gray-800">
                    {record.Overtime !== undefined && record.Overtime !== null  && record.Overtime !== 0
                      ? record.Overtime.toFixed(2)
                      : '-'}
                  </td>
                  <td className="border border-gray-300 p-2 text-gray-800">
                    {formatRemarks(record.Remarks)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-400">
                <td className="border border-gray-300 p-2 text-gray-800">合計</td>
                <td className="border border-gray-300 p-2 text-gray-800"></td>
                <td className="border border-gray-300 p-2 text-gray-800"></td>
                <td className="border border-gray-300 p-2 text-gray-800"></td>
                <td className="border border-gray-300 p-2 text-gray-800"></td>
                <td className="border border-gray-300 p-2 text-gray-800">{getTotalWorkTime()}</td>
                <td className="border border-gray-300 p-2 text-gray-800">{getTotalOvertime()}</td>
                <td className="border border-gray-300 p-2 text-gray-800">{getTotalFee()}</td>
              </tr>
            </tfoot>
          </table>
        )}

        {isSearched && attendanceRecords.length === 0 && (
          <p className="text-center mt-4 text-gray-800">該当する勤怠記録がありません。</p>
        )}

        <div className="mt-4 text-left">
          <Link href="/attendance" className="text-blue-600 hover:text-blue-800 underline">
            打刻画面へ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AttendanceRecordList;
