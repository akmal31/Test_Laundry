'use client';

import React, { useState } from 'react';
import { useLaundry } from '@/lib/LaundryContext';

export default function AdminDashboard() {
  const { orders, users, attendances, addOrder, getEmployeeProductivity, isSupabaseConnected } = useLaundry();
  
  const [customerName, setCustomerName] = useState('');
  const [weight, setWeight] = useState('');
  const [totalPrice, setTotalPrice] = useState('');

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !weight || !totalPrice) return;
    await addOrder(customerName, parseFloat(weight), parseFloat(totalPrice));
    setCustomerName('');
    setWeight('');
    setTotalPrice('');
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
  const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
  const employees = users.filter(u => u.role === 'EMPLOYEE');

  const getTodayDateString = () => new Date().toISOString().split('T')[0];
  const today = getTodayDateString();

  return (
    <div className="space-y-6">
      {!isSupabaseConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                Supabase belum dikonfigurasi. Aplikasi saat ini menggunakan data simulasi (mock data).
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                Silakan masukkan <code>NEXT_PUBLIC_SUPABASE_URL</code> dan <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di menu Settings (Secrets) untuk mengaktifkan database Supabase.
              </p>
            </div>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Pendapatan</h3>
          <p className="text-3xl font-bold text-green-600">Rp {totalRevenue.toLocaleString('id-ID')}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Total Order</h3>
          <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">Order Selesai</h3>
          <p className="text-3xl font-bold text-indigo-600">{completedOrders}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Input Order */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Input Order Baru</h3>
          <form onSubmit={handleAddOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nama Pelanggan</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-blue-500 focus:ring-blue-500"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Berat (Kg)</label>
                <input 
                  type="number" 
                  step="0.1"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-blue-500 focus:ring-blue-500"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Harga (Rp)</label>
                <input 
                  type="number" 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 focus:border-blue-500 focus:ring-blue-500"
                  value={totalPrice}
                  onChange={e => setTotalPrice(e.target.value)}
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            >
              Simpan Order
            </button>
          </form>
        </div>

        {/* Employee Status & Productivity */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Status & Produktivitas Karyawan</h3>
          <div className="space-y-4">
            {employees.map(emp => {
              const att = attendances.find(a => a.userId === emp.id && a.date === today);
              const isClockedIn = att && att.clockIn && !att.clockOut;
              const prod = getEmployeeProductivity(emp.id);

              return (
                <div key={emp.id} className="border p-4 rounded-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {emp.name}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${isClockedIn ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {isClockedIn ? 'Sedang Bekerja' : 'Offline'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Waktu Masuk: {att?.clockIn ? new Date(att.clockIn).toLocaleTimeString() : '-'}
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-gray-700">Tugas Selesai: {prod.total}</div>
                    <div className="text-gray-500 text-xs">
                      C: {prod.cuci} | S: {prod.setrika} | P: {prod.packing}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Order List */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Daftar Order</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pelanggan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Berat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Belum ada order</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.weight} Kg</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {order.totalPrice.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          order.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
