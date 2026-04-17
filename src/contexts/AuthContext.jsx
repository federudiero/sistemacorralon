import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { bootstrapOwnerAccount } from '../services/authBootstrap.service';

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

function waitForAuthenticatedUser(timeoutMs = 10000) {
  if (auth.currentUser?.uid) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise((resolve, reject) => {
    let finished = false;

    const timeoutId = setTimeout(() => {
      if (finished) return;
      finished = true;
      unsubscribe();
      reject(new Error('No se pudo establecer la sesión del usuario recién creado.'));
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (finished || !firebaseUser) return;
      finished = true;
      clearTimeout(timeoutId);
      unsubscribe();
      resolve(firebaseUser);
    });
  });
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [isInitializing, setIsInitializing] = useState(true);
  const bootstrapUidRef = useRef(null);

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
          if (bootstrapUidRef.current && bootstrapUidRef.current === firebaseUser.uid) {
            setIsInitializing(false);
            return;
          }

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

    let createdUser = null;
    let bootstrapped = false;

    try {
      setIsInitializing(true);
      await setPersistence(auth, browserLocalPersistence);

      const credentials = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      createdUser = credentials.user;
      bootstrapUidRef.current = createdUser.uid;

      if (normalizedName) {
        await updateProfile(createdUser, { displayName: normalizedName });
      }

      await createdUser.getIdToken(true);
      await waitForAuthenticatedUser();

      const bootstrapProfile = await bootstrapOwnerAccount({
        cuentaId: normalizedCuentaId,
        cuentaNombre: normalizedCuentaNombre,
        name: normalizedName,
      });

      bootstrapped = true;
      bootstrapUidRef.current = null;

      const storedProfile = await fetchUserProfile(createdUser.uid);
      const finalProfile = storedProfile || bootstrapProfile;

      if (!finalProfile) {
        throw new Error('El backend no devolvió el perfil del usuario owner.');
      }

      const appUser = buildAppUser(createdUser, finalProfile);
      setUser(appUser);
      return appUser;
    } catch (error) {
      bootstrapUidRef.current = null;

      if (createdUser && !bootstrapped) {
        try {
          if (auth.currentUser?.uid === createdUser.uid) {
            await deleteUser(auth.currentUser);
          } else {
            await deleteUser(createdUser);
          }
        } catch {
          try {
            await signOut(auth);
          } catch {
            // noop
          }
        }
      }

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

  async function resetPassword(email) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) throw new Error('Ingresá un email válido.');

    try {
      await sendPasswordResetEmail(auth, normalizedEmail);
    } catch (error) {
      throw new Error(getFriendlyAuthError(error));
    }
  }

  async function logout() {
    bootstrapUidRef.current = null;
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
      resetPassword,
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
