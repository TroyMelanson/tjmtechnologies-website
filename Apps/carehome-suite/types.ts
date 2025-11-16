export interface Employee {
  id: string;
  name: string;
  payRate: number; // dollars per hour
  position: string;
  hireDate: Date;
}

export interface Shift {
  id:string;
  employeeId: string;
  start: Date;
  end: Date;
}

export interface Expense {
  id: string;
  date: Date;
  category: string;
  description: string;
  amount: number;
}

export interface ExpenseForecast {
  id: string; // "YYYY-M-Category"
  year: number;
  month: number; // 1-12
  category: string;
  amount: number;
}

export interface Resident {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  roomNumber: string;
}

export interface Tenancy {
    id: string;
    roomId: string;
    residentId: string;
    startDate: Date;
    endDate: Date | null;
    monthlyRate: number;
}

export interface Allowance {
  id: string;
  residentId: string;
  date: Date;
  amount: number;
  description: string;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'Pending' | 'Approved' | 'Denied';
}

export type ViewType = 'Dashboard' | 'Scheduler' | 'Employees' | 'Capital Expenses' | 'Salary Expenses' | 'Revenue' | 'My Portal';
export type UserRole = 'Supervisor' | 'Owner' | 'Employee';
