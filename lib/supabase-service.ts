import { supabase } from './supabase';
import { User, Attendance, Order, OrderTask, TaskStep, TaskStatus } from './types';

// Helper to map snake_case to camelCase
const mapUser = (data: any): User => ({
  id: data.id,
  name: data.name,
  role: data.role,
  email: data.email,
});

const mapAttendance = (data: any): Attendance => ({
  id: data.id,
  userId: data.user_id,
  date: data.date,
  clockIn: data.clock_in,
  clockOut: data.clock_out,
});

const mapOrder = (data: any): Order => ({
  id: data.id,
  customerName: data.customer_name,
  status: data.status,
  totalPrice: data.total_price,
  weight: data.weight,
  createdAt: data.created_at,
});

const mapOrderTask = (data: any): OrderTask => ({
  id: data.id,
  orderId: data.order_id,
  stepName: data.step_name,
  employeeId: data.employee_id,
  status: data.status,
  startedAt: data.started_at,
  completedAt: data.completed_at,
});

export const supabaseService = {
  async getUsers(): Promise<User[]> {
    const { data } = await supabase.from('users').select('*');
    return (data || []).map(mapUser);
  },

  async getAttendances(): Promise<Attendance[]> {
    const { data } = await supabase.from('attendances').select('*');
    return (data || []).map(mapAttendance);
  },

  async getOrders(): Promise<Order[]> {
    const { data } = await supabase.from('orders').select('*');
    return (data || []).map(mapOrder);
  },

  async getOrderTasks(): Promise<OrderTask[]> {
    const { data } = await supabase.from('order_tasks').select('*');
    return (data || []).map(mapOrderTask);
  },

  async clockIn(userId: string, date: string): Promise<Attendance | null> {
    const { data, error } = await supabase.from('attendances').insert({
      user_id: userId,
      date: date,
      clock_in: new Date().toISOString()
    }).select().single();
    
    if (error) {
      console.error('Error clocking in:', error);
      return null;
    }
    return mapAttendance(data);
  },

  async clockOut(attendanceId: string): Promise<Attendance | null> {
    const { data, error } = await supabase.from('attendances').update({
      clock_out: new Date().toISOString()
    }).eq('id', attendanceId).select().single();

    if (error) {
      console.error('Error clocking out:', error);
      return null;
    }
    return mapAttendance(data);
  },

  async addOrder(customerName: string, weight: number, totalPrice: number): Promise<{ order: Order | null, tasks: OrderTask[] }> {
    // 1. Create Order
    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      customer_name: customerName,
      weight: weight,
      total_price: totalPrice,
      status: 'PENDING'
    }).select().single();

    if (orderError || !orderData) {
      console.error('Error creating order:', orderError);
      return { order: null, tasks: [] };
    }

    // 2. Create Tasks
    const tasksToInsert = [
      { order_id: orderData.id, step_name: 'CUCI', status: 'PENDING' },
      { order_id: orderData.id, step_name: 'SETRIKA', status: 'PENDING' },
      { order_id: orderData.id, step_name: 'PACKING', status: 'PENDING' }
    ];

    const { data: tasksData, error: tasksError } = await supabase.from('order_tasks').insert(tasksToInsert).select();
    
    if (tasksError) {
      console.error('Error creating tasks:', tasksError);
    }

    return { 
      order: mapOrder(orderData), 
      tasks: (tasksData || []).map(mapOrderTask) 
    };
  },

  async claimTask(taskId: string, employeeId: string): Promise<OrderTask | null> {
    const { data, error } = await supabase.from('order_tasks').update({
      employee_id: employeeId,
      status: 'IN_PROGRESS',
      started_at: new Date().toISOString()
    }).eq('id', taskId).select().single();

    if (error) {
      console.error('Error claiming task:', error);
      return null;
    }
    return mapOrderTask(data);
  },

  async completeTask(taskId: string): Promise<OrderTask | null> {
    const { data, error } = await supabase.from('order_tasks').update({
      status: 'COMPLETED',
      completed_at: new Date().toISOString()
    }).eq('id', taskId).select().single();

    if (error) {
      console.error('Error completing task:', error);
      return null;
    }
    return mapOrderTask(data);
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order | null> {
    const { data, error } = await supabase.from('orders').update({
      status: status
    }).eq('id', orderId).select().single();

    if (error) {
      console.error('Error updating order status:', error);
      return null;
    }
    return mapOrder(data);
  }
};
