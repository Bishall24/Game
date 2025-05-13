import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService, cartService, wishlistService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { FaShoppingCart, FaHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await bookService.getBooks();
        setBooks(response);
      } catch (err) {
        setError('Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleAddToWishlist = async (book) => {
    try {
      await wishlistService.addToWishlist(book.bookId);
      toast.success('Added to wishlist!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add to wishlist.');
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
        {error}
      </div>
    );
  }

  return (
    <div className="container py-4 fade-in">
      <div className="row">
        {books.map((book) => (
          <div className="col-md-4 mb-4" key={book.bookId}>
            <div className="card h-100">
              <img
                src={book.bookImageUrl || 'https://via.placeholder.com/200x300?text=No+Image'}
                className="card-img-top"
                alt={book.bookTitle}
              />
              <div className="card-body">
                <h5 className="card-title">{book.bookTitle}</h5>
                <p className="card-text text-muted">By {book.authorName || 'Unknown Author'}</p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="price-tag">${book.price}</span>
                  <div className="rating">
                    {'★'.repeat(Math.floor(book.rating || 0))}
                    {'☆'.repeat(5 - Math.floor(book.rating || 0))}
                  </div>
                </div>
                <div className="d-flex gap-2 mt-3">
                  <button
                    className="btn btn-primary flex-grow-1"
                    onClick={() => addToCart(book)}
                  >
                    <FaShoppingCart className="me-2" />
                    Add to Cart
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleAddToWishlist(book)}
                  >
                    <FaHeart />
                  </button>
                </div>
                <Link to={`/books/${book.bookId}`} className="btn btn-link mt-2">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookList;