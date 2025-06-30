import { Activity, Clock } from 'lucide-react';
import { formatDateTime } from '../utils';
import logo from '/logo.svg';

interface HeaderProps {
  lastUpdated: Date;
}

export function Header({ lastUpdated }: HeaderProps) {
  return (
    <header className="bg-dark-surface border-b border-dark-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-accent-purple to-accent-purple-light rounded-lg shadow-glow">
              <img src={logo} alt="SP500 Predictor Logo" className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">SP500 Predictor</h1>
              <p className="text-sm text-dark-muted">Análisis Algorítmico Avanzado</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 text-dark-muted">
              <Activity className="w-4 h-4" />
              <span className="text-sm">Análisis en Vivo</span>
              <div className="w-2 h-2 bg-accent-green rounded-full animate-pulse"></div>
            </div>
            
            <div className="flex items-center space-x-2 text-dark-muted">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Última actualización: {formatDateTime(lastUpdated)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
