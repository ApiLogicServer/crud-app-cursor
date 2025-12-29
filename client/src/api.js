import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

// Customer API
export const getCustomers = () => axios.get(`${API_URL}/customers`);
export const getCustomer = (id) => axios.get(`${API_URL}/customers/${id}`);
export const createCustomer = (data) => axios.post(`${API_URL}/customers`, data);
export const updateCustomer = (id, data) => axios.put(`${API_URL}/customers/${id}`, data);
export const deleteCustomer = (id) => axios.delete(`${API_URL}/customers/${id}`);

// Product API
export const getProducts = () => axios.get(`${API_URL}/products`);
export const getProduct = (id) => axios.get(`${API_URL}/products/${id}`);
export const createProduct = (data) => axios.post(`${API_URL}/products`, data);
export const updateProduct = (id, data) => axios.put(`${API_URL}/products/${id}`, data);
export const deleteProduct = (id) => axios.delete(`${API_URL}/products/${id}`);

// Order API
export const getOrders = () => axios.get(`${API_URL}/orders`);
export const getOrder = (id) => axios.get(`${API_URL}/orders/${id}`);
export const createOrder = (data) => axios.post(`${API_URL}/orders`, data);
export const updateOrder = (id, data) => axios.put(`${API_URL}/orders/${id}`, data);
export const deleteOrder = (id) => axios.delete(`${API_URL}/orders/${id}`);

// Item API
export const getItems = () => axios.get(`${API_URL}/items`);
export const getItem = (id) => axios.get(`${API_URL}/items/${id}`);
export const createItem = (data) => axios.post(`${API_URL}/items`, data);
export const updateItem = (id, data) => axios.put(`${API_URL}/items/${id}`, data);
export const deleteItem = (id) => axios.delete(`${API_URL}/items/${id}`);

