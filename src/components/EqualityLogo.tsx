import React from 'react';
import { SimuladorReformaLogo } from './SimuladorReformaLogo';

interface EqualityLogoProps {
  variant?: 'dark' | 'light' | 'full-color';
  showSubtitle?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const EqualityLogo: React.FC<EqualityLogoProps> = (props) => {
  return <SimuladorReformaLogo {...props} />;
};
