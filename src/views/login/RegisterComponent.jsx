import { useForm } from "react-hook-form";
import * as yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../repositories/firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const schema = yup.object({
  displayName: yup.string().required("Nombre requerido"),
  email: yup.string().email("Formato válido: email@email.com").required("Email requerido"),
  password: yup.string()
    .required("Contraseña requerida")
    .min(8, "Mínimo 8 caracteres")
    .matches(/[A-Z]/, "Al menos 1 mayúscula")
    .matches(/[a-z]/, "Al menos 1 minúscula")
    .matches(/[0-9]/, "Al menos 1 número")
    .matches(/[!@#$%&*?.,_:<>"|]/, "Al menos 1 carácter especial"),
  confirm_password: yup.string()
    .oneOf([yup.ref("password")], "Contraseñas no coinciden")
    .required("Confirma contraseña")
});

const RegisterComponent = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });
  const navigate = useNavigate();

  const onSubmitForm = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: data.displayName,
        photoURL: '',
        createdAt: serverTimestamp(),
        online: true,
        lastSeen: serverTimestamp(),
        theme: 'light',
        layout: 'full'
      });
      console.log("Registro exitoso:", data.email);
      reset();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error("Error en registro:", err);
      alert('Error en registro: ' + err.message);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-2xl">
        <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Registro</h3>
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre:</label>
            <input type="text" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" {...register('displayName')} />
            <p className="text-red-500 text-xs mt-1">{errors.displayName?.message}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email:</label>
            <input type="email" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" {...register('email')} />
            <p className="text-red-500 text-xs mt-1">{errors.email?.message}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña:</label>
            <input type="password" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" {...register('password')} />
            <p className="text-red-500 text-xs mt-1">{errors.password?.message}</p>
            <p className="text-gray-500 text-xs mt-1">Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial (!@#$%&*?.,_)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirma Contraseña:</label>
            <input type="password" className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md" {...register('confirm_password')} />
            <p className="text-red-500 text-xs mt-1">{errors.confirm_password?.message}</p>
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700">Registrar</button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tienes cuenta? <Link to="/login" className="text-indigo-500 hover:text-indigo-700">Iniciar Sesión</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterComponent;