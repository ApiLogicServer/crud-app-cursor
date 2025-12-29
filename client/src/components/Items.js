import React, { useState, useEffect } from 'react';
import { getItems, createItem, updateItem, deleteItem, getOrders, getProducts } from '../api';
import './Entity.css';

function Items() {
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    orderId: '',
    productId: '',
    quantity: '',
    price: ''
  });

  useEffect(() => {
    loadItems();
    loadOrders();
    loadProducts();
  }, []);

  const loadItems = async () => {
    try {
      const response = await getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Error loading items:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
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
        orderId: parseInt(formData.orderId),
        productId: parseInt(formData.productId),
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price)
      };
      if (editingItem) {
        await updateItem(editingItem.id, data);
      } else {
        await createItem(data);
      }
      setShowForm(false);
      setEditingItem(null);
      setFormData({ orderId: '', productId: '', quantity: '', price: '' });
      loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      orderId: item.orderId.toString(),
      productId: item.productId.toString(),
      quantity: item.quantity.toString(),
      price: item.price.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        loadItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({ orderId: '', productId: '', quantity: '', price: '' });
  };

  return (
    <div className="entity-container">
      <div className="entity-header">
        <h2>Items</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Add Item
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editingItem ? 'Edit Item' : 'Add Item'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Order *</label>
                <select
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  required
                >
                  <option value="">Select an order</option>
                  {orders.map(order => (
                    <option key={order.id} value={order.id}>
                      Order #{order.id} - {order.customer?.name || 'N/A'} (${order.total.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Product *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  required
                >
                  <option value="">Select a product</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (${product.price.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  min="1"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Update' : 'Create'}
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
              <th>Order</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Subtotal</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>Order #{item.order?.id || item.orderId}</td>
                <td>{item.product?.name || 'N/A'}</td>
                <td>{item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${(item.quantity * item.price).toFixed(2)}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(item)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(item.id)}>
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

export default Items;

