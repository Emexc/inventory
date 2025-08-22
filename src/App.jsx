import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/Product';

const App = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated');

  return (
    <Router>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/product" element={<ProductsPage />} />
        
      </Routes>
    </Router>
  );
}

export default App