import { FiscalDocument } from '../types/fiscalEngine';
import { CompanyRegistration } from '../types/company';

/**
 * Retorna exatamente os 5 documentos NFS-e com 1 item cada vinculados à empresa selecionada.
 * Respeita rigorosamente a regra absoluta:
 * TOTAL DOCUMENTOS = 5
 * NFS-e = 5
 * NF-e = 0
 * CT-e = 0
 * 1 ITEM POR NFS-e = 5 ITENS TOTAIS
 */
export function getAuditedFiscalSeedDocuments(company?: CompanyRegistration): FiscalDocument[] {
  const compCnpj = company?.cnpj || 'Não informado';
  const compRazao = company?.razaoSocial || company?.nomeFantasia || 'Não informado';
  const compFantasia = company?.nomeFantasia || company?.razaoSocial || 'Não informado';
  const compInscMun = company?.dadosFiscais?.codigoServicoMunicipal || 'Não informado';
  const compLogradouro = 'Av. Principal';
  const compNumero = '1000';
  const compBairro = 'Centro';
  const compMun = company?.municipio || 'São Paulo';
  const compUf = company?.uf || 'SP';
  const compCep = '01000-000';
  const compRegime = company?.regimeTributario || 'Lucro Real';
  const orgId = company?.organizacaoAdministradoraId || 'org_active';
  const compId = company?.id || 'comp_active';

  return [
    // =========================================================================
    // DOCUMENTO 1: NFS-e — CENÁRIO 1: PRESTADA (SAAS ENTERPRISE CORE)
    // Empresa Selecionada = Prestador (Receita / Faturamento) — 1 Item
    // =========================================================================
    {
      id: 'doc_nfse_001',
      tipoDocumento: 'NFSE',
      modelo: 'NFS-e',
      numero: '000.012.890',
      serie: 'NFS',
      chaveAcesso: '3550308000012890384928120001940001',
      dataEmissao: '2026-08-15T09:00:00-03:00',
      versaoLeiaute: '2.04',
      periodoReferencia: '08/2026',
      ambiente: 'Produção',
      finalidade: 'Normal',
      tipoOperacao: 'Saída',
      emitente: {
        tipo: 'EMITENTE',
        cnpjCpf: compCnpj,
        razaoSocial: compRazao,
        nomeFantasia: compFantasia,
        inscricaoMunicipal: compInscMun,
        logradouro: compLogradouro,
        numero: compNumero,
        bairro: compBairro,
        municipio: compMun,
        uf: compUf,
        cep: compCep,
        regimeTributario: compRegime
      },
      tomador: {
        tipo: 'TOMADOR',
        cnpjCpf: '24.789.101/0001-33',
        razaoSocial: 'Vértice Comércio S.A.',
        nomeFantasia: 'Vértice Distribuição & Comércio',
        inscricaoMunicipal: '44556677',
        logradouro: 'Av. Brigadeiro Faria Lima',
        numero: '3477',
        bairro: 'Itaim Bibi',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '04538-133',
        regimeTributario: 'Lucro Real'
      },
      naturezaOperacao: 'PRESTAÇÃO DE SERVIÇOS DE TECNOLOGIA DA INFORMAÇÃO E LICENCIAMENTO SAAS',
      cfopPrincipal: '5933',
      municipioOrigem: compMun,
      ufOrigem: compUf,
      municipioDestino: 'São Paulo',
      ufDestino: 'SP',
      informacoesComplementares: 'Subscrição da plataforma SaaS Enterprise Core e consultoria especializada de transição tributária. ISSQN 5,00% devido no município. Transição 2026: CBS 0,90% e IBS 0,10% (0,05% EST + 0,05% MUN).',
      itens: [
        {
          numeroItem: 1,
          codigo: 'SAAS-CORE-ENTERPRISE',
          descricao: 'Licenciamento Mensal Plataforma SaaS Enterprise Core (5.000 Usuários)',
          nbs: '1.0101.10.00',
          codigoServico: '01.01.01',
          cfop: '5933',
          unidade: 'MES',
          quantidade: 1,
          valorUnitario: 145000.00,
          valorTotal: 145000.00,
          desconto: 5000.00,
          tributacao: {
            issqn: { cst: '01', baseCalculo: 140000.00, aliquota: 5.00, valor: 7000.00 },
            pis: { cst: '01', baseCalculo: 140000.00, aliquota: 1.65, valor: 2310.00 },
            cofins: { cst: '01', baseCalculo: 140000.00, aliquota: 7.60, valor: 10640.00 },
            cbs: { cst: '01', baseCalculo: 120050.00, aliquota: 0.90, valorCBS: 1080.45 },
            ibs: { cst: '01', baseCalculo: 120050.00, aliquotaTotal: 0.10, valorIBSTotal: 120.05 }
          }
        }
      ],
      totais: {
        valorServicos: 145000.00,
        valorDesconto: 5000.00,
        valorTotalDocumento: 140000.00,
        valorISS: 7000.00,
        valorPIS: 2310.00,
        valorCOFINS: 10640.00,
        valorCBS: 1080.45,
        valorIBSTotal: 120.05
      },
      arquivoOriginal: `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="2.04">
    <InfNfse Id="NFSE3550308000012890">
      <Numero>12890</Numero>
      <CodigoVerificacao>890A-BC12-DF34</CodigoVerificacao>
      <DataEmissao>2026-08-15T09:00:00-03:00</DataEmissao>
      <Servico>
        <Valores>
          <ValorServicos>145000.00</ValorServicos>
          <ValorPis>2310.00</ValorPis>
          <ValorCofins>10640.00</ValorCofins>
          <ValorIss>7000.00</ValorIss>
          <BaseCalculo>140000.00</BaseCalculo>
          <Aliquota>0.05</Aliquota>
          <ValorLiquidoNfse>140000.00</ValorLiquidoNfse>
          <DescontoIncondicionado>5000.00</DescontoIncondicionado>
        </Valores>
        <ItemListaServico>01.01</ItemListaServico>
        <CodigoTributacaoMunicipio>010101</CodigoTributacaoMunicipio>
        <Discriminacao>Licenciamento Mensal Plataforma SaaS Enterprise Core (5.000 Usuarios).</Discriminacao>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`,
      nomeOriginal: 'NFSe_000012890_SaaS_Enterprise.xml',
      extensao: 'xml',
      hashSha256: 'c3d4e5f6a7b8091a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a',
      tamanhoBytes: 5240,
      dataHoraImportacao: '2026-08-15T09:05:00-03:00',
      usuarioResponsavel: {
        id: 'user_admin',
        nome: 'Auditor Fiscal do Sistema',
        email: 'auditor@ebitax.com.br'
      },
      organizacaoAdministradoraId: orgId,
      empresaAtivaId: compId,
      empresaAtivaCnpj: compCnpj,
      status: 'Importado',
      errosValidacao: [],
      alertasValidacao: []
    },

    // =========================================================================
    // DOCUMENTO 2: NFS-e — CENÁRIO 2: TOMADA (CLOUD TIER III & CYBER SECURITY)
    // Empresa Selecionada = Tomador (Despesa / Crédito) — 1 Item
    // =========================================================================
    {
      id: 'doc_nfse_002',
      tipoDocumento: 'NFSE',
      modelo: 'NFS-e',
      numero: '000.034.781',
      serie: 'NFS',
      chaveAcesso: '3550308000034781551234560001780001',
      dataEmissao: '2026-08-12T16:45:00-03:00',
      versaoLeiaute: '2.04',
      periodoReferencia: '08/2026',
      ambiente: 'Produção',
      finalidade: 'Normal',
      tipoOperacao: 'Entrada',
      emitente: {
        tipo: 'EMITENTE',
        cnpjCpf: '55.123.456/0001-78',
        razaoSocial: 'Cloud Infrastructure Solutions Ltda.',
        nomeFantasia: 'Global Cloud Tier III',
        inscricaoMunicipal: '99881122',
        logradouro: 'Av. Chucri Zaidan',
        numero: '1550',
        bairro: 'Vila Cordeiro',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '04711-130',
        regimeTributario: 'Lucro Real'
      },
      destinatario: {
        tipo: 'DESTINATARIO',
        cnpjCpf: compCnpj,
        razaoSocial: compRazao,
        nomeFantasia: compFantasia,
        inscricaoMunicipal: compInscMun,
        logradouro: compLogradouro,
        numero: compNumero,
        bairro: compBairro,
        municipio: compMun,
        uf: compUf,
        cep: compCep,
        regimeTributario: compRegime
      },
      naturezaOperacao: 'SERVIÇOS DE HOSPEDAGEM, PROCESSAMENTO EM NUVEM E PROTEÇÃO CIBERNÉTICA',
      cfopPrincipal: '1933',
      municipioOrigem: 'São Paulo',
      ufOrigem: 'SP',
      municipioDestino: compMun,
      ufDestino: compUf,
      informacoesComplementares: 'Tomada de serviços essenciais de infraestrutura de dados em nuvem. Crédito integral de PIS (1,65%) e COFINS (7,60%) no Lucro Real. Transição 2026: Crédito CBS 0,90% e IBS 0,10%.',
      itens: [
        {
          numeroItem: 1,
          codigo: 'CLOUD-TIER3-DEDIC',
          descricao: 'Hospedagem e Processamento em Nuvem Dedicada Tier III com 99.99% SLA',
          nbs: '1.0102.10.00',
          codigoServico: '01.07.01',
          cfop: '1933',
          unidade: 'MES',
          quantidade: 1,
          valorUnitario: 88000.00,
          valorTotal: 88000.00,
          desconto: 0,
          tributacao: {
            issqn: { cst: '01', baseCalculo: 88000.00, aliquota: 2.00, valor: 1760.00 },
            pis: { cst: '01', baseCalculo: 88000.00, aliquota: 1.65, valor: 1452.00 },
            cofins: { cst: '01', baseCalculo: 88000.00, aliquota: 7.60, valor: 6688.00 },
            cbs: { cst: '01', baseCalculo: 78100.00, aliquota: 0.90, valorCBS: 702.90 },
            ibs: { cst: '01', baseCalculo: 78100.00, aliquotaTotal: 0.10, valorIBSTotal: 78.10 }
          }
        }
      ],
      totais: {
        valorServicos: 88000.00,
        valorDesconto: 0,
        valorTotalDocumento: 88000.00,
        valorISS: 1760.00,
        valorPIS: 1452.00,
        valorCOFINS: 6688.00,
        valorCBS: 702.90,
        valorIBSTotal: 78.10
      },
      arquivoOriginal: `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="2.04">
    <InfNfse Id="NFSE3550308000034781">
      <Numero>34781</Numero>
      <CodigoVerificacao>781D-EF56-GH78</CodigoVerificacao>
      <DataEmissao>2026-08-12T16:45:00-03:00</DataEmissao>
      <Servico>
        <Valores>
          <ValorServicos>88000.00</ValorServicos>
          <ValorPis>1452.00</ValorPis>
          <ValorCofins>6688.00</ValorCofins>
          <ValorIss>1760.00</ValorIss>
          <BaseCalculo>88000.00</BaseCalculo>
          <ValorLiquidoNfse>88000.00</ValorLiquidoNfse>
        </Valores>
        <ItemListaServico>01.07</ItemListaServico>
        <Discriminacao>Hospedagem e Processamento em Nuvem Dedicada Tier III com 99.99% SLA.</Discriminacao>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`,
      nomeOriginal: 'NFSe_CloudSolutions_34781.xml',
      extensao: 'xml',
      hashSha256: 'd4e5f6a7b8c9102b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
      tamanhoBytes: 4890,
      dataHoraImportacao: '2026-08-12T16:50:00-03:00',
      usuarioResponsavel: {
        id: 'user_admin',
        nome: 'Auditor Fiscal do Sistema',
        email: 'auditor@ebitax.com.br'
      },
      organizacaoAdministradoraId: orgId,
      empresaAtivaId: compId,
      empresaAtivaCnpj: compCnpj,
      status: 'Importado',
      errosValidacao: [],
      alertasValidacao: []
    },

    // =========================================================================
    // DOCUMENTO 3: NFS-e — CENÁRIO 3: PRESTADA (CONSULTORIA EM IA & REFORMA)
    // Empresa Selecionada = Prestador (Receita / Faturamento) — 1 Item
    // =========================================================================
    {
      id: 'doc_nfse_003',
      tipoDocumento: 'NFSE',
      modelo: 'NFS-e',
      numero: '000.018.550',
      serie: 'NFS',
      chaveAcesso: '3550308000018550384928120001940001',
      dataEmissao: '2026-08-14T10:30:00-03:00',
      versaoLeiaute: '2.04',
      periodoReferencia: '08/2026',
      ambiente: 'Produção',
      finalidade: 'Normal',
      tipoOperacao: 'Saída',
      emitente: {
        tipo: 'EMITENTE',
        cnpjCpf: compCnpj,
        razaoSocial: compRazao,
        nomeFantasia: compFantasia,
        inscricaoMunicipal: compInscMun,
        logradouro: compLogradouro,
        numero: compNumero,
        bairro: compBairro,
        municipio: compMun,
        uf: compUf,
        cep: compCep,
        regimeTributario: compRegime
      },
      tomador: {
        tipo: 'TOMADOR',
        cnpjCpf: '12.345.678/0001-90',
        razaoSocial: 'Banco Digital Alpha S.A.',
        nomeFantasia: 'Banco Alpha Digital',
        inscricaoMunicipal: '66778899',
        logradouro: 'Praça XV de Novembro',
        numero: '20',
        bairro: 'Centro',
        municipio: 'Rio de Janeiro',
        uf: 'RJ',
        cep: '20010-010',
        regimeTributario: 'Lucro Real'
      },
      naturezaOperacao: 'CONSULTORIA ESPECIALIZADA EM INTELIGÊNCIA ARTIFICIAL E AUDITORIA TRIBUTÁRIA',
      cfopPrincipal: '6933',
      municipioOrigem: compMun,
      ufOrigem: compUf,
      municipioDestino: 'Rio de Janeiro',
      ufDestino: 'RJ',
      informacoesComplementares: 'Assessoria de implantação de motores preditivos de cálculo CBS/IBS e governança de dados da Reforma Tributária. ISS 5,00% devido no município. CBS 0,90% e IBS 0,10%.',
      itens: [
        {
          numeroItem: 1,
          codigo: 'AI-PRED-REFORMA',
          descricao: 'Módulo Analítico de Inteligência Preditiva CBS/IBS e Otimizador de Margens',
          nbs: '1.0101.10.00',
          codigoServico: '01.01.01',
          cfop: '6933',
          unidade: 'MES',
          quantidade: 1,
          valorUnitario: 65000.00,
          valorTotal: 65000.00,
          desconto: 0,
          tributacao: {
            issqn: { cst: '01', baseCalculo: 65000.00, aliquota: 5.00, valor: 3250.00 },
            pis: { cst: '01', baseCalculo: 65000.00, aliquota: 1.65, valor: 1072.50 },
            cofins: { cst: '01', baseCalculo: 65000.00, aliquota: 7.60, valor: 4940.00 },
            cbs: { cst: '01', baseCalculo: 55737.50, aliquota: 0.90, valorCBS: 501.64 },
            ibs: { cst: '01', baseCalculo: 55737.50, aliquotaTotal: 0.10, valorIBSTotal: 55.74 }
          }
        }
      ],
      totais: {
        valorServicos: 65000.00,
        valorDesconto: 0,
        valorTotalDocumento: 65000.00,
        valorISS: 3250.00,
        valorPIS: 1072.50,
        valorCOFINS: 4940.00,
        valorCBS: 501.64,
        valorIBSTotal: 55.74
      },
      arquivoOriginal: `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="2.04">
    <InfNfse Id="NFSE3550308000018550">
      <Numero>18550</Numero>
      <CodigoVerificacao>1855-ALPHA-2026</CodigoVerificacao>
      <DataEmissao>2026-08-14T10:30:00-03:00</DataEmissao>
      <Servico>
        <Valores>
          <ValorServicos>65000.00</ValorServicos>
          <ValorPis>1072.50</ValorPis>
          <ValorCofins>4940.00</ValorCofins>
          <ValorIss>3250.00</ValorIss>
          <BaseCalculo>65000.00</BaseCalculo>
          <ValorLiquidoNfse>65000.00</ValorLiquidoNfse>
        </Valores>
        <ItemListaServico>01.01</ItemListaServico>
        <Discriminacao>Modulo Analitico de Inteligencia Preditiva CBS/IBS e Otimizador de Margens.</Discriminacao>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`,
      nomeOriginal: 'NFSe_000018550_AI_Analytics.xml',
      extensao: 'xml',
      hashSha256: 'e1f2a3b4c5d67890abcdef0123456789abcdef0123456789abcdef0123456789',
      tamanhoBytes: 4980,
      dataHoraImportacao: '2026-08-14T10:35:00-03:00',
      usuarioResponsavel: {
        id: 'user_admin',
        nome: 'Auditor Fiscal do Sistema',
        email: 'auditor@ebitax.com.br'
      },
      organizacaoAdministradoraId: orgId,
      empresaAtivaId: compId,
      empresaAtivaCnpj: compCnpj,
      status: 'Importado',
      errosValidacao: [],
      alertasValidacao: []
    },

    // =========================================================================
    // DOCUMENTO 4: NFS-e — CENÁRIO 4: TOMADA (CONSULTORIA JURÍDICA TRIBUTÁRIA)
    // Empresa Selecionada = Tomador (Despesa / Crédito) — 1 Item
    // =========================================================================
    {
      id: 'doc_nfse_004',
      tipoDocumento: 'NFSE',
      modelo: 'NFS-e',
      numero: '000.009.840',
      serie: 'NFS',
      chaveAcesso: '3550308000009840445556660001220001',
      dataEmissao: '2026-08-13T14:10:00-03:00',
      versaoLeiaute: '2.04',
      periodoReferencia: '08/2026',
      ambiente: 'Produção',
      finalidade: 'Normal',
      tipoOperacao: 'Entrada',
      emitente: {
        tipo: 'EMITENTE',
        cnpjCpf: '44.555.666/0001-22',
        razaoSocial: 'Machado & Associados Advocacia Tributária',
        nomeFantasia: 'Machado Tax Law',
        inscricaoMunicipal: '77889900',
        logradouro: 'Alameda Santos',
        numero: '1800',
        bairro: 'Cerqueira César',
        municipio: 'São Paulo',
        uf: 'SP',
        cep: '01418-102',
        regimeTributario: 'Lucro Real'
      },
      destinatario: {
        tipo: 'DESTINATARIO',
        cnpjCpf: compCnpj,
        razaoSocial: compRazao,
        nomeFantasia: compFantasia,
        inscricaoMunicipal: compInscMun,
        logradouro: compLogradouro,
        numero: compNumero,
        bairro: compBairro,
        municipio: compMun,
        uf: compUf,
        cep: compCep,
        regimeTributario: compRegime
      },
      tomador: {
        tipo: 'TOMADOR',
        cnpjCpf: compCnpj,
        razaoSocial: compRazao,
        nomeFantasia: compFantasia,
        inscricaoMunicipal: compInscMun,
        logradouro: compLogradouro,
        numero: compNumero,
        bairro: compBairro,
        municipio: compMun,
        uf: compUf,
        cep: compCep,
        regimeTributario: compRegime
      },
      naturezaOperacao: 'SERVIÇOS DE CONSULTORIA JURÍDICA E PARECER TRIBUTÁRIO SOBRE A REFORMA EC 132/2023',
      cfopPrincipal: '1933',
      municipioOrigem: 'São Paulo',
      ufOrigem: 'SP',
      municipioDestino: compMun,
      ufDestino: compUf,
      informacoesComplementares: 'Parecer técnico sobre creditamento amplo de CBS e IBS nas aquisições de serviços de tecnologia. ISS 5,00%, PIS 1,65%, COFINS 7,60%, CBS 0,90% e IBS 0,10%.',
      itens: [
        {
          numeroItem: 1,
          codigo: 'PAR-JUR-NAO-CUMUL',
          descricao: 'Parecer Jurídico sobre Não-Cumulatividade Plena do IBS/CBS na LC 214/2025',
          nbs: '1.0201.10.00',
          codigoServico: '17.01.01',
          cfop: '1933',
          unidade: 'PARECER',
          quantidade: 1,
          valorUnitario: 45000.00,
          valorTotal: 45000.00,
          desconto: 0,
          tributacao: {
            issqn: { cst: '01', baseCalculo: 45000.00, aliquota: 5.00, valor: 2250.00 },
            pis: { cst: '01', baseCalculo: 45000.00, aliquota: 1.65, valor: 742.50 },
            cofins: { cst: '01', baseCalculo: 45000.00, aliquota: 7.60, valor: 3420.00 },
            cbs: { cst: '01', baseCalculo: 38587.50, aliquota: 0.90, valorCBS: 347.29 },
            ibs: { cst: '01', baseCalculo: 38587.50, aliquotaTotal: 0.10, valorIBSTotal: 38.59 }
          }
        }
      ],
      totais: {
        valorServicos: 45000.00,
        valorDesconto: 0,
        valorTotalDocumento: 45000.00,
        valorISS: 2250.00,
        valorPIS: 742.50,
        valorCOFINS: 3420.00,
        valorCBS: 347.29,
        valorIBSTotal: 38.59
      },
      arquivoOriginal: `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="2.04">
    <InfNfse Id="NFSE3550308000009840">
      <Numero>9840</Numero>
      <CodigoVerificacao>9840-MACH-ADV-2026</CodigoVerificacao>
      <DataEmissao>2026-08-13T14:10:00-03:00</DataEmissao>
      <Servico>
        <Valores>
          <ValorServicos>45000.00</ValorServicos>
          <ValorPis>742.50</ValorPis>
          <ValorCofins>3420.00</ValorCofins>
          <ValorIss>2250.00</ValorIss>
          <BaseCalculo>45000.00</BaseCalculo>
          <ValorLiquidoNfse>45000.00</ValorLiquidoNfse>
        </Valores>
        <ItemListaServico>17.01</ItemListaServico>
        <Discriminacao>Parecer Juridico sobre Nao-Cumulatividade Plena do IBS/CBS na LC 214/2025.</Discriminacao>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`,
      nomeOriginal: 'NFSe_MachadoAdv_000009840.xml',
      extensao: 'xml',
      hashSha256: 'a7b8c9d0e1f234567890abcdef0123456789abcdef0123456789abcdef012345',
      tamanhoBytes: 5120,
      dataHoraImportacao: '2026-08-13T14:15:00-03:00',
      usuarioResponsavel: {
        id: 'user_admin',
        nome: 'Auditor Fiscal do Sistema',
        email: 'auditor@ebitax.com.br'
      },
      organizacaoAdministradoraId: orgId,
      empresaAtivaId: compId,
      empresaAtivaCnpj: compCnpj,
      status: 'Importado',
      errosValidacao: [],
      alertasValidacao: []
    },

    // =========================================================================
    // DOCUMENTO 5: NFS-e — CENÁRIO 5: PRESTADA COM RETENÇÕES (GRANDE CLIENTE)
    // Empresa Selecionada = Prestador (Receita / Retenções na Fonte) — 1 Item
    // =========================================================================
    {
      id: 'doc_nfse_005',
      tipoDocumento: 'NFSE',
      modelo: 'NFS-e',
      numero: '000.015.420',
      serie: 'NFS',
      chaveAcesso: '3304557000015420384928120001940001',
      dataEmissao: '2026-08-16T11:00:00-03:00',
      versaoLeiaute: '2.04',
      periodoReferencia: '08/2026',
      ambiente: 'Produção',
      finalidade: 'Normal',
      tipoOperacao: 'Saída',
      emitente: {
        tipo: 'EMITENTE',
        cnpjCpf: compCnpj,
        razaoSocial: compRazao,
        nomeFantasia: compFantasia,
        inscricaoMunicipal: compInscMun,
        logradouro: compLogradouro,
        numero: compNumero,
        bairro: compBairro,
        municipio: compMun,
        uf: compUf,
        cep: compCep,
        regimeTributario: compRegime
      },
      tomador: {
        tipo: 'TOMADOR',
        cnpjCpf: '33.000.167/0001-01',
        razaoSocial: 'Petróleo Brasileiro S.A. - Petrobras',
        nomeFantasia: 'Petrobras Matriz',
        inscricaoMunicipal: '00123456',
        logradouro: 'Av. República do Chile',
        numero: '65',
        bairro: 'Centro',
        municipio: 'Rio de Janeiro',
        uf: 'RJ',
        cep: '20031-912',
        regimeTributario: 'Lucro Real'
      },
      naturezaOperacao: 'DESENVOLVIMENTO DE SOFTWARE E AUDITORIA FISCAL COM RETENÇÕES FEDERAIS E MUNICIPAIS',
      cfopPrincipal: '6933',
      municipioOrigem: compMun,
      ufOrigem: compUf,
      municipioDestino: 'Rio de Janeiro',
      ufDestino: 'RJ',
      informacoesComplementares: 'Prestação de serviços com retenções na fonte: IRRF 1.50%, CSLL 1.00%, PIS 0.65%, COFINS 3.00% e ISS retido 5.00%. CBS 0.90% e IBS 0.10% em conformidade com LC 214/2025.',
      itens: [
        {
          numeroItem: 1,
          codigo: 'SAAS-PETRO-CORE',
          descricao: 'Subscrição de Plataforma SaaS de Auditoria Fiscal Automatizada para Refinarias',
          nbs: '1.0101.10.00',
          codigoServico: '01.01.01',
          cfop: '6933',
          unidade: 'MES',
          quantidade: 1,
          valorUnitario: 220000.00,
          valorTotal: 220000.00,
          desconto: 0,
          tributacao: {
            issqn: { cst: '01', baseCalculo: 220000.00, aliquota: 5.00, valor: 11000.00, valorRetencao: 11000.00 },
            pis: { cst: '01', baseCalculo: 220000.00, aliquota: 0.65, valor: 1430.00 },
            cofins: { cst: '01', baseCalculo: 220000.00, aliquota: 3.00, valor: 6600.00 },
            cbs: { cst: '01', baseCalculo: 188870.00, aliquota: 0.90, valorCBS: 1699.83 },
            ibs: { cst: '01', baseCalculo: 188870.00, aliquotaTotal: 0.10, valorIBSTotal: 188.87 }
          }
        }
      ],
      totais: {
        valorServicos: 220000.00,
        valorDesconto: 0,
        valorTotalDocumento: 220000.00,
        valorISS: 11000.00,
        valorPIS: 1430.00,
        valorCOFINS: 6600.00,
        valorCBS: 1699.83,
        valorIBSTotal: 188.87
      },
      arquivoOriginal: `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="2.04">
    <InfNfse Id="NFSE3304557000015420">
      <Numero>15420</Numero>
      <CodigoVerificacao>1542-PETRO-2026-RET</CodigoVerificacao>
      <DataEmissao>2026-08-16T11:00:00-03:00</DataEmissao>
      <Servico>
        <Valores>
          <ValorServicos>220000.00</ValorServicos>
          <ValorPis>1430.00</ValorPis>
          <ValorCofins>6600.00</ValorCofins>
          <ValorIss>11000.00</ValorIss>
          <ValorIssRetido>11000.00</ValorIssRetido>
          <ValorIr>3300.00</ValorIr>
          <ValorCsll>2200.00</ValorCsll>
          <BaseCalculo>220000.00</BaseCalculo>
          <ValorLiquidoNfse>195470.00</ValorLiquidoNfse>
        </Valores>
        <ItemListaServico>01.01</ItemListaServico>
        <Discriminacao>Subscricao de Plataforma SaaS de Auditoria Fiscal Automatizada para Refinarias.</Discriminacao>
      </Servico>
    </InfNfse>
  </Nfse>
</CompNfse>`,
      nomeOriginal: 'NFSe_000015420_Petrobras.xml',
      extensao: 'xml',
      hashSha256: 'f6a7b8c9d0e123456789abcdef0123456789abcdef0123456789abcdef012345',
      tamanhoBytes: 5980,
      dataHoraImportacao: '2026-08-16T11:05:00-03:00',
      usuarioResponsavel: {
        id: 'user_admin',
        nome: 'Auditor Fiscal do Sistema',
        email: 'auditor@ebitax.com.br'
      },
      organizacaoAdministradoraId: orgId,
      empresaAtivaId: compId,
      empresaAtivaCnpj: compCnpj,
      status: 'Importado',
      errosValidacao: [],
      alertasValidacao: []
    }
  ];
}
