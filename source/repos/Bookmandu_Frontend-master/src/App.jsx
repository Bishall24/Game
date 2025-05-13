import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Badge,
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import BookList from './components/books/BookList.jsx';
import Cart from './components/cart/Cart.jsx';
import Order from './components/orders/Order.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import StaffDashboard from './components/StaffDashboard.jsx';
import { authService } from './services/api';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import BookDetails from './components/books/BookDetails.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

const PrivateAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  return token && role === 'Admin' ? children : <Navigate to="/login" />;
};

const PrivateStaffRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  return token && role === 'Staff' ? children : <Navigate to="/login" />;
};

const App = () => {
  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login';
  };

  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastContainer position="top-right" autoClose={3000} />
              <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                  <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      Bookmandu
                    </Typography>
                    <Button color="inherit" component={Link} to="/">
                      Books
                    </Button>
                    <IconButton color="inherit" component={Link} to="/wishlist">
                      <Badge badgeContent={0} color="error">
                        <FavoriteIcon />
                      </Badge>
                    </IconButton>
                    <IconButton color="inherit" component={Link} to="/cart">
                      <Badge badgeContent={0} color="error">
                        <ShoppingCartIcon />
                      </Badge>
                    </IconButton>
                    {localStorage.getItem('token') ? (
                      <Button color="inherit" onClick={handleLogout}>
                        Logout
                      </Button>
                    ) : (
                      <>
                        <Button color="inherit" component={Link} to="/login">
                          Login
                        </Button>
                        <Button color="inherit" component={Link} to="/register">
                          Register
                        </Button>
                      </>
                    )}
                  </Toolbar>
                </AppBar>

                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                  <Routes>
                    <Route path="/" element={<BookList />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/books/:id" element={<BookDetails />} />
                    <Route
                      path="/cart"
                      element={
                        <PrivateRoute>
                          <Cart />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/wishlist"
                      element={
                        <PrivateRoute>
                          <Wishlist />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/order"
                      element={
                        <PrivateRoute>
                          <Order />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <PrivateAdminRoute>
                          <AdminDashboard />
                        </PrivateAdminRoute>
                      }
                    />
                    <Route
                      path="/staff"
                      element={
                        <PrivateStaffRoute>
                          <StaffDashboard />
                        </PrivateStaffRoute>
                      }
                    />
                  </Routes>
                </Container>
              </Box>
            </WishlistProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;