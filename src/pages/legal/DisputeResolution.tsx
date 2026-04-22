import { COMPANY_INFO } from '@/src/constants';
import { LegalList, LegalPage, LegalSection, LegalUpdatedAt } from '@/src/components/legal/LegalLayout';

export function DisputeResolution() {
  return (
    <LegalPage
      eyebrow="Consumidor"
      title="Livro de Reclamações e Resolução de Litígios"
      description="Informação sobre reclamações e meios de resolução alternativa de litígios de consumo aplicáveis em Portugal."
    >
      <LegalUpdatedAt />

      <LegalSection title="1. Contacto direto">
        <p>
          Para qualquer reclamação, pedido de esclarecimento ou tentativa de resolução amigável, contacte a {COMPANY_INFO.name}{' '}
          através de <a className="text-jrs-green-start underline" href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>{' '}
          ou pelos telefones {COMPANY_INFO.phoneWarehouse} / {COMPANY_INFO.mobileWarehouse}.
        </p>
      </LegalSection>

      <LegalSection title="2. Livro de Reclamações Eletrónico">
        <p>
          Os consumidores podem aceder ao Livro de Reclamações Eletrónico através de{' '}
          <a className="text-jrs-green-start underline" href="https://www.livroreclamacoes.pt/" target="_blank" rel="noopener noreferrer">
            www.livroreclamacoes.pt
          </a>.
        </p>
      </LegalSection>

      <LegalSection title="3. Resolução alternativa de litígios de consumo">
        <p>
          Em caso de litígio de consumo, o consumidor pode recorrer a uma entidade de Resolução Alternativa de Litígios
          de Consumo (RAL), nos termos legalmente aplicáveis. A competência da entidade pode depender do local, natureza
          do contrato e qualidade das partes.
        </p>
        <LegalList
          items={[
            <>
              Lista oficial de entidades RAL disponível no Portal do Consumidor:{' '}
              <a className="text-jrs-green-start underline" href="https://www.consumidor.gov.pt/" target="_blank" rel="noopener noreferrer">
                www.consumidor.gov.pt
              </a>
            </>,
            <>
              Centro de Informação de Consumo e Arbitragem do Porto (CICAP):{' '}
              <a className="text-jrs-green-start underline" href="https://www.cicap.pt/" target="_blank" rel="noopener noreferrer">
                www.cicap.pt
              </a>
            </>,
            <>
              Centro Nacional de Informação e Arbitragem de Conflitos de Consumo (CNIACC):{' '}
              <a className="text-jrs-green-start underline" href="https://www.cniacc.pt/" target="_blank" rel="noopener noreferrer">
                www.cniacc.pt
              </a>
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Âmbito">
        <p>
          Esta informação aplica-se a litígios de consumo, isto é, relações entre consumidor e profissional nos termos
          legais. Relações exclusivamente comerciais ou profissionais entre empresas podem estar sujeitas a regras e
          meios de resolução diferentes.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
