"use client";

import * as React from "react";

import type { Usuario } from "@/types/usuario";

const UsuarioContext = React.createContext<Usuario | null>(null);

export function UsuarioProvider({
  usuario,
  children,
}: {
  usuario: Usuario;
  children: React.ReactNode;
}) {
  return (
    <UsuarioContext.Provider value={usuario}>
      {children}
    </UsuarioContext.Provider>
  );
}

export function useUsuarioAtual(): Usuario {
  const usuario = React.useContext(UsuarioContext);
  if (!usuario) {
    throw new Error("useUsuarioAtual deve ser usado dentro de UsuarioProvider.");
  }
  return usuario;
}
