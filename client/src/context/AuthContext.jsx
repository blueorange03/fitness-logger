import React, { createContext, useReducer, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload, loading: false };
    case 'LOGOUT': return { user: null, loading: false };
    default: return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, { user: null, loading: true });

  async function fetchUser() {
    try {
      const res = await api.get('/auth/me');
      dispatch({ type: 'SET_USER', payload: res.data.user });
    } catch {
      dispatch({ type: 'LOGOUT' });
    }
  }

  useEffect(() => { fetchUser(); }, []);

  async function login(username, password) {
    await api.post('/auth/login', { username, password });
    await fetchUser();
  }

  async function logout() {
    await api.post('/auth/logout');
    dispatch({ type: 'LOGOUT' });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
