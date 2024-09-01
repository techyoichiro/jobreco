'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Button from '@/components/button';
import Select from '@/components/select';

interface BreakRecord {
  ID: number;
  WorkDate: string;
  BreakStart: string;
  BreakEnd: string;
}

interface WorkSegment {
  ID: number;
  WorkDate: string;
  StoreID: number;
  StartTime: string;
  EndTime: string;
}

interface AttendanceRecord {
  workSegments: WorkSegment[];
  breakRecord: BreakRecord;
}

const storeMap: Record<number, string> = {
  1: '我家',
  2: 'Ate',
};

const EditRecords: React.FC = () => {
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRecord = async () => {
      const summaryID = localStorage.getItem('editSummaryID');
      if (!summaryID) {
        alert('No summary ID found');
        router.push('/summary');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:8080/summary/edit/${summaryID}`);
        setRecord(response.data);
      } catch (error) {
        console.error('Fetch error:', error);
        alert('Failed to fetch record data');
      }
    };

    fetchRecord();
  }, [router]);

  if (!record) {
    return <div>Loading...</div>;
  }

  const storeOptions = Object.entries(storeMap).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  return (
    <div className="min-h-screen p-6 mx-auto bg-custom-green">
      <div className="bg-custom-cream rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">打刻修正</h1>

        {/* 勤務記録のテーブル */}
        <table className="border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-content-green">
              <th className="border border-gray-300 p-2">日付</th>
              <th className="border border-gray-300 p-2">店舗</th>
              <th className="border border-gray-300 p-2">勤務開始</th>
              <th className="border border-gray-300 p-2">勤務終了</th>
            </tr>
          </thead>
          <tbody>
            {record.workSegments.map((segment) => (
              <tr key={segment.ID}>
                <td className="border border-gray-300 p-2 text-gray-800">{segment.WorkDate}</td>
                <td className="border border-gray-300 p-2 text-gray-800">
                  <Select
                    options={storeOptions}
                    value={String(segment.StoreID)}
                    onChange={(e) => {
                      const newSegments = [...record.workSegments];
                      const index = newSegments.findIndex(s => s.ID === segment.ID);
                      if (index > -1) {
                        newSegments[index].StoreID = Number(e.target.value);
                        setRecord({ ...record, workSegments: newSegments });
                      }
                    }}
                    className="w-full h-[33px] p-[4px]"
                  />
                </td>
                <td className="border border-gray-300 p-2 text-gray-800">
                  <input
                    type="time"
                    value={segment.StartTime}
                    onChange={(e) => {
                      const newSegments = [...record.workSegments];
                      const index = newSegments.findIndex(s => s.ID === segment.ID);
                      if (index > -1) {
                        newSegments[index].StartTime = e.target.value;
                        setRecord({ ...record, workSegments: newSegments });
                      }
                    }}
                    className="p-1 border rounded"
                  />
                </td>
                <td className="border border-gray-300 p-2 text-gray-800 h-8">
                  <input
                    type="time"
                    value={segment.EndTime}
                    onChange={(e) => {
                      const newSegments = [...record.workSegments];
                      const index = newSegments.findIndex(s => s.ID === segment.ID);
                      if (index > -1) {
                        newSegments[index].EndTime = e.target.value;
                        setRecord({ ...record, workSegments: newSegments });
                      }
                    }}
                    className="w-full p-1 border rounded h-8"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 休憩記録のテーブル */}
        {record.breakRecord && (
          <table className="border-collapse border border-gray-300">
            <thead>
              <tr className="bg-content-green">
                <th className="border border-gray-300 p-2">日付</th>
                <th className="border border-gray-300 p-2">休憩開始</th>
                <th className="border border-gray-300 p-2">休憩終了</th>
              </tr>
            </thead>
            <tbody>
              <tr key={record.breakRecord.ID}>
                <td className="border border-gray-300 p-2 text-gray-800">{record.breakRecord.WorkDate}</td>
                <td className="border border-gray-300 p-2 text-gray-800">
                  <input
                    type="time"
                    value={record.breakRecord.BreakStart}
                    onChange={(e) => {
                      setRecord({
                        ...record,
                        breakRecord: {
                          ...record.breakRecord,
                          BreakStart: e.target.value,
                        }
                      });
                    }}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="border border-gray-300 p-2 text-gray-800 h-8">
                  <input
                    type="time"
                    value={record.breakRecord.BreakEnd}
                    onChange={(e) => {
                      setRecord({
                        ...record,
                        breakRecord: {
                          ...record.breakRecord,
                          BreakEnd: e.target.value,
                        }
                      });
                    }}
                    className="w-full p-1 border rounded h-8"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        )}

        <div className="flex justify-between mt-4">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            キャンセル
          </Button>
          <Button
            onClick={async () => {
              try {
                await axios.post(`http://localhost:8080/summary/edit/${record.workSegments[0].ID}`, record, {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                alert('Record updated successfully');
                router.push('/summary');
              } catch (error) {
                console.error('Update error:', error);
                alert('Failed to update record');
              }
            }}
            variant="primary"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            保存
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditRecords;
