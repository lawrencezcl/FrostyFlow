export interface Theme {
  colors: {
    primary: string;
    primaryHover: string;
    secondary: string;
    background: string;
    surface: string;
    surfaceHover: string;
    border: string;
    borderHover: string;
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
    };
    success: string;
    warning: string;
    error: string;
    info: string;
    gradient: {
      primary: string;
      secondary: string;
    };
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
    glow: string;
  };
  radius: {
    small: string;
    medium: string;
    large: string;
    xl: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
}

export const lightTheme: Theme = {
  colors: {
    primary: '#FF007A',
    primaryHover: '#E5006D',
    secondary: '#7928CA',
    background: '#FFFFFF',
    surface: '#F7F8FA',
    surfaceHover: '#EDEEF2',
    border: '#E1E8ED',
    borderHover: '#C3CFD9',
    text: {
      primary: '#0D111C',
      secondary: '#40444F',
      tertiary: '#888D9B',
      inverse: '#FFFFFF',
    },
    success: '#27AE60',
    warning: '#FF8F00',
    error: '#FD4040',
    info: '#2172E5',
    gradient: {
      primary: 'linear-gradient(135deg, #FF007A 0%, #7928CA 100%)',
      secondary: 'linear-gradient(135deg, #2172E5 0%, #5A67D8 100%)',
    },
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.15)',
    large: '0 8px 32px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(255, 0, 122, 0.3)',
  },
  radius: {
    small: '8px',
    medium: '12px',
    large: '16px',
    xl: '20px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
  },
  animations: {
    fast: '0.15s',
    normal: '0.25s',
    slow: '0.35s',
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: '#0D111C',
    surface: '#1A1D2E',
    surfaceHover: '#252A41',
    border: '#2C2F36',
    borderHover: '#40444F',
    text: {
      primary: '#FFFFFF',
      secondary: '#C3C5CB',
      tertiary: '#888D9B',
      inverse: '#0D111C',
    },
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.3)',
    medium: '0 4px 12px rgba(0, 0, 0, 0.25)',
    large: '0 8px 32px rgba(0, 0, 0, 0.2)',
    glow: '0 0 20px rgba(255, 0, 122, 0.4)',
  },
};