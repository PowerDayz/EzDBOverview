import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import Auth from './components/Login';
import reportWebVitals from './reportWebVitals';

function Root() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loggedInUser, setLoggedInUser] = useState<{ username: string, rank: string } | null>(null);
  const [darkMode, setDarkMode] = useState(true);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  return (
    <React.StrictMode>
      { 
        isAuthenticated ? 
        <App loggedInUser={loggedInUser} setLoggedInUser={setLoggedInUser} darkMode={darkMode} setDarkMode={setDarkMode} />
        : 
        <Auth onLoginSuccess={handleLoginSuccess} setLoggedInUser={setLoggedInUser} darkMode={darkMode} /> 
      }
    </React.StrictMode>
  );  
}

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<Root />);

reportWebVitals();
