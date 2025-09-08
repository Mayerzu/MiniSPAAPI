import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../repositories/firebase/config';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../repositories/firebase/config';
import { addTask, getTasksRealtime, updateTask, deleteTask } from '../../repositories/firebase/firestore';

function TodoList() {
  const [user, loading, error] = useAuthState(auth);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [dueDate, setDueDate] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [layout, setLayout] = useState('full');

  useEffect(() => {
    if (!user) return;
    console.log("Iniciando listener de tareas y layout para UID:", user.uid);

    // Listener tareas por usuario
    const unsubscribeTasks = getTasksRealtime(user.uid, setTasks);

    // Listener layout
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeLayout = onSnapshot(userRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setLayout(data.layout || 'full');
      }
    }, (err) => console.error("Error al cargar layout:", err));

    return () => {
      unsubscribeTasks && unsubscribeTasks();
      unsubscribeLayout && unsubscribeLayout();
    };
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      await addTask(user.uid, { title, description, priority, dueDate, completed: false });
      setTitle('');
      setDescription('');
      setPriority('low');
      setDueDate('');
    } catch (error) {
      console.error("Error al añadir tarea:", error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    }
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingTitle(task.title);
  };

  const saveEdit = async () => {
    if (!editingTitle.trim()) return;
    try {
      await updateTask(editingId, { title: editingTitle.trim() });
      setEditingId(null);
      setEditingTitle('');
    } catch (error) {
      console.error("Error al guardar edición:", error);
    }
  };

  const remove = async (id) => {
    console.log("Intentando eliminar tarea:", id);
  try {
    await deleteTask(id);
    console.log("Tarea eliminada correctamente:", id);
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
  }
  };

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error.message}</p>;
  if (!user) return null;

  return (
    <section className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      <div className={layout === 'full' ? 'max-w-4xl mx-auto' : 'max-w-2xl mx-auto'}>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Lista de Tareas</h1>
        <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"/>
            <input type="text" placeholder="Descripción" value={description} onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"/>
            <select value={priority} onChange={e => setPriority(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
            <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white"/>
          </div>
          <button type="submit" className="mt-4 w-full bg-blue-600 text-white py-2 rounded">Añadir</button>
        </form>

        {tasks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No hay tareas aún.</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex justify-between items-center mb-2">
              <div>
                {editingId === task.id ? (
                  <input type="text" value={editingTitle} onChange={e => setEditingTitle(e.target.value)}
                    className="border px-2 py-1 rounded dark:bg-gray-700 dark:text-white"/>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-800 dark:text-white">{task.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{task.description || 'Sin descripción'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prioridad: {task.priority}</p>
                    {task.dueDate && <p className="text-xs text-gray-500 dark:text-gray-400">Vence: {task.dueDate}</p>}
                  </>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task)} />
                {editingId === task.id ? (
                  <button onClick={saveEdit} className="px-2 py-1 bg-green-500 text-white rounded">Guardar</button>
                ) : (
                  <>
                    <button onClick={() => startEdit(task)} className="px-2 py-1 bg-yellow-500 text-white rounded">Editar</button>
                    <button onClick={() => remove(task.id)} className="px-2 py-1 bg-red-500 text-white rounded">Eliminar</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default TodoList;
