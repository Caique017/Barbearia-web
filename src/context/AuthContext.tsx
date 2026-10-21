import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../api/auth";
import type { Usuario } from "../types";
import { AuthContext } from "./auth-context";
import { loginFor, loginForPath } from "../utils/auth-routes";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState<boolean>(
    !!localStorage.getItem("token"),
  );

  // Hidrata o usuário a partir do token salvo (GET /auth/me)
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (!saved) {
      setLoading(false);
      return;
    }
    let active = true;
    authApi
      .me()
      .then((u) => {
        if (active) setUsuario(u);
      })
      .catch(() => {
        localStorage.removeItem("token");
        if (active) {
          setToken(null);
          setUsuario(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (token: string) => {
    localStorage.setItem("token", token);
    setToken(token);
    const usuario = await authApi.me();
    setUsuario(usuario);
    return usuario;
  }, []);

  const logout = useCallback(() => {
    // Decide o destino antes de limpar o estado, senão o perfil já se perdeu.
    const destino = usuario
      ? loginFor(usuario.role)
      : loginForPath(window.location.pathname);
    localStorage.removeItem("token");
    setToken(null);
    setUsuario(null);
    window.location.href = destino;
  }, [usuario]);

  const value = useMemo(
    () => ({
      usuario,
      token,
      isAuthenticated: !!token,
      loading,
      login,
      logout,
    }),
    [usuario, token, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
