import { db } from './config';
import {
  collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore';

const tasksCol = collection(db, 'tasks');

// Añadir tarea
export const addTask = async (uid, task) => {
  try {
    const docRef = await addDoc(tasksCol, {
      uid,
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'low',
      dueDate: task.dueDate || '',
      completed: task.completed || false,
      createdAt: serverTimestamp()
    });
    console.log("Tarea añadida con ID:", docRef.id);
  } catch (error) {
    console.error("Error al añadir tarea:", error);
    throw error;
  }
};

// Listener en tiempo real por usuario
export const getTasksRealtime = (uid, callback) => {
  const q = query(tasksCol, where('uid', '==', uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const tasks = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.() || new Date()
    }));
    console.log("Snapshot actualizado:", tasks);
    callback(tasks);
  }, (error) => {
    console.error("Error en snapshot de tareas:", error);
    callback([]);
  });
};

// Actualizar tarea
export const updateTask = async (id, data) => {
  try {
    await updateDoc(doc(db, 'tasks', id), data);
    console.log("Tarea actualizada:", id);
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    throw error;
  }
};

// Eliminar tarea
export const deleteTask = async (id) => {
  try {
    await deleteDoc(doc(db, 'tasks', id));
    console.log("Tarea eliminada:", id);
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    throw error;
  }
};
