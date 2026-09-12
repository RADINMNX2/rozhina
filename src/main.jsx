import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ProductsProvider } from './context/ProductsContext';
import { SettingsProvider } from './context/SettingsContext';
import { ContentProvider } from './context/ContentContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ProductsProvider>
      <SettingsProvider>
        <ContentProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
        </ContentProvider>
      </SettingsProvider>
    </ProductsProvider>
  </React.StrictMode>,
);