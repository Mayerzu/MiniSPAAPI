import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../repositories/firebase/config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../repositories/firebase/config';
import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const [user, loading, error] = useAuthState(auth);
  const [profile, setProfile] = useState({ displayName: '', photoURL: '', theme: 'light', layout: 'full' });
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setProfile({
            displayName: data.displayName || '',
            photoURL: data.photoURL || '',
            theme: data.theme || 'light',
            layout: data.layout || 'full'
          });
          document.documentElement.classList.toggle('dark', data.theme === 'dark');
          console.log("Perfil cargado:", data);
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      }
    };
    load();
  }, [user]);

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const save = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), profile);
      document.documentElement.classList.toggle('dark', profile.theme === 'dark');
      console.log("Perfil actualizado:", profile);
      alert('Perfil actualizado');
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      alert('Error al guardar perfil: ' + error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      console.log("Sesión cerrada");
      navigate('/login', { replace: true });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert('Error al cerrar sesión: ' + error.message);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-600 dark:text-gray-300">Cargando...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error.message}</p>;
  if (!user) return null;

  return (
    <section className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Mi Perfil</h2>
      
      {profile.photoURL && (
        <div className="mb-4">
          <img src={profile.photoURL} alt="Foto de perfil" className="w-32 h-32 rounded-full mx-auto object-cover" onError={(e) => (e.target.src = '')} />
        </div>
      )}
      
      <label className="block mb-2 text-gray-700 dark:text-gray-300">Nombre</label>
      <input
        className="w-full border rounded px-3 py-2 mb-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
        value={profile.displayName}
        onChange={(e) => handleChange('displayName', e.target.value)}
      />

      <label className="block mb-2 text-gray-700 dark:text-gray-300">Foto (URL)</label>
      <input
        className="w-full border rounded px-3 py-2 mb-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
        value={profile.photoURL}
        onChange={(e) => handleChange('photoURL', e.target.value)}
      />

      <label className="block mb-2 text-gray-700 dark:text-gray-300">Tema</label>
      <button
        className="w-full px-4 py-2 mb-3 bg-indigo-600 dark:bg-indigo-400 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-500"
        onClick={() => handleChange('theme', profile.theme === 'dark' ? 'light' : 'dark')}
      >
        Cambiar a {profile.theme === 'dark' ? 'Light' : 'Dark'}
      </button>

      <label className="block mb-2 text-gray-700 dark:text-gray-300">Layout</label>
      <select
        className="w-full border rounded px-3 py-2 mb-3 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white"
        value={profile.layout}
        onChange={(e) => handleChange('layout', e.target.value)}
      >
        <option value="full">Completo</option>
        <option value="compact">Compacto</option>
      </select>

      <button
        className="w-full px-4 py-2 bg-indigo-600 dark:bg-indigo-400 text-white rounded hover:bg-indigo-700 dark:hover:bg-indigo-500"
        onClick={save}
      >
        Guardar Cambios
      </button>

      <button
        className="w-full mt-4 px-4 py-2 bg-red-600 dark:bg-red-400 text-white rounded hover:bg-red-700 dark:hover:bg-red-500"
        onClick={logout}
      >
        Cerrar Sesión
      </button>
    </section>
  );
}