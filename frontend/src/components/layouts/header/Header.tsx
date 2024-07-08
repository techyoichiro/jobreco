import React from 'react';
import Image from 'next/image';

const Header: React.FC = () => {
  return (
    <header className="bg-brown p-4">
      <div className="container flex items-center">
        <div className="mr-4">
          <Image src="/logo.png" alt="我家" width={100} height={100} />
        </div>
        <div className="text-2xl font-semibold text-white">勤怠管理</div>
      </div>
    </header>
  );
};

export default Header;