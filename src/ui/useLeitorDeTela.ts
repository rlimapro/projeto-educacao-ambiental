import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

// Indica se há um leitor de tela ligado (TalkBack, VoiceOver). Serve para não
// dar prazo curto a quem navega por ele, como no "Desfazer".
export function useLeitorDeTela(): boolean {
  const [ligado, setLigado] = useState(false);

  useEffect(() => {
    // Na web (só a prévia), o react-native-web sempre responde que há leitor de
    // tela, porque o navegador não informa isso; o app é publicado só no celular.
    if (Platform.OS === 'web') return;
    let ativo = true;
    AccessibilityInfo.isScreenReaderEnabled().then((valor) => {
      if (ativo) setLigado(valor);
    });
    const inscricao = AccessibilityInfo.addEventListener('screenReaderChanged', setLigado);
    return () => {
      ativo = false;
      inscricao.remove();
    };
  }, []);

  return ligado;
}
