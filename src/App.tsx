import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import Statistics from './components/Statistics';
import Settings from './components/Settings';
import ExpenseDetail from './components/ExpenseDetail';
import EditExpense from './components/EditExpense';
import ExpenseList from './components/ExpenseList';
import Neo4jRecurring from './components/Neo4jRecurring';

// Layout component for authenticated pages
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};

// Main App component
const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

// App content with routing
const AppContent: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/forgot-password" 
        element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" replace />} 
      />
      <Route 
        path="/reset-password/:token" 
        element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/dashboard" replace />} 
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-expense"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AddExpense />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Statistics />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ExpenseList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ExpenseDetail />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses/:id/edit"
        element={
          <ProtectedRoute>
            <AppLayout>
              <EditExpense />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/neo4j"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Neo4jRecurring />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirects */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
};

export default App;
