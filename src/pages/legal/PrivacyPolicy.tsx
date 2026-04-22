import { COMPANY_INFO } from '@/src/constants';
import { LegalList, LegalPage, LegalSection, LegalUpdatedAt } from '@/src/components/legal/LegalLayout';

export function PrivacyPolicy() {
  return (
    <LegalPage
      eyebrow="RGPD"
      title="Política de Privacidade"
      description="Informação sobre como a JRS Ferros trata dados pessoais quando visita o website, pede informações ou entra em contacto connosco."
    >
      <LegalUpdatedAt />

      <LegalSection title="1. Responsável pelo tratamento">
        <p>
          O responsável pelo tratamento dos dados pessoais é a {COMPANY_INFO.name}, com estabelecimento em{' '}
          {COMPANY_INFO.addressDisplay}. Para qualquer questão relacionada com privacidade ou exercício de direitos,
          contacte-nos através de <a className="text-jrs-green-start underline" href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>.
        </p>
      </LegalSection>

      <LegalSection title="2. Dados pessoais tratados">
        <LegalList
          items={[
            'Dados de identificação e contacto que nos envie voluntariamente, como nome, empresa, telefone, email e conteúdo da mensagem.',
            'Dados do pedido de orçamento, incluindo produtos, medidas, quantidades ou informação técnica que decida comunicar.',
            'Dados técnicos estritamente necessários ao funcionamento e segurança do website, como endereço IP, data/hora de acesso, páginas acedidas e informação técnica do navegador, normalmente tratados pelo fornecedor de alojamento.',
            'Preferências de cookies/serviços externos guardadas localmente no seu navegador.',
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Finalidades e fundamentos jurídicos">
        <LegalList
          items={[
            'Responder a pedidos de contacto, pedidos de orçamento e comunicações comerciais solicitadas pelo próprio utilizador, com fundamento em diligências pré-contratuais ou interesse legítimo em responder ao contacto.',
            'Gerir relações comerciais, encomendas, entregas, faturação e apoio ao cliente, quando exista uma relação contratual ou pré-contratual.',
            'Cumprir obrigações legais, fiscais, contabilísticas e de segurança aplicáveis.',
            'Garantir a segurança, disponibilidade e melhoria técnica do website, com fundamento no interesse legítimo e, quando aplicável, em obrigações legais de segurança.',
            'Carregar conteúdos externos, como Google Maps, apenas quando exista consentimento para serviços externos.',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Conservação dos dados">
        <p>
          Os dados são conservados apenas pelo período necessário às finalidades para que foram recolhidos. Pedidos de
          contacto e orçamento podem ser conservados durante o tempo necessário ao acompanhamento comercial e defesa de
          direitos. Dados integrados em documentos fiscais, contabilísticos ou contratuais são conservados pelos prazos
          legais aplicáveis. Registos técnicos de segurança são mantidos pelo período necessário à segurança e diagnóstico
          do serviço.
        </p>
      </LegalSection>

      <LegalSection title="5. Destinatários e subcontratantes">
        <p>
          Os dados podem ser tratados por fornecedores técnicos que prestem serviços de alojamento, email, manutenção do
          website ou comunicações, sempre na medida necessária. Quando autoriza o carregamento de conteúdos externos,
          como Google Maps, esses fornecedores podem tratar dados técnicos de acordo com as suas próprias políticas.
        </p>
      </LegalSection>

      <LegalSection title="6. Transferências internacionais">
        <p>
          A JRS Ferros procura recorrer a fornecedores com garantias adequadas. Alguns serviços externos, como Google
          Maps, podem implicar tratamento de dados fora do Espaço Económico Europeu. Nesses casos, o carregamento no
          website depende do seu consentimento para serviços externos.
        </p>
      </LegalSection>

      <LegalSection title="7. Direitos dos titulares dos dados">
        <p>
          Nos termos do RGPD, pode exercer os direitos de acesso, retificação, apagamento, limitação, oposição,
          portabilidade, e retirar consentimento quando o tratamento dependa de consentimento. Para exercer estes direitos,
          contacte <a className="text-jrs-green-start underline" href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>.
        </p>
        <p>
          Pode ainda apresentar reclamação junto da Comissão Nacional de Proteção de Dados em{' '}
          <a className="text-jrs-green-start underline" href="https://www.cnpd.pt/" target="_blank" rel="noopener noreferrer">
            www.cnpd.pt
          </a>.
        </p>
      </LegalSection>

      <LegalSection title="8. Segurança">
        <p>
          São adotadas medidas técnicas e organizativas adequadas para proteger os dados pessoais contra acesso indevido,
          perda, alteração ou divulgação não autorizada, tendo em conta a natureza dos dados e os riscos do tratamento.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
