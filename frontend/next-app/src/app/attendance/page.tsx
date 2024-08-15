'use client';

import React, { useState, useEffect } from 'react';
import '../../styles/globals.css';

const AttendanceScreen: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [status, setStatus] = useState('未出勤');
  const [location, setLocation] = useState('我家');
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // ローカルストレージからユーザー名を取得
    const storedName = localStorage.getItem('userName');
    setUserName(storedName);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-custom-green">
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
          <div className="flex items-center font-bold">
            <span>ステータス：{status}</span>
          </div>
          <div className="mt-2">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-1/3 p-2 text-gray-700 rounded-md"
            >
              <option value="我家">我家</option>
              <option value="Ate">Ate</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <button
            onClick={() => handleStatusChange('出勤')}
            className="bg-white text-green-600 border border-green-600 rounded-md py-2"
          >
            出勤
          </button>
          <button
            onClick={() => handleStatusChange('退勤')}
            className="bg-white text-green-600 border border-green-600 rounded-md py-2"
          >
            退勤
          </button>
          <button
            onClick={() => handleStatusChange('外出')}
            className="bg-white text-green-600 border border-green-600 rounded-md py-2"
          >
            外出
          </button>
          <button
            onClick={() => handleStatusChange('戻り')}
            className="bg-white text-green-600 border border-green-600 rounded-md py-2"
          >
            戻り
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceScreen;
