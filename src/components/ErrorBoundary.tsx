import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary captured runtime error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#EEF2F3] flex items-center justify-center p-6 text-[#26343A]">
          <div className="bg-white border border-[#CBD3D6] rounded-2xl p-8 max-w-xl w-full shadow-xl space-y-6">
            <div className="flex items-center space-x-3 text-[#C9571D]">
              <div className="p-3 bg-[#FFF8F5] border border-[#F8D2C5] rounded-xl">
                <AlertTriangle className="w-8 h-8 text-[#C9571D]" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#063B4C] font-serif">Ocorreu um erro no módulo</h1>
                <p className="text-xs text-[#5C6F75]">O EBITax Engine capturou a exceção com segurança.</p>
              </div>
            </div>

            <div className="bg-[#F8FAFA] p-4 rounded-xl border border-[#CBD3D6] text-xs font-mono text-[#063B4C] overflow-x-auto max-h-48">
              <p className="font-bold text-[#C9571D] mb-1">
                {this.state.error?.name || 'Erro'}: {this.state.error?.message || 'Erro inesperado'}
              </p>
              {this.state.error?.stack && (
                <pre className="text-[10px] text-[#5C6F75] whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              )}
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={this.handleReset}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#063B4C] hover:bg-[#075A70] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Aplicação</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
