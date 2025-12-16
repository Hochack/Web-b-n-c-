// FontEnd/src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; // ✅ Import App từ file riêng

const root = createRoot(document.getElementById('root'));
root.render(<App />);
