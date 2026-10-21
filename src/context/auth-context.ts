import { createContext } from "react";
import type { Usuario } from "../types";

export interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (token: string) => Promise<Usuario>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
