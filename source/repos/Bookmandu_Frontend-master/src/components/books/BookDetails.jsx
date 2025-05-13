import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookService, wishlistService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { FaShoppingCart, FaHeart, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5036';
  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/200x300?text=No+Image';
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    return `${backendUrl}/${cleanUrl}`;
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await bookService.getBookById(id);
        setBook(response);
      } catch (err) {
        setError('Failed to fetch book details');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

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

  if (!book) {
    return (
      <div className="alert alert-warning m-4" role="alert">
        Book not found
      </div>
    );
  }

  return (
    <div className="container py-4 fade-in">
      <button
        className="btn btn-outline-primary mb-4"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft className="me-2" />
        Back to Books
      </button>

      <div className="book-details">
        <div className="row">
          <div className="col-md-4">
            <img
              src={getImageUrl(book.bookImageUrl)}
              className="img-fluid rounded shadow"
              alt={book.bookTitle}
            />
          </div>
          <div className="col-md-8">
            <h1 className="mb-3">{book.bookTitle}</h1>
            <div className="mb-4">
              <h5 className="text-muted">By {book.authorName || 'Unknown Author'}</h5>
              <div className="rating mb-3">
                {'★'.repeat(Math.floor(book.rating || 0))}
                {'☆'.repeat(5 - Math.floor(book.rating || 0))}
                <span className="ms-2 text-muted">({book.rating || 0} rating)</span>
              </div>
              <div className="price-tag d-inline-block mb-3">
                ${book.price}
              </div>
            </div>

            <div className="mb-4">
              <h5>Description</h5>
              <p className="text-muted">{book.description || 'No description available.'}</p>
            </div>

            <div className="mb-4">
              <h5>Details</h5>
              <ul className="list-unstyled">
                <li><strong>ISBN:</strong> {book.isbn || 'N/A'}</li>
                <li><strong>Publisher:</strong> {book.publisherName || 'N/A'}</li>
                <li><strong>Publication Date:</strong> {book.publishDate && book.publishDate !== '0001-01-01T00:00:00' ? new Date(book.publishDate).toLocaleDateString() : 'N/A'}</li>
                <li><strong>Language:</strong> {book.language || 'N/A'}</li>
              </ul>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => addToCart(book)}
              >
                <FaShoppingCart className="me-2" />
                Add to Cart
              </button>
              <button
                className="btn btn-outline-danger"
                onClick={() => handleAddToWishlist(book)}
              >
                <FaHeart className="me-2" />
                Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;