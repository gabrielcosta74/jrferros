import { CookiePreferenceControls } from '@/src/components/legal/CookieConsent';
import { LegalList, LegalPage, LegalSection, LegalUpdatedAt } from '@/src/components/legal/LegalLayout';

export function CookiePolicy() {
  return (
    <LegalPage
      eyebrow="Privacidade"
      title="Política de Cookies"
      description="Informação sobre cookies, armazenamento local e serviços externos utilizados neste website."
    >
      <LegalUpdatedAt />

      <LegalSection title="1. O que são cookies e tecnologias semelhantes">
        <p>
          Cookies são pequenos ficheiros guardados no navegador. Tecnologias semelhantes, como localStorage, permitem
          guardar preferências técnicas no dispositivo do utilizador. Algumas destas tecnologias são necessárias ao
          funcionamento do site; outras dependem de consentimento.
        </p>
      </LegalSection>

      <LegalSection title="2. O que este website utiliza">
        <LegalList
          items={[
            'Armazenamento técnico de preferências: guardamos a sua escolha sobre serviços externos no navegador, para não pedir a mesma decisão em cada visita.',
            'Serviços externos: o Google Maps só é carregado depois de permitir serviços externos. Antes disso, o mapa fica bloqueado.',
            'Não usamos, nesta versão do website, cookies próprios de analytics, publicidade comportamental ou remarketing.',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Serviços externos">
        <p>
          Ao permitir serviços externos, conteúdos de terceiros podem recolher identificadores técnicos, endereço IP,
          dados do navegador e informação de interação, de acordo com as políticas próprias desses fornecedores. O
          principal serviço externo utilizado no website é o Google Maps, para apresentar a localização da empresa.
        </p>
      </LegalSection>

      <LegalSection title="4. Gerir preferências">
        <p>Pode alterar a sua preferência para serviços externos a qualquer momento:</p>
        <CookiePreferenceControls />
      </LegalSection>

      <LegalSection title="5. Como eliminar dados guardados no navegador">
        <p>
          Pode também apagar cookies e armazenamento local através das definições do seu navegador. Ao fazê-lo, poderá
          ser novamente pedido que escolha se pretende permitir ou bloquear serviços externos.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
