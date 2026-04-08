'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Attendance, Order, OrderTask, TaskStep, TaskStatus } from '@/lib/types';
import { supabaseService } from '@/lib/supabase-service';

interface LaundryContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  attendances: Attendance[];
  orders: Order[];
  orderTasks: OrderTask[];
  
  // Actions
  clockIn: (userId: string) => Promise<void>;
  clockOut: (userId: string) => Promise<void>;
  addOrder: (customerName: string, weight: number, totalPrice: number) => Promise<void>;
  claimTask: (taskId: string, employeeId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  isEmployeeClockedIn: (userId: string) => boolean;
  getEmployeeProductivity: (userId: string) => { cuci: number; setrika: number; packing: number; total: number };
  isSupabaseConnected: boolean;
}

const mockUsers: User[] = [
  { id: 'u1', name: 'Admin Budi', role: 'ADMIN' },
  { id: 'u2', name: 'Karyawan Siti', role: 'EMPLOYEE' },
  { id: 'u3', name: 'Karyawan Joko', role: 'EMPLOYEE' },
];

const LaundryContext = createContext<LaundryContextType | undefined>(undefined);

export const LaundryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(mockUsers[0]);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderTasks, setOrderTasks] = useState<OrderTask[]>([]);

  // Check if Supabase is configured
  const hasSupabaseEnv = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConnected = hasSupabaseEnv;

  useEffect(() => {
    if (hasSupabaseEnv) {
      // Fetch initial data from Supabase
      const fetchData = async () => {
        const [dbUsers, dbAttendances, dbOrders, dbTasks] = await Promise.all([
          supabaseService.getUsers(),
          supabaseService.getAttendances(),
          supabaseService.getOrders(),
          supabaseService.getOrderTasks()
        ]);
        
        if (dbUsers.length > 0) {
          setUsers(dbUsers);
          setCurrentUser(dbUsers[0]);
        }
        setAttendances(dbAttendances);
        setOrders(dbOrders);
        setOrderTasks(dbTasks);
      };
      fetchData();
    }
  }, [hasSupabaseEnv]);

  const getTodayDateString = () => new Date().toISOString().split('T')[0];

  const clockIn = async (userId: string) => {
    const today = getTodayDateString();
    const existing = attendances.find(a => a.userId === userId && a.date === today);
    
    if (!existing) {
      if (hasSupabaseEnv) {
        const newAtt = await supabaseService.clockIn(userId, today);
        if (newAtt) setAttendances([...attendances, newAtt]);
      } else {
        setAttendances([...attendances, {
          id: `att-${Date.now()}`,
          userId,
          date: today,
          clockIn: new Date().toISOString(),
          clockOut: null
        }]);
      }
    }
  };

  const clockOut = async (userId: string) => {
    const today = getTodayDateString();
    const att = attendances.find(a => a.userId === userId && a.date === today && !a.clockOut);
    
    if (att) {
      if (hasSupabaseEnv) {
        const updatedAtt = await supabaseService.clockOut(att.id);
        if (updatedAtt) {
          setAttendances(attendances.map(a => a.id === updatedAtt.id ? updatedAtt : a));
        }
      } else {
        setAttendances(attendances.map(a => 
          a.id === att.id ? { ...a, clockOut: new Date().toISOString() } : a
        ));
      }
    }
  };

  const isEmployeeClockedIn = (userId: string) => {
    const today = getTodayDateString();
    const att = attendances.find(a => a.userId === userId && a.date === today);
    return att ? att.clockIn !== null && att.clockOut === null : false;
  };

  const addOrder = async (customerName: string, weight: number, totalPrice: number) => {
    if (hasSupabaseEnv) {
      const { order, tasks } = await supabaseService.addOrder(customerName, weight, totalPrice);
      if (order) setOrders([...orders, order]);
      if (tasks.length > 0) setOrderTasks([...orderTasks, ...tasks]);
    } else {
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        customerName,
        weight,
        totalPrice,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      const newTasks: OrderTask[] = [
        { id: `task-${Date.now()}-1`, orderId: newOrder.id, stepName: 'CUCI', employeeId: null, status: 'PENDING', startedAt: null, completedAt: null },
        { id: `task-${Date.now()}-2`, orderId: newOrder.id, stepName: 'SETRIKA', employeeId: null, status: 'PENDING', startedAt: null, completedAt: null },
        { id: `task-${Date.now()}-3`, orderId: newOrder.id, stepName: 'PACKING', employeeId: null, status: 'PENDING', startedAt: null, completedAt: null },
      ];

      setOrders([...orders, newOrder]);
      setOrderTasks([...orderTasks, ...newTasks]);
    }
  };

  const claimTask = async (taskId: string, employeeId: string) => {
    if (!isEmployeeClockedIn(employeeId)) {
      alert("Anda harus Clock-In terlebih dahulu sebelum mengambil tugas!");
      return;
    }

    const task = orderTasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if previous step is completed
    const orderTasksForThisOrder = orderTasks.filter(ot => ot.orderId === task.orderId);
    if (task.stepName === 'SETRIKA') {
      const cuciTask = orderTasksForThisOrder.find(ot => ot.stepName === 'CUCI');
      if (cuciTask?.status !== 'COMPLETED') {
        alert("Tugas CUCI belum selesai!");
        return;
      }
    }
    if (task.stepName === 'PACKING') {
      const setrikaTask = orderTasksForThisOrder.find(ot => ot.stepName === 'SETRIKA');
      if (setrikaTask?.status !== 'COMPLETED') {
        alert("Tugas SETRIKA belum selesai!");
        return;
      }
    }

    if (hasSupabaseEnv) {
      const updatedTask = await supabaseService.claimTask(taskId, employeeId);
      if (updatedTask) {
        setOrderTasks(tasks => tasks.map(t => t.id === taskId ? updatedTask : t));
      }
    } else {
      setOrderTasks(tasks => tasks.map(t => 
        t.id === taskId ? { ...t, employeeId, status: 'IN_PROGRESS', startedAt: new Date().toISOString() } : t
      ));
    }
  };

  const completeTask = async (taskId: string) => {
    const task = orderTasks.find(t => t.id === taskId);
    if (!task) return;

    if (hasSupabaseEnv) {
      const updatedTask = await supabaseService.completeTask(taskId);
      if (updatedTask) {
        let currentTasks = orderTasks.map(t => t.id === taskId ? updatedTask : t);
        setOrderTasks(currentTasks);
        
        // Update order status if needed
        const orderTasksForThisOrder = currentTasks.filter(ot => ot.orderId === task.orderId);
        const allCompleted = orderTasksForThisOrder.every(ot => ot.status === 'COMPLETED');
        
        if (allCompleted) {
          const updatedOrder = await supabaseService.updateOrderStatus(task.orderId, 'COMPLETED');
          if (updatedOrder) setOrders(ords => ords.map(o => o.id === task.orderId ? updatedOrder : o));
        } else if (task.stepName === 'CUCI') {
          const order = orders.find(o => o.id === task.orderId);
          if (order && order.status === 'PENDING') {
            const updatedOrder = await supabaseService.updateOrderStatus(task.orderId, 'IN_PROGRESS');
            if (updatedOrder) setOrders(ords => ords.map(o => o.id === task.orderId ? updatedOrder : o));
          }
        }
      }
    } else {
      setOrderTasks(tasks => {
        const updatedTasks = tasks.map(t => 
          t.id === taskId ? { ...t, status: 'COMPLETED' as TaskStatus, completedAt: new Date().toISOString() } : t
        );
        
        const orderTasksForThisOrder = updatedTasks.filter(ot => ot.orderId === task.orderId);
        const allCompleted = orderTasksForThisOrder.every(ot => ot.status === 'COMPLETED');
        
        if (allCompleted) {
          setOrders(ords => ords.map(o => o.id === task.orderId ? { ...o, status: 'COMPLETED' } : o));
        } else if (task.stepName === 'CUCI') {
           setOrders(ords => ords.map(o => o.id === task.orderId && o.status === 'PENDING' ? { ...o, status: 'IN_PROGRESS' } : o));
        }
        
        return updatedTasks;
      });
    }
  };

  const getEmployeeProductivity = (userId: string) => {
    const userTasks = orderTasks.filter(t => t.employeeId === userId && t.status === 'COMPLETED');
    const cuci = userTasks.filter(t => t.stepName === 'CUCI').length;
    const setrika = userTasks.filter(t => t.stepName === 'SETRIKA').length;
    const packing = userTasks.filter(t => t.stepName === 'PACKING').length;
    return { cuci, setrika, packing, total: cuci + setrika + packing };
  };

  return (
    <LaundryContext.Provider value={{
      currentUser, setCurrentUser, users, attendances, orders, orderTasks,
      clockIn, clockOut, addOrder, claimTask, completeTask, isEmployeeClockedIn, getEmployeeProductivity,
      isSupabaseConnected
    }}>
      {children}
    </LaundryContext.Provider>
  );
};

export const useLaundry = () => {
  const context = useContext(LaundryContext);
  if (context === undefined) {
    throw new Error('useLaundry must be used within a LaundryProvider');
  }
  return context;
};
