import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Alert,
  Snackbar,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { wishlistService, cartService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5036";
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150x200?text=No+Image';
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${backendUrl}/${cleanUrl}`;
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await wishlistService.getWishlist();
      setWishlistItems(response || []);
    } catch (err) {
      console.error('Error loading wishlist:', err);
      setError('Failed to load wishlist items. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromWishlist = async (bookId) => {
    try {
      setError('');
      await wishlistService.removeFromWishlist(bookId);
      await loadWishlist();
      setMessage('Item removed from wishlist');
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist. Please try again.');
    }
  };

  const handleAddToCart = async (book) => {
    try {
      setError('');
      await cartService.addToCart(book.bookId, 1);
      await handleRemoveFromWishlist(book.bookId);
      toast.success('Added to cart successfully!');
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Typography>Loading wishlist...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Your Wishlist
      </Typography>

      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
        </Snackbar>
      )}

      {message && (
        <Snackbar open={!!message} autoHideDuration={3000} onClose={() => setMessage('')}>
          <Alert severity="success" onClose={() => setMessage('')}>
            {message}
          </Alert>
        </Snackbar>
      )}

      {wishlistItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Your wishlist is empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Browse Books
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.bookId}>
              <Card>
                <img
                  src={getImageUrl(item.bookImageUrl)}
                  alt={item.bookTitle}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover'
                  }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.bookTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {item.authorName || 'Unknown Author'}
                  </Typography>
                  <Typography variant="h6" color="primary" gutterBottom>
                    ${item.price}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => handleAddToCart(item)}
                    >
                      Add to Cart
                    </Button>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveFromWishlist(item.bookId)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Wishlist; 