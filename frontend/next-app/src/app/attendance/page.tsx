'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Button from '@/components/button';
import '../../styles/globals.css';

const statusMap: Record<number, string> = {
  0: '未出勤',
  1: '勤務中',
  2: '外出中',
  3: '退勤済み',
};

const storeMap: Record<number, string> = {
  1: '我家',
  2: 'Ate',
};

const AttendanceScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState('未出勤');
  const [location, setLocation] = useState('1');
  const [userName, setUserName] = useState<string | null>(null);
  const [statusID, setStatusID] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [employees, setEmployees] = useState<{ value: string, label: string }[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const userName = localStorage.getItem('userName');
    const storedStatusID = localStorage.getItem('statusID');

    setUserName(userName);

    if (storedStatusID) {
      const id = parseInt(storedStatusID, 10);
      setStatusID(id);
      setStatus(statusMap[id] || '未出勤');
    }

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const handleStatusChange = async (Stamp: string) => {
    setErrorMessage(null);
    const storeID = parseInt(location, 10);
    try {
      const response = await axios.post(`http://localhost:8080/attendance/${Stamp}`, {
        employee_id: parseInt(localStorage.getItem('empID') || "0", 10),
        store_id: storeID,
      });

      if (response.status === 200) {
        const { data } = response;
        setStatusID(data.statusID);
        setStatus(statusMap[data.statusID] || '未出勤');
        localStorage.setItem('statusID', data.statusID.toString());
      }
    } catch (error) {
      console.error('Error updating status:', error);
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data.error);
      }
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8080/summary/init');
      if (response.status === 200) {
        const employees = response.data;
        // JSON.stringifyでオブジェクトを文字列に変換して保存
        localStorage.setItem('employees', JSON.stringify(employees));
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-custom-green p-4">
      <div className="bg-custom-cream rounded-lg shadow-lg p-8 w-96">
        <div className="text-center mb-4">
          <h2 className="text-gray-800 text-xl font-bold">
            {userName ? `${userName}さん お疲れ様です！` : 'お疲れ様です！'}
          </h2>
        </div>
        <div className="bg-green-600 text-white p-6 rounded-lg">
          <div className="text-4xl font-bold text-center mb-4">
            {formatTime(currentTime)}
          </div>
          {errorMessage && (
            <div className="text-xl font-bold text-center mb-4 text-red-600">
              {errorMessage}
            </div>
          )}
          <div className="flex items-center font-bold">
            <span>ステータス：{statusMap[statusID]}</span>
          </div>
          <div className="mt-2">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-1/3 p-2 text-gray-700 rounded-md"
            >
              {Object.entries(storeMap).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button
            onClick={() => handleStatusChange('clockin')}
            variant="attendance"
            disabled={statusID !== 0}
          >
            出勤
          </Button>
          <Button
            onClick={() => handleStatusChange('clockout')}
            variant="attendance"
            disabled={statusID !== 1}
          >
            退勤
          </Button>
          <Button
            onClick={() => handleStatusChange('goout')}
            variant="attendance"
            disabled={statusID !== 1}
          >
            外出
          </Button>
          <Button
            onClick={() => handleStatusChange('return')}
            variant="attendance"
            disabled={statusID !== 2}
          >
            戻り
          </Button>
        </div>
        
          <div className="mt-4 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 underline">
              ログイン画面へ
            </Link>
            <Link href="/summary" className="ml-3 text-blue-600 hover:text-blue-800 underline" onClick={fetchEmployees}>
              勤怠集計画面へ
            </Link>
          </div>
      </div>
    </div> 
  );
};

export default AttendanceScreen;