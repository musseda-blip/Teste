import { generateStrategicReportPDF } from './pdfReportGenerator';
import { ExecutiveKPIs, YearPeriod, SensitivityParams } from '../types/tax';
import { CompanyRegistration } from '../types/company';
import { AssessmentStep, SavedSimulation } from '../types/simulation';
import { WhiteLabelConfig } from '../types/auth';

interface ExportPDFParams {
  company: CompanyRegistration;
  kpis: ExecutiveKPIs;
  selectedYear: YearPeriod;
  sensitivityParams?: SensitivityParams;
  savedSimulation?: SavedSimulation;
  comparisonSimulation?: SavedSimulation;
  assessmentSteps?: AssessmentStep[];
  whiteLabel?: WhiteLabelConfig;
}

export const generateExecutiveReportPDF = ({
  company,
  kpis,
  selectedYear,
  sensitivityParams,
  savedSimulation,
  comparisonSimulation,
  assessmentSteps,
  whiteLabel,
}: ExportPDFParams) => {
  const defaultParams: SensitivityParams = sensitivityParams || {
    precoVendaAdjPercent: 0,
    custoInsumoAdjPercent: 0,
    repasseTributarioPercent: 100,
    aproveitamentoCreditoInsumosPercent: 100,
    aliqCbsEstimada: 8.8,
    aliqIbsEstimada: 17.7,
    aliqImpostoSeletivoEstimada: 5.0,
    mixProdutos: 'Atual',
    segmento: company.setor,
    anoSimulacao: selectedYear,
  };

  const sims = [];
  if (savedSimulation) sims.push(savedSimulation);
  if (comparisonSimulation) sims.push(comparisonSimulation);

  generateStrategicReportPDF({
    companyData: company,
    kpis,
    selectedYear,
    sensitivityParams: defaultParams,
    savedSimulations: sims,
    assessmentSteps: assessmentSteps || [],
    whiteLabel,
  });
};
