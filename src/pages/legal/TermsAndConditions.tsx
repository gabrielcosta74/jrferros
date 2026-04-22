import { COMPANY_INFO } from '@/src/constants';
import { LegalList, LegalPage, LegalSection, LegalUpdatedAt } from '@/src/components/legal/LegalLayout';

export function TermsAndConditions() {
  return (
    <LegalPage
      eyebrow="Informação legal"
      title="Termos de Utilização e Aviso Legal"
      description="Condições aplicáveis à utilização do website da JRS Ferros e informação legal sobre conteúdos, catálogo e pedidos de orçamento."
    >
      <LegalUpdatedAt />

      <LegalSection title="1. Identificação">
        <p>
          Este website é disponibilizado pela {COMPANY_INFO.name}, com estabelecimento em {COMPANY_INFO.addressDisplay}.
          Pode contactar-nos através de <a className="text-jrs-green-start underline" href={`mailto:${COMPANY_INFO.email}`}>{COMPANY_INFO.email}</a>{' '}
          ou pelos telefones {COMPANY_INFO.phoneWarehouse} / {COMPANY_INFO.mobileWarehouse}.
        </p>
      </LegalSection>

      <LegalSection title="2. Natureza do website">
        <p>
          O website tem finalidade informativa e de apresentação comercial de produtos siderúrgicos, ferragens e
          serviços associados. O website não constitui uma loja online e não permite concluir contratos de compra e venda
          diretamente através da plataforma.
        </p>
      </LegalSection>

      <LegalSection title="3. Catálogo, stock e pedidos de orçamento">
        <LegalList
          items={[
            'As fotografias, descrições, medidas e categorias são apresentadas para fins informativos e podem não representar todos os acabamentos, variações ou disponibilidade existentes em armazém.',
            'A disponibilidade, preços, prazos de entrega, condições de transporte e quantidades mínimas são confirmados caso a caso pela JRS Ferros.',
            'Pedidos enviados pelo website, email ou telefone constituem pedidos de informação ou orçamento e não vinculam a empresa até confirmação expressa.',
            'A JRS Ferros pode corrigir erros materiais, inexatidões ou omissões presentes no website.',
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Propriedade intelectual">
        <p>
          Textos, imagens, design, organização do catálogo, marcas, logótipos e demais elementos do website estão
          protegidos por direitos de propriedade intelectual ou por autorização dos respetivos titulares. Não é permitida
          a cópia, reprodução, modificação ou utilização comercial sem autorização prévia.
        </p>
      </LegalSection>

      <LegalSection title="5. Ligações e conteúdos de terceiros">
        <p>
          O website pode incluir ligações ou conteúdos externos, como Google Maps. A JRS Ferros não controla esses
          websites ou serviços e não é responsável pelas respetivas políticas, conteúdos ou tratamentos de dados.
        </p>
      </LegalSection>

      <LegalSection title="6. Responsabilidade">
        <p>
          A JRS Ferros procura manter a informação atualizada e correta, mas não garante que o website esteja
          permanentemente livre de erros, interrupções ou desatualizações. A informação técnica do catálogo deve ser
          confirmada antes de qualquer decisão de compra, projeto ou execução de obra.
        </p>
      </LegalSection>

      <LegalSection title="7. Lei aplicável">
        <p>
          A utilização do website rege-se pela lei portuguesa. Qualquer litígio será apreciado pelos meios legalmente
          competentes, sem prejuízo dos direitos dos consumidores e dos mecanismos de resolução alternativa de litígios
          aplicáveis.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
