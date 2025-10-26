'use client';

import { ReactNode } from 'react';

interface TopbarProps {
  title: string;
  actions?: ReactNode;
}

export default function Topbar({ title, actions }: TopbarProps) {
  return (
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}