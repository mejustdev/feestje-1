import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthCallback from './routes/auth/callback';
import MainLayout from './layouts/MainLayout';
import { AuthContextProvider } from './lib/auth/context';

export default function App() {
  return (
    <AuthContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="auth/callback" element={<AuthCallback />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthContextProvider>
  );
}