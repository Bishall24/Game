import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  FormControlLabel,
  Switch,
} from '@mui/material';
import axios from '../utils/axios';

function BookForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bookTitle: '',
    isbn: '',
    description: '',
    language: 'English',
    format: 'Paperback',
    stockQuantity: 0,
    isAvailable: true,
    price: 0,
    publishDate: new Date().toISOString().split('T')[0],
    arrivalDate: new Date().toISOString().split('T')[0],
    onSale: false,
    salePrice: 0,
    saleStartDate: '',
    saleEndDate: '',
    published: true,
    authorId: '',
    publisherId: '',
    genreId: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authors, setAuthors] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [authorsRes, publishersRes, genresRes] = await Promise.all([
          axios.get('/api/authors'),
          axios.get('/api/publishers'),
          axios.get('/api/genres')
        ]);
        setAuthors(authorsRes.data);
        setPublishers(publishersRes.data);
        setGenres(genresRes.data);
        
        if (id) {
          await fetchBook();
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load form data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`);
      const book = response.data;
      setFormData({
        bookTitle: book.bookTitle,
        isbn: book.isbn,
        description: book.description,
        language: book.language,
        format: book.format,
        stockQuantity: book.stockQuantity,
        isAvailable: book.isAvailable,
        price: book.price,
        publishDate: new Date(book.publishDate).toISOString().split('T')[0],
        arrivalDate: new Date(book.arrivalDate).toISOString().split('T')[0],
        onSale: book.onSale,
        salePrice: book.salePrice || 0,
        saleStartDate: book.saleStartDate ? new Date(book.saleStartDate).toISOString().split('T')[0] : '',
        saleEndDate: book.saleEndDate ? new Date(book.saleEndDate).toISOString().split('T')[0] : '',
        published: book.published,
        authorId: book.authorId,
        publisherId: book.publisherId,
        genreId: book.genreId
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching book:', error);
      setError('Failed to load book details. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert dates to UTC
      const publishDate = new Date(formData.publishDate);
      const arrivalDate = new Date(formData.arrivalDate);
      const saleStartDate = formData.saleStartDate ? new Date(formData.saleStartDate) : null;
      const saleEndDate = formData.saleEndDate ? new Date(formData.saleEndDate) : null;

      const submitData = {
        bookTitle: formData.bookTitle,
        isbn: formData.isbn,
        description: formData.description,
        language: formData.language,
        format: formData.format,
        stockQuantity: parseInt(formData.stockQuantity),
        isAvailable: formData.isAvailable,
        price: parseFloat(formData.price),
        publishDate: publishDate.toISOString(),
        arrivalDate: arrivalDate.toISOString(),
        onSale: formData.onSale,
        salePrice: formData.onSale ? parseFloat(formData.salePrice) : null,
        saleStartDate: formData.onSale && saleStartDate ? saleStartDate.toISOString() : null,
        saleEndDate: formData.onSale && saleEndDate ? saleEndDate.toISOString() : null,
        published: formData.published,
        authorId: formData.authorId,
        publisherId: formData.publisherId,
        genreId: formData.genreId
      };

      if (id) {
        await axios.put(`/api/books/${id}`, { ...submitData, bookId: id });
      } else {
        await axios.post('/api/books', submitData);
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving book:', error);
      setError(error.response?.data?.message || 'Failed to save book. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Book' : 'Add New Book'}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Book Title"
                name="bookTitle"
                value={formData.bookTitle}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="ISBN"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={handleChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Language</InputLabel>
                <Select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  label="Language"
                >
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Nepali">Nepali</MenuItem>
                  <MenuItem value="Hindi">Hindi</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Format</InputLabel>
                <Select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  label="Format"
                >
                  <MenuItem value="Paperback">Paperback</MenuItem>
                  <MenuItem value="Hardcover">Hardcover</MenuItem>
                  <MenuItem value="EBook">E-Book</MenuItem>
                  <MenuItem value="Audiobook">Audiobook</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Publish Date"
                name="publishDate"
                type="date"
                value={formData.publishDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Arrival Date"
                name="arrivalDate"
                type="date"
                value={formData.arrivalDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Author</InputLabel>
                <Select
                  name="authorId"
                  value={formData.authorId}
                  onChange={handleChange}
                  label="Author"
                >
                  {authors.map((author) => (
                    <MenuItem key={author.authorId} value={author.authorId}>
                      {author.authorName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Publisher</InputLabel>
                <Select
                  name="publisherId"
                  value={formData.publisherId}
                  onChange={handleChange}
                  label="Publisher"
                >
                  {publishers.map((publisher) => (
                    <MenuItem key={publisher.publisherId} value={publisher.publisherId}>
                      {publisher.publisherName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Genre</InputLabel>
                <Select
                  name="genreId"
                  value={formData.genreId}
                  onChange={handleChange}
                  label="Genre"
                >
                  {genres.map((genre) => (
                    <MenuItem key={genre.genreId} value={genre.genreId}>
                      {genre.genreName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    name="isAvailable"
                  />
                }
                label="Available"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.published}
                    onChange={handleChange}
                    name="published"
                  />
                }
                label="Published"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.onSale}
                    onChange={handleChange}
                    name="onSale"
                  />
                }
                label="On Sale"
              />
            </Grid>
            {formData.onSale && (
              <>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Sale Price"
                    name="salePrice"
                    type="number"
                    value={formData.salePrice}
                    onChange={handleChange}
                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Sale Start Date"
                    name="saleStartDate"
                    type="date"
                    value={formData.saleStartDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    required
                    fullWidth
                    label="Sale End Date"
                    name="saleEndDate"
                    type="date"
                    value={formData.saleEndDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </>
            )}
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
              >
                {loading ? 'Saving...' : id ? 'Update Book' : 'Add Book'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}

export default BookForm; 