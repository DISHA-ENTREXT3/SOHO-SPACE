
import React, { ErrorInfo, ReactNode } from 'react';
import { MonitoringService } from '../services/monitoringService';
import { RocketLaunchIcon, ShieldCheckIcon } from './Icons';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    MonitoringService.incrementCrashCount();
    MonitoringService.reportBug(error, errorInfo.componentStack || '');
  }

  handleRevert = () => {
    MonitoringService.revertToStable();
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isCritical = MonitoringService.shouldRevert();

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-gray-800 border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-in">
            <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
               <RocketLaunchIcon className="h-10 w-10 text-rose-500 rotate-180" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Something went wrong
            </h1>
            
            <p className="text-gray-400 mb-8">
              {isCritical 
                ? "The application has crashed multiple times. We recommend reverting to the last stable configuration." 
                : "A technical error occurred. Our team has been notified and we are fixing it immediately."}
            </p>

            <div className="space-y-4">
                <button
                    onClick={this.handleReload}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                >
                    Try Refreshing
                </button>
                
                {isCritical && (
                    <button
                        onClick={this.handleRevert}
                        className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-gray-200 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                        <ShieldCheckIcon className="h-5 w-5" />
                        Revert to Stable Version
                    </button>
                )}
            </div>

            <p className="mt-8 text-xs text-gray-500 uppercase tracking-widest font-bold">
               Error reported to team • Reference: {Date.now().toString(36).toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
