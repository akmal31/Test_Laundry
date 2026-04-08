'use client';

import React from 'react';
import { useLaundry } from '@/lib/LaundryContext';

export default function EmployeeDashboard() {
  const { 
    currentUser, 
    orders, 
    orderTasks, 
    clockIn, 
    clockOut, 
    isEmployeeClockedIn,
    claimTask,
    completeTask,
    getEmployeeProductivity
  } = useLaundry();

  if (!currentUser) return null;

  const clockedIn = isEmployeeClockedIn(currentUser.id);
  const prod = getEmployeeProductivity(currentUser.id);

  // Get tasks that are either pending or in progress by this employee
  const availableTasks = orderTasks.filter(t => t.status === 'PENDING');
  const myTasks = orderTasks.filter(t => t.employeeId === currentUser.id && t.status === 'IN_PROGRESS');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-lg shadow border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Halo, {currentUser.name}</h2>
          <p className="text-gray-500">Dashboard Karyawan</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right mr-4">
            <div className="text-sm text-gray-500">Tugas Selesai Hari Ini</div>
            <div className="font-bold text-xl text-blue-600">{prod.total}</div>
          </div>
          {clockedIn ? (
            <button 
              onClick={() => clockOut(currentUser.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md font-medium transition shadow-sm"
            >
              Clock Out
            </button>
          ) : (
            <button 
              onClick={() => clockIn(currentUser.id)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition shadow-sm"
            >
              Clock In
            </button>
          )}
        </div>
      </div>

      {!clockedIn && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Anda belum melakukan Clock In. Silakan Clock In terlebih dahulu untuk dapat mengambil tugas.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Current Tasks */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Tugas Saya Saat Ini</h3>
          <div className="space-y-4">
            {myTasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada tugas yang sedang dikerjakan.</p>
            ) : (
              myTasks.map(task => {
                const order = orders.find(o => o.id === task.orderId);
                return (
                  <div key={task.id} className="border border-blue-200 bg-blue-50 p-4 rounded-md flex justify-between items-center">
                    <div>
                      <div className="font-bold text-blue-800">{task.stepName}</div>
                      <div className="text-sm text-gray-600">Order: {order?.customerName} ({order?.weight} Kg)</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Mulai: {task.startedAt ? new Date(task.startedAt).toLocaleTimeString() : ''}
                      </div>
                    </div>
                    <button 
                      onClick={() => completeTask(task.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition"
                    >
                      Selesaikan
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Available Tasks */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">Tugas Tersedia</h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {availableTasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Tidak ada tugas yang tersedia saat ini.</p>
            ) : (
              // Group available tasks by Order to make it readable
              orders.filter(o => o.status !== 'COMPLETED').map(order => {
                const orderTasksForThis = availableTasks.filter(t => t.orderId === order.id);
                if (orderTasksForThis.length === 0) return null;

                // Determine which step is currently actionable
                // Cuci -> Setrika -> Packing
                const allTasksForOrder = orderTasks.filter(t => t.orderId === order.id);
                const cuciTask = allTasksForOrder.find(t => t.stepName === 'CUCI');
                const setrikaTask = allTasksForOrder.find(t => t.stepName === 'SETRIKA');
                
                return (
                  <div key={order.id} className="border p-4 rounded-md">
                    <div className="font-medium mb-2">{order.customerName} - {order.weight} Kg</div>
                    <div className="flex flex-wrap gap-2">
                      {orderTasksForThis.map(task => {
                        // Logic to disable steps if previous step isn't done
                        let disabled = false;
                        let reason = '';
                        if (task.stepName === 'SETRIKA' && cuciTask?.status !== 'COMPLETED') {
                          disabled = true;
                          reason = '(Tunggu Cuci)';
                        }
                        if (task.stepName === 'PACKING' && setrikaTask?.status !== 'COMPLETED') {
                          disabled = true;
                          reason = '(Tunggu Setrika)';
                        }

                        return (
                          <button
                            key={task.id}
                            onClick={() => claimTask(task.id, currentUser.id)}
                            disabled={disabled || !clockedIn}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                              disabled || !clockedIn 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600'
                            }`}
                          >
                            Ambil {task.stepName} {reason}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
