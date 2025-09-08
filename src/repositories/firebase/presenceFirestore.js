import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

export const initPresence = () => {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    try {
      await updateDoc(userRef, { online: true, lastSeen: serverTimestamp() });
      console.log("Presencia actualizada: online");
    } catch (err) {
      console.error("Error al actualizar presencia online:", err);
    }
    const handleBeforeUnload = async () => {
      try {
        await updateDoc(userRef, { online: false, lastSeen: serverTimestamp() });
        console.log("Presencia actualizada: offline");
      } catch (err) {
        console.error("Error al actualizar presencia offline:", err);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  });
};

export const updatePresence = async (uid, online) => {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, { online, lastSeen: serverTimestamp() });
    console.log("Presencia manual actualizada:", online);
  } catch (err) {
    console.error("Error al actualizar presencia:", err);
  }
};