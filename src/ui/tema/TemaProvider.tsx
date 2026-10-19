import { createContext, useContext, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import {
  lerPreferenciaTema,
  salvarPreferenciaTema,
  type PreferenciaTema,
} from '@/dados/preferencias';

import { cores, espacamento, raios, tipografia, type Cores, type EsquemaCores } from './tokens';

export function resolverEsquema(
  preferencia: PreferenciaTema,
  esquemaSistema: string | null | undefined,
): EsquemaCores {
  if (preferencia === 'sistema') {
    return esquemaSistema === 'dark' ? 'escuro' : 'claro';
  }
  return preferencia;
}

type ValorTema = {
  esquema: EsquemaCores;
  preferencia: PreferenciaTema;
  definirPreferencia: (preferencia: PreferenciaTema) => void;
  cores: Cores;
  tipografia: typeof tipografia;
  espacamento: typeof espacamento;
  raios: typeof raios;
};

const ContextoTema = createContext<ValorTema | null>(null);

export function TemaProvider({ children }: { children: ReactNode }) {
  const esquemaSistema = useColorScheme();
  const [preferencia, setPreferencia] = useState<PreferenciaTema>(lerPreferenciaTema);
  const esquema = resolverEsquema(preferencia, esquemaSistema);

  function definirPreferencia(nova: PreferenciaTema) {
    salvarPreferenciaTema(nova);
    setPreferencia(nova);
  }

  return (
    <ContextoTema.Provider
      value={{
        esquema,
        preferencia,
        definirPreferencia,
        cores: cores[esquema],
        tipografia,
        espacamento,
        raios,
      }}
    >
      {children}
    </ContextoTema.Provider>
  );
}

export function useTema(): ValorTema {
  const valor = useContext(ContextoTema);
  if (!valor) {
    throw new Error('useTema precisa estar dentro de TemaProvider');
  }
  return valor;
}
