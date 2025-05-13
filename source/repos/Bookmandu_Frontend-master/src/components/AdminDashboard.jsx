import React, { useEffect, useState } from 'react';
import { bookService, authorService, genreService, publisherService, userService, discountService, announcementService } from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaUserCog, FaBullhorn } from 'react-icons/fa';
import { Modal, Button, Form } from 'react-bootstrap';

const initialForm = {
  bookTitle: '',
  isbn: '',
  description: '',
  price: '',
  stockQuantity: '',
  authorId: '',
  genreId: '',
  publisherId: '',
  publishDate: new Date().toISOString().split('T')[0],
  arrivalDate: new Date().toISOString().split('T')[0],
};

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5036";
const getImageUrl = (url) => {
  if (!url) return 'https://via.placeholder.com/40x60?text=No+Image';
  if (url.startsWith('http')) return url;
  // Remove any leading slashes to prevent double slashes
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  return `${backendUrl}/${cleanUrl}`;
};

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [genres, setGenres] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [members, setMembers] = useState([]);
  const [editingBook, setEditingBook] = useState(null);
  const [editingAuthor, setEditingAuthor] = useState(null);
  const [editingGenre, setEditingGenre] = useState(null);
  const [editingPublisher, setEditingPublisher] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [newPublisher, setNewPublisher] = useState({ publisherName: '', publisherCountry: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookForm, setShowBookForm] = useState(false);
  const [showAuthorForm, setShowAuthorForm] = useState(false);
  const [showGenreForm, setShowGenreForm] = useState(false);
  const [showPublisherForm, setShowPublisherForm] = useState(false);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [staffForm, setStaffForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountForm, setDiscountForm] = useState({
    type: 'Sale',
    description: '',
    percentage: 0,
    bookId: '',
    startDate: '',
    endDate: '',
    isOnSale: false
  });
  const [discountLoading, setDiscountLoading] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'Live', // Default to Live
    startTime: '',
    endTime: ''
  });
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [booksData, authorsData, genresData, publishersData, staffData, membersData, announcementsData] = await Promise.all([
        bookService.getBooks(),
        authorService.getAll(),
        genreService.getAll(),
        publisherService.getAll(),
        userService.getStaff(),
        userService.getMembers(),
        announcementService.getAnnouncements()
      ]);
      setBooks(booksData);
      setAuthors(authorsData);
      setGenres(genresData);
      setPublishers(publishersData);
      setStaffMembers(staffData);
      setMembers(membersData);
      setAnnouncements(announcementsData);
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

  // Handle form changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle image file change
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Create or update book
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let bookId = editingBook ? editingBook.bookId : null;
      if (editingBook) {
        await bookService.updateBook(bookId, {
          ...form,
          bookId,
          publishDate: new Date(form.publishDate + 'T00:00:00Z').toISOString(),
          arrivalDate: new Date(form.arrivalDate + 'T00:00:00Z').toISOString(),
        });
        setMessage('Book updated successfully.');
      } else {
        const created = await bookService.createBook({
          ...form,
          publishDate: new Date(form.publishDate + 'T00:00:00Z').toISOString(),
          arrivalDate: new Date(form.arrivalDate + 'T00:00:00Z').toISOString(),
        });
        bookId = created.bookId;
        setMessage('Book created successfully.');
        // Upload image if selected
        if (imageFile) {
          await bookService.uploadBookImage(bookId, imageFile);
          setMessage('Book and image uploaded successfully.');
        }
      }
      setForm(initialForm);
      setEditingBook(null);
      setImageFile(null);
      setShowBookForm(false);
      fetchData();
    } catch (err) {
      setMessage('Error saving book.');
    }
  };

  // Edit book
  const handleEdit = (book) => {
    setEditingBook(book);
    setForm({
      bookTitle: book.bookTitle,
      isbn: book.isbn,
      description: book.description,
      price: book.price,
      stockQuantity: book.stockQuantity,
      authorId: book.authorId,
      genreId: book.genreId,
      publisherId: book.publisherId,
      publishDate: book.publishDate ? new Date(book.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      arrivalDate: book.arrivalDate ? new Date(book.arrivalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setImageFile(null);
    setShowBookForm(true);
  };

  // Delete book
  const handleDelete = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookService.deleteBook(bookId);
        setMessage('Book deleted successfully.');
        fetchData();
      } catch (err) {
        setMessage('Error deleting book.');
      }
    }
  };

  // Author CRUD operations
  const handleEditAuthor = (author) => {
    setEditingAuthor(author);
    setNewAuthor(author.authorName);
    setShowAuthorForm(true);
  };

  const handleDeleteAuthor = async (authorId) => {
    if (window.confirm('Are you sure you want to delete this author?')) {
      try {
        await authorService.delete(authorId);
        setMessage('Author deleted successfully.');
        fetchData();
      } catch (err) {
        setMessage('Error deleting author.');
      }
    }
  };

  const handleAuthorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAuthor) {
        await authorService.update(editingAuthor.authorId, newAuthor);
        setMessage('Author updated successfully.');
      } else {
        await authorService.create(newAuthor);
        setMessage('Author added successfully.');
      }
      setNewAuthor('');
      setEditingAuthor(null);
      setShowAuthorForm(false);
      fetchData();
    } catch (err) {
      setMessage('Error saving author.');
    }
  };

  // Genre CRUD operations
  const handleEditGenre = (genre) => {
    setEditingGenre(genre);
    setNewGenre(genre.genreName);
    setShowGenreForm(true);
  };

  const handleDeleteGenre = async (genreId) => {
    if (window.confirm('Are you sure you want to delete this genre?')) {
      try {
        await genreService.delete(genreId);
        setMessage('Genre deleted successfully.');
        fetchData();
      } catch (err) {
        setMessage('Error deleting genre.');
      }
    }
  };

  const handleGenreSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGenre) {
        await genreService.update(editingGenre.genreId, newGenre);
        setMessage('Genre updated successfully.');
      } else {
        await genreService.create(newGenre);
        setMessage('Genre added successfully.');
      }
      setNewGenre('');
      setEditingGenre(null);
      setShowGenreForm(false);
      fetchData();
    } catch (err) {
      setMessage('Error saving genre.');
    }
  };

  // Publisher CRUD operations
  const handleEditPublisher = (publisher) => {
    setEditingPublisher(publisher);
    setNewPublisher({
      publisherName: publisher.publisherName,
      publisherCountry: publisher.publisherCountry
    });
    setShowPublisherForm(true);
  };

  const handleDeletePublisher = async (publisherId) => {
    if (window.confirm('Are you sure you want to delete this publisher?')) {
      try {
        await publisherService.delete(publisherId);
        setMessage('Publisher deleted successfully.');
        fetchData();
      } catch (err) {
        setMessage('Error deleting publisher.');
      }
    }
  };

  const handlePublisherSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPublisher) {
        await publisherService.update(editingPublisher.publisherId, newPublisher);
        setMessage('Publisher updated successfully.');
      } else {
        await publisherService.create(newPublisher.publisherName, newPublisher.publisherCountry);
        setMessage('Publisher added successfully.');
      }
      setNewPublisher({ publisherName: '', publisherCountry: '' });
      setEditingPublisher(null);
      setShowPublisherForm(false);
      fetchData();
    } catch (err) {
      setMessage('Error saving publisher.');
    }
  };

  // Handle staff form changes
  const handleStaffFormChange = (e) => {
    setStaffForm({
      ...staffForm,
      [e.target.name]: e.target.value,
    });
  };

  // Register staff
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    
    if (staffForm.password !== staffForm.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    try {
      const { confirmPassword, ...registerData } = staffForm;
      await userService.registerStaff(registerData);
      setMessage('Staff member registered successfully.');
      setStaffForm({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setShowStaffForm(false);
      fetchData(); // Refresh data
    } catch (err) {
      setMessage(`Error registering staff: ${err.message}`);
    }
  };

  const handleOpenDiscountModal = (book) => {
    setDiscountForm({
      type: 'Sale',
      description: '',
      percentage: 0,
      bookId: book.bookId,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
      isOnSale: false
    });
    setShowDiscountModal(true);
  };

  const handleDiscountChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDiscountForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDiscountSubmit = async (e) => {
    e.preventDefault();
    setDiscountLoading(true);
    try {
      await discountService.addDiscount({
        ...discountForm,
        percentage: parseFloat(discountForm.percentage),
        startDate: new Date(discountForm.startDate).toISOString(),
        endDate: new Date(discountForm.endDate).toISOString()
      });
      setShowDiscountModal(false);
      setDiscountLoading(false);
      setMessage('Discount added successfully.');
      fetchData();
    } catch (err) {
      setDiscountLoading(false);
      setMessage('Error adding discount.');
    }
  };

  // Announcement CRUD operations
  const handleAnnouncementChange = (e) => {
    setAnnouncementForm({
      ...announcementForm,
      [e.target.name]: e.target.value
    });
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await announcementService.updateAnnouncement(editingAnnouncement.id, announcementForm);
      } else {
        await announcementService.createAnnouncement(announcementForm);
      }
      setAnnouncementForm({ title: '', content: '', type: 'Live', startTime: '', endTime: '' });
      setEditingAnnouncement(null);
      fetchData();
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      startTime: announcement.startTime ? new Date(announcement.startTime).toISOString().slice(0, 16) : '',
      endTime: announcement.endTime ? new Date(announcement.endTime).toISOString().slice(0, 16) : ''
    });
  };

  const handleDeleteAnnouncement = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementService.deleteAnnouncement(id);
        setMessage('Announcement deleted successfully.');
        fetchData();
      } catch (err) {
        setMessage('Error deleting announcement.');
      }
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
      <h2 className="mb-4">Admin Dashboard</h2>
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'} alert-dismissible fade show`} role="alert">
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <span>Staff Management</span>
          <button
            className="btn btn-light"
            onClick={() => setShowStaffForm(!showStaffForm)}
          >
            <FaUserCog /> {showStaffForm ? 'Cancel' : 'Add Staff'}
          </button>
        </div>
        <div className="card-body">
          {showStaffForm && (
            <form onSubmit={handleStaffSubmit} className="mb-4">
              <h4>Register New Staff Member</h4>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  value={staffForm.username}
                  onChange={handleStaffFormChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={staffForm.email}
                  onChange={handleStaffFormChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={staffForm.password}
                  onChange={handleStaffFormChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={staffForm.confirmPassword}
                  onChange={handleStaffFormChange}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">Register Staff</button>
            </form>
          )}

          <h4>Staff Members</h4>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Membership ID</th>
                  <th>Join Date</th>
                </tr>
              </thead>
              <tbody>
                {staffMembers.length > 0 ? (
                  staffMembers.map((staff) => (
                    <tr key={staff.id}>
                      <td>{staff.userName}</td>
                      <td>{staff.email}</td>
                      <td>{staff.membershipId}</td>
                      <td>{new Date(staff.joinDate).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center">No staff members found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Books Section */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Books</h3>
          <button className="btn btn-primary" onClick={() => {
            setShowBookForm(true);
            setEditingBook(null);
            setForm(initialForm);
          }}>
            <FaPlus className="me-2" />
            Add Book
          </button>
        </div>
        <div className="card-body">
          {showBookForm && (
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="row g-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    name="bookTitle"
                    value={form.bookTitle}
                    onChange={handleChange}
                    placeholder="Title"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    name="isbn"
                    value={form.isbn}
                    onChange={handleChange}
                    placeholder="ISBN"
                    required
                  />
                </div>
                <div className="col-12">
                  <textarea
                    className="form-control"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Description"
                    rows="3"
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="Price"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    placeholder="Stock Quantity"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    name="authorId"
                    value={form.authorId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Author</option>
                    {authors.map(a => (
                      <option key={a.authorId} value={a.authorId}>{a.authorName}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    name="genreId"
                    value={form.genreId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Genre</option>
                    {genres.map(g => (
                      <option key={g.genreId} value={g.genreId}>{g.genreName}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4">
                  <select
                    className="form-select"
                    name="publisherId"
                    value={form.publisherId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Publisher</option>
                    {publishers.map(p => (
                      <option key={p.publisherId} value={p.publisherId}>{p.publisherName}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Publish Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="publishDate"
                    value={form.publishDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Arrival Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="arrivalDate"
                    value={form.arrivalDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary me-2">
                    {editingBook ? 'Update' : 'Add'} Book
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowBookForm(false);
                      setEditingBook(null);
                      setForm(initialForm);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.bookId}>
                    <td>
                      <img 
                        src={getImageUrl(book.bookImageUrl)} 
                        alt={book.bookTitle}
                        style={{ width: '50px', height: '75px', objectFit: 'cover' }}
                        className="img-thumbnail"
                      />
                    </td>
                    <td>{book.bookTitle}</td>
                    <td>{book.authorName || 'Unknown Author'}</td>
                    <td>${book.price}</td>
                    <td>{book.stockQuantity}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEdit(book)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(book.bookId)}
                      >
                        <FaTrash />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success me-2"
                        onClick={() => handleOpenDiscountModal(book)}
                      >
                        Add Discount
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Authors Section */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Authors</h3>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowAuthorForm(true);
              setEditingAuthor(null);
              setNewAuthor('');
            }}
          >
            <FaPlus className="me-2" />
            Add Author
          </button>
        </div>
        <div className="card-body">
          {showAuthorForm && (
            <form onSubmit={handleAuthorSubmit} className="mb-4">
              <div className="row g-3">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="Author Name"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <button type="submit" className="btn btn-primary me-2">
                    {editingAuthor ? 'Update' : 'Add'} Author
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowAuthorForm(false);
                      setEditingAuthor(null);
                      setNewAuthor('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {authors.map(author => (
                  <tr key={author.authorId}>
                    <td>{author.authorName}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditAuthor(author)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteAuthor(author.authorId)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Genres Section */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Genres</h3>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowGenreForm(true);
              setEditingGenre(null);
              setNewGenre('');
            }}
          >
            <FaPlus className="me-2" />
            Add Genre
          </button>
        </div>
        <div className="card-body">
          {showGenreForm && (
            <form onSubmit={handleGenreSubmit} className="mb-4">
              <div className="row g-3">
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="Genre Name"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <button type="submit" className="btn btn-primary me-2">
                    {editingGenre ? 'Update' : 'Add'} Genre
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowGenreForm(false);
                      setEditingGenre(null);
                      setNewGenre('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {genres.map(genre => (
                  <tr key={genre.genreId}>
                    <td>{genre.genreName}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditGenre(genre)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteGenre(genre.genreId)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Publishers Section */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Publishers</h3>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setShowPublisherForm(true);
              setEditingPublisher(null);
              setNewPublisher({ publisherName: '', publisherCountry: '' });
            }}
          >
            <FaPlus className="me-2" />
            Add Publisher
          </button>
        </div>
        <div className="card-body">
          {showPublisherForm && (
            <form onSubmit={handlePublisherSubmit} className="mb-4">
              <div className="row g-3">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    value={newPublisher.publisherName}
                    onChange={(e) => setNewPublisher({ ...newPublisher, publisherName: e.target.value })}
                    placeholder="Publisher Name"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    value={newPublisher.publisherCountry}
                    onChange={(e) => setNewPublisher({ ...newPublisher, publisherCountry: e.target.value })}
                    placeholder="Country"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <button type="submit" className="btn btn-primary me-2">
                    {editingPublisher ? 'Update' : 'Add'} Publisher
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowPublisherForm(false);
                      setEditingPublisher(null);
                      setNewPublisher({ publisherName: '', publisherCountry: '' });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Country</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {publishers.map(publisher => (
                  <tr key={publisher.publisherId}>
                    <td>{publisher.publisherName}</td>
                    <td>{publisher.publisherCountry}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => handleEditPublisher(publisher)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeletePublisher(publisher.publisherId)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <span>Announcements</span>
          <button
            className="btn btn-light"
            onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
          >
            <FaBullhorn /> {showAnnouncementForm ? 'Cancel' : 'Add Announcement'}
          </button>
        </div>
        <div className="card-body">
          {showAnnouncementForm && (
            <form onSubmit={handleAnnouncementSubmit} className="mb-4">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label">Content</label>
                  <textarea
                    value={announcementForm.content}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                    className="form-control"
                    rows="3"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Type</label>
                  <select
                    value={announcementForm.type}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, type: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="Live">Live</option>
                    <option value="Timed">Timed</option>
                  </select>
                </div>
                {announcementForm.type === 'Timed' && (
                  <>
                    <div className="col-md-6">
                      <label className="form-label">Start Time</label>
                      <input
                        type="datetime-local"
                        value={announcementForm.startTime}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, startTime: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">End Time</label>
                      <input
                        type="datetime-local"
                        value={announcementForm.endTime}
                        onChange={(e) => setAnnouncementForm({ ...announcementForm, endTime: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                  </>
                )}
                <div className="col-12">
                  <div className="d-flex justify-content-end gap-2">
                    {editingAnnouncement && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAnnouncement(null);
                          setAnnouncementForm({ title: '', content: '', type: 'Live', startTime: '', endTime: '' });
                          setShowAnnouncementForm(false);
                        }}
                        className="btn btn-secondary"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      {editingAnnouncement ? 'Update' : 'Create'} Announcement
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Type</th>
                  <th>Time Details</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((announcement) => (
                  <tr key={announcement.id}>
                    <td>{announcement.title}</td>
                    <td>{announcement.content}</td>
                    <td>
                      <span className={`badge ${announcement.type === 'Live' ? 'bg-success' : 'bg-info'}`}>
                        {announcement.type}
                      </span>
                    </td>
                    <td>
                      {announcement.type === 'Timed' && (
                        <>
                          <div>Start: {new Date(announcement.startTime).toLocaleString()}</div>
                          <div>End: {new Date(announcement.endTime).toLocaleString()}</div>
                        </>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleEditAnnouncement(announcement)}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal show={showDiscountModal} onHide={() => setShowDiscountModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Discount</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleDiscountSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Discount Type</Form.Label>
              <Form.Select name="type" value={discountForm.type} onChange={handleDiscountChange} required>
                <option value="Sale">Sale</option>
                <option value="Clearance">Clearance</option>
                <option value="Seasonal">Seasonal</option>
                <option value="Promotional">Promotional</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control name="description" value={discountForm.description} onChange={handleDiscountChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Percentage (%)</Form.Label>
              <Form.Control type="number" name="percentage" value={discountForm.percentage} onChange={handleDiscountChange} min={0} max={100} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control type="date" name="startDate" value={discountForm.startDate} onChange={handleDiscountChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>End Date</Form.Label>
              <Form.Control type="date" name="endDate" value={discountForm.endDate} onChange={handleDiscountChange} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check type="checkbox" name="isOnSale" checked={discountForm.isOnSale} onChange={handleDiscountChange} label="On Sale" />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDiscountModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={discountLoading}>
              {discountLoading ? 'Adding...' : 'Add Discount'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard; 