import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../repositories/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../repositories/firebase/config';

export default function Navbar() {
  const [user, loading, error] = useAuthState(auth);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    console.log("Estado de autenticación en Navbar:", { user, loading, error });
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const userData = snap.data();
        setTheme(userData.theme || 'light');
        console.log("Tema cargado en Navbar:", userData.theme);
      }
    }, (error) => {
      console.error("Error al cargar tema:", error);
    });
    return () => {
      console.log("Desmontando listener de tema");
      unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  if (loading) return null;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error.message}</p>;
  if (!user) return null;

  return (
    <nav className="w-full border-b bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
        <NavLink to="/todolist" className="font-bold text-xl text-gray-800 dark:text-white">MiniSPA</NavLink>
        <div className="flex items-center gap-4">
          <NavLink
            to="/todolist"
            className={({ isActive }) => `text-gray-800 dark:text-white hover:underline ${isActive ? 'underline' : ''}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `text-gray-800 dark:text-white hover:underline ${isActive ? 'underline' : ''}`}
          >
            Perfil
          </NavLink>
        </div>
      </div>
    </nav>
  );
}