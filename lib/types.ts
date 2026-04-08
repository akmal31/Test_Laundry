export type Role = 'ADMIN' | 'EMPLOYEE' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  role: Role;
  email?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  clockIn: string | null; // ISO string
  clockOut: string | null; // ISO string
}

export type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELIVERED';

export interface Order {
  id: string;
  customerName: string;
  status: OrderStatus;
  totalPrice: number;
  weight: number; // in kg
  createdAt: string;
}

export type TaskStep = 'CUCI' | 'SETRIKA' | 'PACKING';
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface OrderTask {
  id: string;
  orderId: string;
  stepName: TaskStep;
  employeeId: string | null;
  status: TaskStatus;
  startedAt: string | null;
  completedAt: string | null;
}
