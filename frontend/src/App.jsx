import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Books } from './pages/Books';
import { BookDetail } from './pages/BookDetail';
import { Sessions } from './pages/Sessions';
import { Goals } from './pages/Goals';
import { Analytics } from './pages/Analytics';

export const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="books" element={<Books />} />
            <Route path="books/:id" element={<BookDetail />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="goals" element={<Goals />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;

