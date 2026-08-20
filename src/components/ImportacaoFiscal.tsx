import React, { useState, useRef } from 'react';
import { 
  FileUp, 
  FileSpreadsheet, 
  FileCode2, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  Database, 
  ShieldCheck, 
  FileCheck,
  Loader2,
  AlertTriangle,
  Copy
} from 'lucide-react';
import { CompanyRegistration } from '../types/company';
import { YearPeriod } from '../types/tax';
import { processBatchFiscalFiles } from '../utils/fiscalBatchEngine';
import { BatchImportResult, FiscalDocument } from '../types/fiscalEngine';

interface ImportacaoFiscalProps {
  companyData: CompanyRegistration;
  onNavigateToCadastro: () => void;
  onNavigateToVisualizar?: () => void;
  selectedYear: YearPeriod;
  currentUser?: { id: string; name: string; email: string };
  currentOrgId?: string;
}

export const ImportacaoFiscal: React.FC<ImportacaoFiscalProps> = ({
  companyData,
  onNavigateToCadastro,
  onNavigateToVisualizar,
  selectedYear,
  currentUser = { id: 'usr_default', name: 'Administrador Fiscal', email: 'admin@reformatributaria.gov.br' },
  currentOrgId = 'org_default'
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('xml_nfe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState<{ current: number; total: number; fileName: string } | null>(null);
  const [batchResult, setBatchResult] = useState<BatchImportResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setBatchResult(null);

    try {
      const result = await processBatchFiscalFiles(files, {
        activeCompany: companyData,
        currentUser: {
          id: currentUser.id,
          nome: currentUser.name,
          email: currentUser.email
        },
        currentOrgId: currentOrgId,
        onProgress: (current, total, fileName) => {
          setProcessingProgress({ current, total, fileName });
        }
      });

      setBatchResult(result);
    } catch (err) {
      console.error('Erro no processamento em lote:', err);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Processar pacote oficial de demonstração vinculado à empresa ativa caso usuário clique sem ter arquivo local
  const handleSimulateOfficialImport = async () => {
    setIsProcessing(true);
    setBatchResult(null);

    const cleanCnpj = companyData.cnpj.replace(/\D/g, '') || '12345678000195';

    // Gerar arquivos fiscais oficiais em conformidade com o leiaute
    const sampleNfeXml = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe352608${cleanCnpj.padStart(14, '0')}550010000049211000049218" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00004921</cNF>
        <natOp>Venda de mercadoria adquirida ou recebida de terceiros</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>4921</nNF>
        <dhEmi>${selectedYear}-04-15T14:30:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
        <indFinal>1</indFinal>
        <indPres>1</indPres>
        <procEmi>0</procEmi>
        <verProc>4.00</verProc>
      </ide>
      <emit>
        <CNPJ>${cleanCnpj}</CNPJ>
        <xNome>${companyData.razaoSocial}</xNome>
        <xFant>${companyData.nomeFantasia || companyData.razaoSocial}</xFant>
        <enderEmit>
          <xLgr>Avenida Paulista</xLgr>
          <nro>1000</nro>
          <xBairro>Bela Vista</xBairro>
          <cMun>3550308</cMun>
          <xMun>${companyData.municipio || 'São Paulo'}</xMun>
          <UF>${companyData.uf || 'SP'}</UF>
          <CEP>01310100</CEP>
          <cPais>1058</cPais>
          <xPais>Brasil</xPais>
        </enderEmit>
        <IE>112233445566</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>98765432000198</CNPJ>
        <xNome>Cliente Industrial Parceiro S.A.</xNome>
        <enderDest>
          <xLgr>Rua das Indústrias</xLgr>
          <nro>500</nro>
          <xBairro>Distrito Industrial</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>04571000</CEP>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>998877665544</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>PROD-001</cProd>
          <cEAN>SEM GTIN</cEAN>
          <xProd>Servidor Rack Enterprise Cloud Server 2U</xProd>
          <NCM>84715010</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>2.0000</qCom>
          <vUnCom>18500.00</vUnCom>
          <vProd>37000.00</vProd>
          <uTrib>UN</uTrib>
          <qTrib>2.0000</qTrib>
          <vUnTrib>18500.00</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>37000.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>6660.00</vICMS>
            </ICMS00>
          </ICMS>
          <IPI>
            <cEnq>999</cEnq>
            <IPITrib>
              <CST>50</CST>
              <vBC>37000.00</vBC>
              <pIPI>10.00</pIPI>
              <vIPI>3700.00</vIPI>
            </IPITrib>
          </IPI>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>37000.00</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>610.50</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>37000.00</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>2812.00</vCOFINS>
            </COFINSAliq>
          </COFINS>
          <IBS>
            <CST>01</CST>
            <cClassTrib>01.01.01</cClassTrib>
            <vBC>37000.00</vBC>
            <pIBSEst>0.10</pIBSEst>
            <vIBSEst>37.00</vIBSEst>
            <pIBSMun>0.00</pIBSMun>
            <vIBSMun>0.00</vIBSMun>
            <pIBS>0.10</pIBS>
            <vIBS>37.00</vIBS>
          </IBS>
          <CBS>
            <CST>01</CST>
            <cClassTrib>01.01.01</cClassTrib>
            <vBC>37000.00</vBC>
            <pCBS>0.90</pCBS>
            <vCBS>333.00</vCBS>
          </CBS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>37000.00</vBC>
          <vICMS>6660.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vProd>37000.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>3700.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>610.50</vPIS>
          <vCOFINS>2812.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>40700.00</vNF>
        </ICMSTot>
        <IBSCBSTot>
          <vIBSEst>37.00</vIBSEst>
          <vIBSMun>0.00</vIBSMun>
          <vIBS>37.00</vIBS>
          <vCBS>333.00</vCBS>
        </IBSCBSTot>
      </total>
      <transp>
        <modFrete>0</modFrete>
      </transp>
    </infNFe>
  </NFe>
</nfeProc>`;

    const sampleNfseXml = `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="1.00">
    <InfNfse Id="NFSe_2026_${cleanCnpj}_8821">
      <Numero>8821</Numero>
      <CodigoVerificacao>A8B9C1D2</CodigoVerificacao>
      <DataEmissao>${selectedYear}-05-10T10:00:00-03:00</DataEmissao>
      <PrestadorServico>
        <IdentificacaoPrestador>
          <CpfCnpj>
            <Cnpj>${cleanCnpj}</Cnpj>
          </CpfCnpj>
          <InscricaoMunicipal>88776655</InscricaoMunicipal>
        </IdentificacaoPrestador>
        <RazaoSocial>${companyData.razaoSocial}</RazaoSocial>
      </PrestadorServico>
      <TomadorServico>
        <IdentificacaoTomador>
          <CpfCnpj>
            <Cnpj>55443322000111</Cnpj>
          </CpfCnpj>
        </IdentificacaoTomador>
        <RazaoSocial>Soluções Digitais Brasil Ltda</RazaoSocial>
      </TomadorServico>
      <DeclaracaoPrestacaoServico>
        <InfDeclaracaoPrestacaoServico>
          <Rps>
            <IdentificacaoRps>
              <Numero>8821</Numero>
              <Serie>RPS</Serie>
              <Tipo>1</Tipo>
            </IdentificacaoRps>
          </Rps>
          <Servico>
            <Valores>
              <ValorServicos>25000.00</ValorServicos>
              <ValorDeducoes>0.00</ValorDeducoes>
              <ValorPis>162.50</ValorPis>
              <ValorCofins>750.00</ValorCofins>
              <ValorInss>0.00</ValorInss>
              <ValorIr>375.00</ValorIr>
              <ValorCsll>250.00</ValorCsll>
              <OutrasRetencoes>0.00</OutrasRetencoes>
              <ValTotTributos>1537.50</ValTotTributos>
              <ValorIss>1250.00</ValorIss>
              <Aliquota>5.00</Aliquota>
              <DescontoIncondicionado>0.00</DescontoIncondicionado>
              <DescontoCondicionado>0.00</DescontoCondicionado>
            </Valores>
            <IssRetido>2</IssRetido>
            <ItemListaServico>01.07</ItemListaServico>
            <CodigoCnae>6201501</CodigoCnae>
            <CodigoTributacaoMunicipio>620150100</CodigoTributacaoMunicipio>
            <Discriminacao>Licenciamento e customização de software SaaS em nuvem - Mês 05/2026</Discriminacao>
            <CodigoMunicipio>3550308</CodigoMunicipio>
          </Servico>
        </InfDeclaracaoPrestacaoServico>
      </DeclaracaoPrestacaoServico>
    </InfNfse>
  </Nfse>
</CompNfse>`;

    const sampleSpedTxt = `|0000|018|0|0101${selectedYear}|3101${selectedYear}|${companyData.razaoSocial}|${cleanCnpj}|${companyData.uf || 'SP'}|3550308||A|1|
|0001|0|
|0100|Contador Responsável CRC SP-999999|11122233344|CRC12345|11999998888|contato@contador.com.br|3550308|
|0150|CLI001|Cliente Industrial Parceiro S.A.|1058|98765432000198||998877665544|3550308||Rua das Indústrias|500||Distrito Industrial|
|C001|0|
|C100|0|1|CLI001|55|00|1|4921|352608${cleanCnpj.padStart(14, '0')}550010000049211000049218|1504${selectedYear}|1504${selectedYear}|40700,00|0|0,00|0,00|37000,00|0|0,00|0,00|37000,00|6660,00|0,00|0,00|3700,00|610,50|2812,00|0,00|0,00|
|C170|1|PROD-001|Servidor Rack Enterprise Cloud Server 2U|2,0000|UN|37000,00|0,00|0|000|5102|84715010||37000,00|18,00|6660,00|0,00|0,00|0,00|0|50|999||37000,00|10,00|3700,00|01|37000,00|1,65|||610,50|01|37000,00|7,60|||2812,00||
|C190|000|5102|18,00|37000,00|37000,00|6660,00|0,00|0,00|0,00|3700,00|
|C990|5|
|E001|0|
|E100|0101${selectedYear}|3101${selectedYear}|
|E110|6660,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|0,00|6660,00|0,00|
|E990|4|
|9001|0|
|9999|15|`;

    const sampleFiles = [
      { name: `NFe_Mod55_4921_${selectedYear}.xml`, content: sampleNfeXml },
      { name: `NFSe_Nacional_8821_${selectedYear}.xml`, content: sampleNfseXml },
      { name: `SPED_EFD_ICMS_IPI_01_${selectedYear}.txt`, content: sampleSpedTxt }
    ];

    try {
      const result = await processBatchFiscalFiles(sampleFiles as any, {
        activeCompany: companyData,
        currentUser: {
          id: currentUser.id,
          nome: currentUser.name,
          email: currentUser.email
        },
        currentOrgId: currentOrgId,
        onProgress: (cur, tot, fName) => {
          setProcessingProgress({ current: cur, total: tot, fileName: fName });
        }
      });

      setBatchResult(result);
    } catch (err) {
      console.error('Erro ao importar amostras:', err);
    } finally {
      setIsProcessing(false);
      setProcessingProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        accept=".xml,.txt,.csv,.xlsx,.xls,.zip"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[#059669]">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Importação de Documentos Fiscais</h1>
                <span className="bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  Contexto Cadastral Integrado
                </span>
                <span className="bg-[#00D280]/10 border border-[#00D280]/30 text-[#00D280] text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
                  Ano-Base: {selectedYear}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
                Importação em lote de arquivos fiscais digitais para cruzamento e validação com o <strong className="text-slate-900 font-bold">Cadastro & Dados Central</strong> da empresa <strong className="text-slate-900 font-bold">{companyData.razaoSocial}</strong> ({companyData.cnpj}).
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToCadastro}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer shadow-xs"
          >
            <Database className="w-3.5 h-3.5 text-[#00D280]" />
            <span>Ver Cadastro Mestre</span>
          </button>
        </div>

        {/* Company Active Anchor Box */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Empresa Ativa</div>
            <div className="text-xs font-bold text-slate-900 truncate">{companyData.razaoSocial}</div>
            <div className="text-[10px] text-[#059669] font-mono font-bold">{companyData.cnpj}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Regime Tributário</div>
            <div className="text-xs font-bold text-slate-900">{companyData.regimeTributario}</div>
            <div className="text-[10px] text-slate-500">{companyData.regimeApuracao}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Setor Direcionador</div>
            <div className="text-xs font-bold text-slate-900 truncate">{companyData.setor}</div>
            <div className="text-[10px] text-slate-500">{companyData.tipoOperacao}</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Diretriz de Importação</div>
            <div className="text-xs font-bold text-slate-900">Validação Sem Substituição</div>
            <div className="text-[10px] text-slate-500">Auditoria preservada</div>
          </div>
        </div>
      </div>

      {/* Upload Zone & Document Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Format Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formatos Homologados</h3>
          
          {[
            { id: 'xml_nfe', name: 'XML NF-e / NFC-e', desc: 'Notas fiscais de produtos (Mod. 55 e 65)', icon: FileCode2 },
            { id: 'xml_nfse', name: 'NFS-e (Padrão Nacional)', desc: 'Notas de serviços municipais com NBS', icon: FileCheck },
            { id: 'xml_cte', name: 'CT-e / MDF-e', desc: 'Conhecimentos de transporte de cargas', icon: FileUp },
            { id: 'sped', name: 'SPED EFD ICMS/IPI & EFD Contrib.', desc: 'Escrituração digital completa (Blocos C, D, M)', icon: FileSpreadsheet },
            { id: 'excel_csv', name: 'Planilha Excel / CSV', desc: 'Template estruturado com NCM, CFOP e valores', icon: FileSpreadsheet },
          ].map((fmt) => {
            const Icon = fmt.icon;
            const isSel = selectedFormat === fmt.id;
            return (
              <div
                key={fmt.id}
                onClick={() => setSelectedFormat(fmt.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSel
                    ? 'bg-emerald-50/50 border-[#00D280] shadow-xs ring-1 ring-[#00D280]/30'
                    : 'bg-white border-slate-200 hover:border-[#00D280] hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${isSel ? 'bg-emerald-100 text-[#059669]' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${isSel ? 'text-slate-900' : 'text-slate-700'}`}>{fmt.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{fmt.desc}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Drag & Drop Upload Zone */}
        <div className="lg:col-span-2 space-y-4">
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-white border-2 border-dashed rounded-3xl p-10 text-center space-y-4 transition-all shadow-xs ${
              isDragging ? 'border-[#00D280] bg-emerald-50/30 ring-4 ring-[#00D280]/20' : 'border-slate-200 hover:border-[#00D280]'
            }`}
          >
            <div className="mx-auto w-16 h-16 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center text-[#059669]">
              {isProcessing ? (
                <Loader2 className="w-8 h-8 animate-spin text-[#00D280]" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-slate-900">
                {isDragging ? 'Solte os arquivos fiscais aqui para processamento' : 'Arraste os arquivos fiscais ou selecione no seu computador'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Suporte a múltiplos arquivos .XML, .TXT (SPED), .XLSX, .CSV e pacotes compactados .ZIP
              </p>
            </div>

            {isProcessing && processingProgress && (
              <div className="max-w-md mx-auto space-y-2 py-2">
                <div className="flex justify-between text-xs font-mono font-bold text-slate-700">
                  <span>Processando arquivo {processingProgress.current} de {processingProgress.total}</span>
                  <span className="truncate max-w-[200px] text-slate-500">{processingProgress.fileName}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div 
                    className="bg-[#00D280] h-full transition-all duration-200 rounded-full"
                    style={{ width: `${(processingProgress.current / processingProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-6 py-3 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando e Validando...</span>
                  </>
                ) : (
                  <span>Selecionar Arquivos</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleSimulateOfficialImport}
                disabled={isProcessing}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
                title="Carregar lote oficial homologado de NF-e, NFS-e e SPED para a empresa ativa"
              >
                Carregar Lote de Teste Homologado
              </button>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-center space-x-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00D280]" />
              <span>Validação em conformidade com as regras da EC 132/2023 e LC 214/2025</span>
            </div>
          </div>

          {/* Real Process Result Banner */}
          {batchResult && (
            <div className={`p-5 rounded-2xl border text-xs space-y-3 transition-all ${
              batchResult.totalRejeitados > 0 && batchResult.totalImportados === 0
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : batchResult.totalDivergenciaCadastro > 0
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-start space-x-3">
                {batchResult.totalRejeitados > 0 && batchResult.totalImportados === 0 ? (
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                ) : batchResult.totalDivergenciaCadastro > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-[#059669] flex-shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-sm font-black text-slate-900">
                      Resultado do Motor de Importação & Conciliação:
                    </strong>
                    <span className="text-[11px] font-mono font-bold bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                      {batchResult.totalArquivos} {batchResult.totalArquivos === 1 ? 'arquivo processado' : 'arquivos processados'}
                    </span>
                  </div>

                  <p className="text-slate-700 text-xs leading-relaxed">
                    {batchResult.totalImportados + batchResult.totalComAlertas} documento(s) fiscal(is) validado(s) e integrados com sucesso para a empresa <strong className="text-slate-900 font-bold">{companyData.razaoSocial}</strong> ({companyData.cnpj}). Os dados foram estruturados e armazenados para auditoria e futura visualização.
                  </p>

                  {/* Badges de Status do Lote */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {batchResult.totalImportados > 0 && (
                      <span className="bg-emerald-100 text-[#059669] font-bold px-2 py-0.5 rounded-md text-[11px] flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{batchResult.totalImportados} Importados com Sucesso</span>
                      </span>
                    )}

                    {batchResult.totalComAlertas > 0 && (
                      <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                        {batchResult.totalComAlertas} Com Alertas Não-Bloqueantes
                      </span>
                    )}

                    {batchResult.totalDuplicados > 0 && (
                      <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded-md text-[11px] flex items-center space-x-1">
                        <Copy className="w-3 h-3" />
                        <span>{batchResult.totalDuplicados} Duplicados (Não Sobrescritos)</span>
                      </span>
                    )}

                    {batchResult.totalDivergenciaCadastro > 0 && (
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-md text-[11px] flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{batchResult.totalDivergenciaCadastro} Divergência de Cadastro (Preservado)</span>
                      </span>
                    )}

                    {batchResult.totalRejeitados > 0 && (
                      <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md text-[11px]">
                        {batchResult.totalRejeitados} Rejeitados por Schema Inválido
                      </span>
                    )}
                  </div>

                  {onNavigateToVisualizar && (batchResult.totalImportados > 0 || batchResult.totalComAlertas > 0) && (
                    <div className="pt-3 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={onNavigateToVisualizar}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <span>Visualizar Documento Fiscal</span>
                        <CheckCircle2 className="w-4 h-4 text-[#00D280]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
