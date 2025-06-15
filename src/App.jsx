import React, { useState } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return isAuthenticated ? (
    <Dashboard />
  ) : (
    <Login onSuccess={() => setIsAuthenticated(true)} />
  );
}

export default App;
