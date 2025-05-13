import React, { useState, useEffect } from 'react';
import { Badge, IconButton, Menu, MenuItem, Typography, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user?.id) {
            console.log('Fetching notifications for user:', user.id);
            fetchNotifications();
        }
    }, [user?.id]);

    const fetchNotifications = async () => {
        try {
            const response = await notificationService.getNotifications(user.id);
            console.log('Fetched notifications:', response);
            setNotifications(response);
            setUnreadCount(response.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(notifications.map(n =>
                n.notificationId === notificationId ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    if (!user || user.role !== 'Member') {
        return null;
    }

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        maxHeight: 300,
                        width: 360,
                    },
                }}
            >
                {notifications.length === 0 ? (
                    <MenuItem>
                        <Typography>No notifications</Typography>
                    </MenuItem>
                ) : (
                    notifications.map((notification) => (
                        <MenuItem
                            key={notification.notificationId}
                            onClick={() => handleMarkAsRead(notification.notificationId)}
                            sx={{
                                backgroundColor: notification.isRead ? 'inherit' : 'action.hover',
                                whiteSpace: 'normal',
                                display: 'block',
                            }}
                        >
                            <Box>
                                <Typography variant="body2">{notification.message}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </MenuItem>
                    ))
                )}
            </Menu>
        </>
    );
};

export default NotificationBell; 