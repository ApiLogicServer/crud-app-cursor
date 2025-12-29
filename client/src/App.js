import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Customers from './components/Customers';
import Products from './components/Products';
import Orders from './components/Orders';
import Items from './components/Items';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-logo">CRUD App</h1>
            <ul className="nav-menu">
              <li><Link to="/customers">Customers</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/orders">Orders</Link></li>
              <li><Link to="/items">Items</Link></li>
            </ul>
          </div>
        </nav>
        <div className="container">
          <Routes>
            <Route path="/" element={<Customers />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/items" element={<Items />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;

