import React, { createContext, useContext, useState } from 'react';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);

  const addToWishlist = (book) => {
    setWishlistItems(prevItems => {
      if (!prevItems.find(item => item.bookId === book.bookId)) {
        return [...prevItems, book];
      }
      return prevItems;
    });
  };

  const removeFromWishlist = (bookId) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.bookId !== bookId));
  };

  const clearWishlist = () => {
    setWishlistItems([]);
  };

  const isInWishlist = (bookId) => {
    return wishlistItems.some(item => item.bookId === bookId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}; 