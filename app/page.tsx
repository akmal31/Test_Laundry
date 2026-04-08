'use client';

import { useLaundry } from '@/lib/LaundryContext';
import Navbar from '@/components/Navbar';
import AdminDashboard from '@/components/AdminDashboard';
import EmployeeDashboard from '@/components/EmployeeDashboard';

export default function Home() {
  const { currentUser } = useLaundry();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {currentUser?.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : currentUser?.role === 'EMPLOYEE' ? (
          <EmployeeDashboard />
        ) : (
          <div className="text-center mt-20">Please select a user to login.</div>
        )}
      </main>
    </div>
  );
}
