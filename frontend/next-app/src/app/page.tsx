'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import '../styles/globals.css';

const LogIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const response = await axios.post('http://localhost:8080/auth/login', {
            login_id: email,
            password: password
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            withCredentials: true
        });

        if (response.status === 200) {
            console.log('ログイン成功', response.data.employee.Name);
            localStorage.setItem('empID', response.data.employee.ID.toString());
            localStorage.setItem('userName', response.data.employee.Name);
            localStorage.setItem('statusID', response.data.status_id.toString());
            router.push('/attendance'); // ログイン成功後に attendance 画面へ遷移
        } else {
            setError('ログインに失敗しました。入力情報を確認してください。');
        }
    } catch (error: any) {
        console.error('ログインエラー:', error);
        setError('ログインに失敗しました。入力情報を確認してください。'); // エラーメッセージを設定
    }
};

  return (
    <div className="min-h-screen bg-custom-green flex items-center justify-center p-4">
      <div className="bg-custom-cream rounded-lg shadow overflow-hidden w-full max-w-md">
        <div className="bg-custom-cream p-6 pb-0">
          <div className="flex justify-center">
            <Image
              src="/content/login_logo.png"
              alt="ログインロゴ"
              width={200}
              height={50}
              className="mx-auto w-24 mb-4"
            />
          </div>
        </div>
        <div className="bg-content-green p-6 pt-0 custom-container">
          <h2 className="text-2xl font-bold text-center mb-3">Log In</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleLogin} className="space-y-4 flex flex-col items-center">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">ログインID</label>
              <input 
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 p-2 block w-72 h-8 text-gray-700 rounded-md shadow-sm bg-custom-cream"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium text-white">パスワード</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 p-2 block w-72 h-8 text-gray-800 rounded-md shadow-sm bg-custom-cream"
                required
              />
            </div>
            <button
              type="submit"
              className="w-72 bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              ログイン
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-white">
            アカウントをお持ちでないですか？{' '}
            <Link href="/signup" className="text-yellow-500 hover:text-gray-100">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogIn;
