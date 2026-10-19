import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Indica se o usuário pediu ao sistema para reduzir animações (RNF06).
export function useReduzirMovimento(): boolean {
  const [reduzir, setReduzir] = useState(false);

  useEffect(() => {
    let ativo = true;
    AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      if (ativo) {
        setReduzir(valor);
      }
    });
    const inscricao = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzir);
    return () => {
      ativo = false;
      inscricao.remove();
    };
  }, []);

  return reduzir;
}
