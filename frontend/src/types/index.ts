export interface Material {
  id: number;
  name: string;
  code: string;
  rate: number;
  unit: string;
  calculationType: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  gstNumber: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id?: number;
  materialId: number;
  materialName: string;
  rate: number;
  unit: string;
  width?: number;
  length?: number;
  quantity?: number;
  calculatedArea?: number;
  lineTotal: number;
  specifications?: string;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  customer: Customer;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
  customerNotes: string;
  internalNotes: string;
  paymentTerms: string;
  items: InvoiceItem[];
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  notes: string;
  createdAt: string;
}

export interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  description: string;
  createdAt: string;
}

export interface BusinessSettings {
  id: number;
  businessName: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  gstNumber: string;
  invoicePrefix: string;
  defaultTaxRate: number;
  invoiceFooter: string;
  bankDetails: string;
  upiDetails: string;
}

export interface DashboardData {
  totalSales: number;
  totalPaid: number;
  totalPending: number;
  totalExpenses: number;
  totalInvoices: number;
  currentMonthSales: number;
  monthlySales: { month: string; year: number; sales: number }[];
  expensesByCategory: { category: string; amount: number }[];
}

export interface LoginResponse {
  token: string;
  name: string;
  email: string;
}

export interface FollowUp {
  id: number;
  customer: Customer;
  title: string;
  followUpDate: string;
  note?: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | string;
  createdAt?: string;
}

export type CalendarEventType = "invoice_due" | "payment_received" | "follow_up" | "expense_due";

export interface CalendarEventItem {
  id: string;
  type: CalendarEventType;
  title: string;
  date: string; // YYYY-MM-DD
  amount?: number;
  status?: string;
  entityId?: number;
  customerName?: string;
  category?: string;
  description?: string;
  raw?: any;
}
