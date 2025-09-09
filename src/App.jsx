import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './repositories/firebase/config';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/navbar/Navbar';
import TodoList from './views/todolist/TodoList';
import ProfilePage from './pages/profile/ProfilePage';
import LoginComponent from './views/login/LoginComponent';
import RegisterComponent from './views/login/RegisterComponent';
import PrivateRoute from './routes/PrivateRoute';
import { initPresence } from './repositories/firebase/presenceFirestore';

function App() {
  const [user, loading, error] = useAuthState(auth);
  const [timeoutError, setTimeoutError] = useState(null);

  useEffect(() => {
    console.log("Estado de autenticación en App:", { user, loading, error });
    const timer = setTimeout(() => {
      if (loading) {
        setTimeoutError('Tiempo de espera agotado al cargar autenticación. Revisa tu conexión o credenciales de Firebase.');
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  useEffect(() => {
    if (user) initPresence();
  }, [user]);

  if (loading) return <p className="text-center mt-10 text-gray-600 dark:text-gray-300">Cargando aplicación...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error.message}</p>;
  if (timeoutError) return <p className="text-center mt-10 text-red-500">{timeoutError}</p>;

  return (
    <Router>
      {user ? <Navbar /> : null}
      <Routes>
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/register" element={<RegisterComponent />} />
        <Route path="/todolist" element={<PrivateRoute><TodoList /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="*" element={<LoginComponent />} />
      </Routes>
    </Router>
  );
}

export default App;