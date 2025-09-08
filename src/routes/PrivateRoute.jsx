import { Navigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../repositories/firebase/config';

export default function PrivateRoute({ children }) {
  const [user, loading, error] = useAuthState(auth);
  console.log("Estado de autenticación en PrivateRoute:", { user, loading, error });
  if (loading) return <p className="text-center mt-10 text-gray-600 dark:text-gray-300">Cargando...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error.message}</p>;
  return user ? children : <Navigate to="/login" replace />;
}