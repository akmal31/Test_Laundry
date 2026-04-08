'use client';

import { useLaundry } from '@/lib/LaundryContext';

export default function Navbar() {
  const { currentUser, setCurrentUser, users } = useLaundry();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">LaundrySys</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Login as:</span>
          <select 
            className="bg-blue-700 text-white border border-blue-500 rounded px-2 py-1 outline-none"
            value={currentUser?.id || ''}
            onChange={(e) => {
              const user = users.find(u => u.id === e.target.value);
              setCurrentUser(user || null);
            }}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
