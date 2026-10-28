import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';
import { authApi } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load session on startup
  useEffect(() => {
    async function initAuth() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (currentSession) {
            setSession(currentSession);
            localStorage.setItem('codebuddy_token', currentSession.access_token);
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email,
              displayName: currentSession.user.user_metadata?.full_name || currentSession.user.email.split('@')[0]
            });
          }

          // Listen for Supabase auth state changes
          supabase.auth.onAuthStateChange((_event, newSession) => {
            if (newSession) {
              setSession(newSession);
              localStorage.setItem('codebuddy_token', newSession.access_token);
              setUser({
                id: newSession.user.id,
                email: newSession.user.email,
                displayName: newSession.user.user_metadata?.full_name || newSession.user.email.split('@')[0]
              });
            } else {
              setSession(null);
              setUser(null);
              localStorage.removeItem('codebuddy_token');
            }
          });
        } else {
          // Check for saved demo token in localStorage
          const savedToken = localStorage.getItem('codebuddy_token');
          const isExplicitlyLoggedOut = localStorage.getItem('codebuddy_logged_out') === 'true';

          if (savedToken) {
            const savedUserStr = localStorage.getItem('codebuddy_user');
            if (savedUserStr) {
              try {
                setUser(JSON.parse(savedUserStr));
                setSession({ access_token: savedToken });
              } catch (e) {
                // Ignore parse errors
              }
            }
          } else if (!isExplicitlyLoggedOut) {
            // Auto-initialize demo mode on first launch for instant local development
            const defaultDemo = {
              id: 'demo-user-123e4567-e89b-12d3-a456-426614174000',
              email: 'student@codebuddy.ai',
              displayName: 'Demo Student'
            };
            const demoToken = 'demo-token';
            localStorage.setItem('codebuddy_token', demoToken);
            localStorage.setItem('codebuddy_user', JSON.stringify(defaultDemo));
            setUser(defaultDemo);
            setSession({ access_token: demoToken });
          }
        }
      } catch (err) {
        console.warn('[AUTH] Initialization error:', err.message);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    localStorage.removeItem('codebuddy_logged_out');
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      localStorage.setItem('codebuddy_token', data.session.access_token);
      const profile = {
        id: data.user.id,
        email: data.user.email,
        displayName: data.user.user_metadata?.full_name || data.user.email.split('@')[0]
      };
      setUser(profile);
      return profile;
    }

    // Local Demo Auth
    const demoUser = {
      id: 'demo-user-123e4567-e89b-12d3-a456-426614174000',
      email: email || 'student@codebuddy.ai',
      displayName: email ? email.split('@')[0] : 'Demo Student'
    };
    const demoToken = 'demo-token';
    localStorage.setItem('codebuddy_token', demoToken);
    localStorage.setItem('codebuddy_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setSession({ access_token: demoToken });
    return demoUser;
  };

  const register = async (email, password, displayName) => {
    localStorage.removeItem('codebuddy_logged_out');
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: displayName }
        }
      });
      if (error) throw error;
      if (data.session) {
        setSession(data.session);
        localStorage.setItem('codebuddy_token', data.session.access_token);
        const profile = {
          id: data.user.id,
          email: data.user.email,
          displayName: displayName || data.user.email.split('@')[0]
        };
        setUser(profile);
        return profile;
      }
      return null;
    }

    // Local Demo Register
    const newUser = {
      id: 'demo-user-123e4567-e89b-12d3-a456-426614174000',
      email,
      displayName: displayName || email.split('@')[0]
    };
    localStorage.setItem('codebuddy_token', 'demo-token');
    localStorage.setItem('codebuddy_user', JSON.stringify(newUser));
    setUser(newUser);
    setSession({ access_token: 'demo-token' });
    return newUser;
  };

  const loginAsDemo = () => {
    return login('student@codebuddy.ai', 'demopass123');
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('codebuddy_token');
    localStorage.removeItem('codebuddy_user');
    localStorage.setItem('codebuddy_logged_out', 'true');
    setUser(null);
    setSession(null);
  };

  const updateDisplayName = async (newDisplayName) => {
    if (!user) return;
    try {
      await authApi.updateProfile(newDisplayName);
    } catch (e) {
      // Ignore if offline
    }
    const updated = { ...user, displayName: newDisplayName };
    setUser(updated);
    localStorage.setItem('codebuddy_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        loginAsDemo,
        logout,
        updateDisplayName,
        isCloudAuth: isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
