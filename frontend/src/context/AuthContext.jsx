// TICKET-ADV112 — AuthContext used by withAuth HOC; JWT persisted in memory
// (refresh path lives in HttpOnly cookie — out of scope for this trainer copy).
import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({ user: null, login: () => {}, logout: () => {} });

export function AuthProvider({ children }) {
  // TODO(TICKET-ADV112): lazy-init `user` from sessionStorage so a page
  //                     refresh doesn't blow the JWT away. Look for keys
  //                     'reconx-token' and 'reconx-role'.
  function readInitialUser() {
    if (typeof sessionStorage === 'undefined') return null;
    const token = sessionStorage.getItem('reconx-token');
    const role  = sessionStorage.getItem('reconx-role');
    return token ? { token, role } : null;
  }

  const [user, setUser ] = useState(readInitialUser);

  const login = (token, role ) => {
    // TODO(TICKET-ADV112): persist token+role to sessionStorage and call setUser.
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('reconx-token', token);
      if (role) sessionStorage.setItem('reconx-role', role);
    }
    setUser({ token, role });
  };

  const logout = () => {
    // TODO(TICKET-ADV112): clear sessionStorage and reset user state to null.
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('reconx-token');
      sessionStorage.removeItem('reconx-role');
    }
    setUser(null);
  
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
