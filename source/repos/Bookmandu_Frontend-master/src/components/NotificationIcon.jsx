import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../context/NotificationContext';
import { Dropdown } from 'react-bootstrap';

const NotificationIcon = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    // Add any additional navigation logic here
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dropdown align="end" onToggle={(isOpen) => setShowDropdown(isOpen)}>
      <Dropdown.Toggle as="div" className="btn btn-outline-light position-relative">
        <FaBell />
        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadCount}
          </span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{ width: '300px', maxHeight: '400px', overflowY: 'auto' }}>
        <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
          <h6 className="mb-0">Notifications</h6>
          {unreadCount > 0 && (
            <button
              className="btn btn-link btn-sm text-decoration-none p-0"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-3 text-muted">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <Dropdown.Item
              key={notification.id}
              className={`py-2 ${!notification.isRead ? 'bg-light' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-start">
                  <span className="fw-bold">{notification.title || 'Notification'}</span>
                  <small className="text-muted">{formatDate(notification.createdAt)}</small>
                </div>
                <p className="mb-0 text-muted small">{notification.message}</p>
              </div>
            </Dropdown.Item>
          ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationIcon; 