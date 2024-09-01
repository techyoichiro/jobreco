'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/button';
import Select from '@/components/select';
import '@/styles/globals.css';

interface BreakRecordResponse {
  BreakStart: string;
  BreakEnd: string | null;
}

interface AttendanceRecord {
  ID: number;
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
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();

  const handleSearch = useCallback(async () => {
    if (!selectedEmployee || !selectedYear || !selectedMonth) {
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
        ID: record.ID,
        WorkDate: record.WorkDate,
        StartTime: record.StartTime,
        EndTime: record.EndTime ? record.EndTime : '-',
        TotalWorkTime: record.TotalWorkTime,
        BreakRecords: record.BreakRecords
          ? record.BreakRecords.map(breakRecord => ({
              BreakStart: breakRecord.BreakStart ? breakRecord.BreakStart : '-',
              BreakEnd: breakRecord.BreakEnd ? breakRecord.BreakEnd : '-',
            }))
          : [],
        Overtime: record.Overtime,
        Remarks: record.Remarks,
        HourlyPay: record.HourlyPay,
      }));

      setAttendanceRecords(formattedData);
      setIsSearched(true);

      // ローカルストレージの更新
      localStorage.setItem('selectedEmployee', selectedEmployee);
      localStorage.setItem('selectedYear', selectedYear);
      localStorage.setItem('selectedMonth', selectedMonth);
      localStorage.setItem('isSearched', 'true');
      localStorage.setItem('attendanceRecords', JSON.stringify(formattedData));
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, [selectedEmployee, selectedYear, selectedMonth]);

  useEffect(() => {
    if (initialLoad) {
      const now = new Date();
      const currentYear = now.getFullYear().toString();
      const currentMonth = (now.getMonth() + 1).toString();

      // ローカルストレージから値を取得（初回のみ）
      const storedEmployee = localStorage.getItem('selectedEmployee') || '';
      const storedYear = localStorage.getItem('selectedYear') || currentYear;
      const storedMonth = localStorage.getItem('selectedMonth') || currentMonth;
      const storedIsSearched = localStorage.getItem('isSearched') === 'true';
      const storedAttendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');

      setSelectedEmployee(storedEmployee);
      setSelectedYear(storedYear);
      setSelectedMonth(storedMonth);
      setIsSearched(storedIsSearched);
      setAttendanceRecords(storedAttendanceRecords);

      // 役割ID取得と従業員情報の設定
      const storedRoleID = localStorage.getItem('roleID');
      if (storedRoleID) {
        const roleID = Number(storedRoleID);
        setRoleID(roleID);

        if (roleID === 2) {
          const storedEmployeeID = localStorage.getItem('empID');
          if (storedEmployeeID) {
            setSelectedEmployee(storedEmployeeID);
          }
        } else {
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

      setInitialLoad(false);
    } else if (isSearched) {
      handleSearch();
    }
  }, [handleSearch, initialLoad, isSearched]);

  const handleDateClick = async (summaryID: number) => {
    try {
      const response = await fetch(`http://localhost:8080/summary/edit/${summaryID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch summary data');
      }
      localStorage.setItem('editSummaryID', summaryID.toString());
      
      router.push(`/summary/edit`);
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
                  <td className="border border-gray-300 p-2 text-blue-600 hover:text-blue-800">
                    <Link href="#" onClick={() => handleDateClick(record.ID)}>
                      {record.WorkDate}
                    </Link>
                  </td>
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