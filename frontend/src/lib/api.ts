import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Handle errors (removed 401 redirect)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

// Materials
export const materialsApi = {
  getAll: () => api.get("/materials"),
  getActive: () => api.get("/materials/active"),
  getById: (id: number) => api.get(`/materials/${id}`),
  create: (data: Record<string, unknown>) => api.post("/materials", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/materials/${id}`, data),
  delete: (id: number) => api.delete(`/materials/${id}`),
};

// Customers
export const customersApi = {
  getAll: () => api.get("/customers"),
  getById: (id: number) => api.get(`/customers/${id}`),
  create: (data: Record<string, unknown>) => api.post("/customers", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
  search: (query: string) => api.get(`/customers/search?query=${query}`),
};

// Invoices
export const invoicesApi = {
  getAll: () => api.get("/invoices"),
  getById: (id: number) => api.get(`/invoices/${id}`),
  create: (data: Record<string, unknown>) => api.post("/invoices", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/invoices/${id}`, data),
  delete: (id: number) => api.delete(`/invoices/${id}`),
  search: (query: string) => api.get(`/invoices/search?query=${query}`),
  getByCustomer: (customerId: number) => api.get(`/invoices/customer/${customerId}`),
  getByStatus: (status: string) => api.get(`/invoices/status/${status}`),
  getPdfUrl: (id: number) => `${API_BASE_URL}/invoices/${id}/pdf`,
};

// Payments
export const paymentsApi = {
  getByInvoice: (invoiceId: number) => api.get(`/invoices/${invoiceId}/payments`),
  record: (invoiceId: number, data: Record<string, unknown>) =>
    api.post(`/invoices/${invoiceId}/payments`, data),
};

// Expenses
export const expensesApi = {
  getAll: () => api.get("/expenses"),
  getById: (id: number) => api.get(`/expenses/${id}`),
  create: (data: Record<string, unknown>) => api.post("/expenses", data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
};

// Dashboard
export const dashboardApi = {
  getData: () => api.get("/dashboard"),
};

// Settings
export const settingsApi = {
  get: () => api.get("/settings"),
  update: (data: Record<string, unknown>) => api.put("/settings", data),
};
