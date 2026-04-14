import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const STORAGE_KEY = 'aridos_auth_user';
const USERS_COLLECTION = 'aridos_usuarios';
const AuthContext = createContext(null);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeCuentaId(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-_]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function readStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildAppUser(firebaseUser, profile) {
  return {
    uid: firebaseUser.uid,
    email: normalizeEmail(profile?.email || firebaseUser.email),
    name: String(profile?.name || firebaseUser.displayName || firebaseUser.email || '').trim(),
    cuentaId: normalizeCuentaId(profile?.cuentaId),
    cuentaNombre: String(profile?.cuentaNombre || '').trim(),
    role: String(profile?.role || 'owner').trim() || 'owner',
  };
}

async function fetchUserProfile(uid) {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snapshot.exists() ? snapshot.data() : null;
}

function getFriendlyAuthError(error) {
  switch (error?.code) {
    case 'auth/email-already-in-use':
      return 'Ese email ya está registrado.';
    case 'auth/invalid-email':
      return 'Ingresá un email válido.';
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Probá de nuevo en unos minutos.';
    default:
      return error?.message || 'No se pudo completar la autenticación.';
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (user) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(STORAGE_KEY);

    window.dispatchEvent(
      new CustomEvent('aridos-auth-user-changed', {
        detail: user || null,
      }),
    );
  }, [user]);

  useEffect(() => {
    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) return;

      if (!firebaseUser) {
        setUser(null);
        setIsInitializing(false);
        return;
      }

      setIsInitializing(true);

      try {
        const profile = await fetchUserProfile(firebaseUser.uid);

        if (!profile) {
          await signOut(auth);
          if (!active) return;
          setUser(null);
          return;
        }

        if (!active) return;
        setUser(buildAppUser(firebaseUser, profile));
      } catch {
        if (!active) return;
        setUser(null);
      } finally {
        if (active) setIsInitializing(false);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  async function register({ name, email, password, cuentaId, cuentaNombre = '' }) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedCuentaId = normalizeCuentaId(cuentaId);
    const normalizedName = String(name || '').trim();
    const normalizedCuentaNombre = String(cuentaNombre || '').trim();

    if (!normalizedName) throw new Error('Ingresá el nombre del usuario.');
    if (!normalizedEmail) throw new Error('Ingresá un email válido.');
    if (!password || String(password).length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }
    if (!normalizedCuentaId) throw new Error('Ingresá el ID del corralón o cuenta.');

    try {
      setIsInitializing(true);
      await setPersistence(auth, browserLocalPersistence);
      const credentials = await createUserWithEmailAndPassword(auth, normalizedEmail, password);

      if (normalizedName) {
        await updateProfile(credentials.user, { displayName: normalizedName });
      }

      const profile = {
        uid: credentials.user.uid,
        email: normalizedEmail,
        name: normalizedName,
        cuentaId: normalizedCuentaId,
        cuentaNombre: normalizedCuentaNombre,
        role: 'owner',
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, USERS_COLLECTION, credentials.user.uid), profile);

      const appUser = buildAppUser(credentials.user, profile);
      setUser(appUser);
      return appUser;
    } catch (error) {
      throw new Error(getFriendlyAuthError(error));
    } finally {
      setIsInitializing(false);
    }
  }

  async function login({ email, password }) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) throw new Error('Ingresá un email válido.');
    if (!password) throw new Error('Ingresá la contraseña.');

    try {
      setIsInitializing(true);
      await setPersistence(auth, browserLocalPersistence);
      const credentials = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      const profile = await fetchUserProfile(credentials.user.uid);

      if (!profile) {
        await signOut(auth);
        throw new Error('Este usuario no tiene perfil cargado. Registralo primero o completá el alta.');
      }

      const appUser = buildAppUser(credentials.user, profile);
      setUser(appUser);
      return appUser;
    } catch (error) {
      throw new Error(getFriendlyAuthError(error));
    } finally {
      setIsInitializing(false);
    }
  }

  async function logout() {
    await signOut(auth);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      profile: user,
      isAuthenticated: Boolean(user?.uid && user?.email),
      isInitializing,
      register,
      login,
      logout,
    }),
    [user, isInitializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
