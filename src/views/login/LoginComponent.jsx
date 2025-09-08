import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../repositories/firebase/config';
import { updatePresence } from '../../repositories/firebase/presenceFirestore';
import { useNavigate, Link } from 'react-router-dom';

const schema = yup.object({
  email: yup.string().email("Formato válido: email@email.com").required("Email requerido"),
  password: yup.string().required("Contraseña requerida").min(8, "Mínimo 8 caracteres")
});

const LoginComponent = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });
  const navigate = useNavigate();

  const onSubmitForm = async (data) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      await updatePresence(userCredential.user.uid, true);
      console.log("Login exitoso:", data.email);
      navigate('/todolist');
    } catch (error) {
      console.error("Error en login:", error);
      alert('Error en login: ' + error.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-500">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-2xl">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Iniciar Sesión</h3>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            <input type="email" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" {...register('email')} />
            <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña:</label>
            <input type="password" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" {...register('password')} />
            <p className="text-red-500 text-xs mt-1">{errors.password?.message}</p>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Ingresar</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tienes cuenta? <Link to="/register" className="text-indigo-500 hover:text-indigo-700">Registrarse</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginComponent;