import React, { useState, useEffect } from 'react';
import { getOrders, createOrder, updateOrder, deleteOrder, getCustomers, getProducts } from '../api';
import './Entity.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    status: 'pending',
    items: [{ productId: '', quantity: 1, price: '' }]
  });

  useEffect(() => {
    loadOrders();
    loadCustomers();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await getCustomers();
      setCustomers(response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        customerId: parseInt(formData.customerId),
        status: formData.status,
        items: formData.items.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          price: item.price ? parseFloat(item.price) : undefined
        }))
      };
      if (editingOrder) {
        await updateOrder(editingOrder.id, data);
      } else {
        await createOrder(data);
      }
      setShowForm(false);
      setEditingOrder(null);
      setFormData({ customerId: '', status: 'pending', items: [{ productId: '', quantity: 1, price: '' }] });
      loadOrders();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      customerId: order.customerId.toString(),
      status: order.status,
      items: order.items.map(item => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        price: item.price.toString()
      }))
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(id);
        loadOrders();
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingOrder(null);
    setFormData({ customerId: '', status: 'pending', items: [{ productId: '', quantity: 1, price: '' }] });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, price: '' }]
    });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  return (
    <div className="entity-container">
      <div className="entity-header">
        <h2>Orders</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Order
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content form-content-large">
            <h3>{editingOrder ? 'Edit Order' : 'Add Order'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer *</label>
                <select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Items *</label>
                {formData.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                      required
                    >
                      <option value="">Select product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} (${product.price.toFixed(2)})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price (optional)"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                    />
                    {formData.items.length > 1 && (
                      <button type="button" className="btn-delete" onClick={() => removeItem(index)}>
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-secondary" onClick={addItem}>
                  + Add Item
                </button>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingOrder ? 'Update' : 'Create'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Total</th>
              <th>Items</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.customer?.name || 'N/A'}</td>
                <td>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td>${order.total.toFixed(2)}</td>
                <td>{order.items?.length || 0}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(order)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(order.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Orders;

