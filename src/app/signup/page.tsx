'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import '../../styles/globals.css';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (password !== confirmPassword) {
      alert('パスワードが一致していません');
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:8080/auth/signup',
        {
          name: name,
          login_id: email,
          password: password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
  
      if (response.status === 200) {
        console.log('サインアップが成功しました');
        router.push('/');
      } else {
        console.error('サインアップに失敗しました:', response.data);
        alert('サインアップに失敗しました: ' + response.data.error);
      }
    } catch (error: any) {
      console.error('エラーが発生しました:', error);
      if (error.response && error.response.data) {
        alert('エラーが発生しました: ' + error.response.data.error);
      } else {
        alert('エラーが発生しました');
      }
    }
  };

  return (
    <div className="min-h-screen bg-custom-green flex items-center justify-center p-4">
      <div className="bg-custom-cream rounded-lg shadow-lg overflow-hidden w-full max-w-md">
        <div className="bg-custom-cream p-6 pb-0">
          <div className="flex items-center mb-6">
            <ArrowLeft
              className="w-6 h-6 text-gray-600 cursor-pointer"
              onClick={() => router.back()}
            />
            <h2 className="text-gray-800 text-center text-2xl font-bold flex-1 mr-8">Sign Up</h2>
          </div>
        </div>
        <div className="bg-content-green custom-container p-6 pt-0">
          <form onSubmit={handleSignUp} className="space-y-4 flex flex-col items-center mt-4">
            <div>
              <label htmlFor="name" className="mt-4 block text-sm font-medium text-white">氏名</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 p-2 block w-72 h-8 text-gray-800 rounded-md shadow-sm bg-custom-cream"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white">ログインID</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 p-2 block w-72 h-8 text-gray-800 rounded-md shadow-sm bg-custom-cream"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white">パスワード</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 p-2 block w-72 h-8 text-gray-800 rounded-md shadow-sm bg-custom-cream"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white">パスワード (確認用)</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 p-2 block w-72 h-8 text-gray-800 rounded-md shadow-sm bg-custom-cream"
                required
              />
            </div>
            <button
              type="submit"
              className="w-72 bg-gray-800 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
