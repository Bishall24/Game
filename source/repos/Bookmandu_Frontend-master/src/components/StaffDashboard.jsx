import React, { useEffect, useState } from 'react';
import { bookService, orderService } from '../services/api';
import { FaCheck, FaEye } from 'react-icons/fa';

const StaffDashboard = () => {
  const [books, setBooks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [processForm, setProcessForm] = useState({
    membershipId: '',
    claimCode: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [booksData, ordersData] = await Promise.all([
        bookService.getBooks(),
        orderService.getAllOrders()
      ]);
      setBooks(booksData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessOrder = async (e) => {
    e.preventDefault();
    try {
      if (!selectedOrder) return;

      const processData = {
        orderId: selectedOrder.orderId,
        membershipId: processForm.membershipId,
        claimCode: processForm.claimCode
      };

      await orderService.processOrder(processData);
      setMessage('Order processed successfully.');
      setSelectedOrder(null);
      setProcessForm({ membershipId: '', claimCode: '' });
      fetchData(); // Refresh orders
    } catch (err) {
      setMessage(`Error processing order: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        <h4 className="alert-heading">Error!</h4>
        <p>{error}</p>
        <hr />
        <p className="mb-0">Please check your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h2 className="mb-4">Staff Dashboard</h2>
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`} role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {/* Books Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="mb-0">Available Books</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Price</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.bookId}>
                    <td>
                      <img 
                        src={book.bookImageUrl || 'https://via.placeholder.com/40x60?text=No+Image'} 
                        alt={book.bookTitle}
                        style={{ width: '50px', height: '75px', objectFit: 'cover' }}
                        className="img-thumbnail"
                      />
                    </td>
                    <td>{book.bookTitle}</td>
                    <td>{book.authorName || 'Unknown Author'}</td>
                    <td>${book.price}</td>
                    <td>{book.stockQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="mb-0">Pending Orders</h3>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Total Price</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(order => order.status === 'Pending').map(order => (
                  <tr key={order.orderId}>
                    <td>{order.orderId}</td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>${order.totalPrice}</td>
                    <td>{order.status}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <FaEye /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Processing Modal */}
      {selectedOrder && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block', zIndex: 1051 }} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content" style={{ zIndex: 1052 }}>
                <div className="modal-header">
                  <h5 className="modal-title">Process Order</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
                </div>
                <div className="modal-body">
                  <h6>Order Details</h6>
                  <p>Order ID: {selectedOrder.orderId}</p>
                  <p>Total Price: ${selectedOrder.totalPrice}</p>
                  <p>Items:</p>
                  <ul>
                    {selectedOrder.items.map(item => (
                      <li key={item.bookId}>
                        {item.bookTitle} x {item.quantity} - ${item.price * item.quantity}
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={handleProcessOrder}>
                    <div className="mb-3">
                      <label htmlFor="membershipId" className="form-label">Membership ID</label>
                      <input
                        type="text"
                        className="form-control"
                        id="membershipId"
                        value={processForm.membershipId}
                        onChange={(e) => setProcessForm({ ...processForm, membershipId: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="claimCode" className="form-label">Claim Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="claimCode"
                        value={processForm.claimCode}
                        onChange={(e) => setProcessForm({ ...processForm, claimCode: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary">
                      <FaCheck className="me-2" />
                      Process Order
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StaffDashboard; 