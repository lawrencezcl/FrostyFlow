import styled, { createGlobalStyle } from 'styled-components';
import { Theme } from './theme';

export const GlobalStyle = createGlobalStyle<{ theme: Theme }>`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text.primary};
    transition: background-color ${({ theme }) => theme.animations.normal} ease,
                color ${({ theme }) => theme.animations.normal} ease;
    min-height: 100vh;
  }

  code {
    font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
  }

  /* 滚动条样式 */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radius.small};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.borderHover};
  }

  /* 链接样式 */
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.animations.fast} ease;

    &:hover {
      color: ${({ theme }) => theme.colors.primaryHover};
    }
  }

  /* 输入框焦点样式 */
  input:focus,
  textarea:focus,
  select:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}40;
  }

  /* 禁用文本选择在按钮上 */
  button {
    user-select: none;
  }

  /* 响应式字体大小 */
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    html {
      font-size: 14px;
    }
  }
`;

// 通用容器组件
export const Container = styled.div<{ maxWidth?: string }>`
  width: 100%;
  max-width: ${({ maxWidth }) => maxWidth || '1200px'};
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`;

// 卡片组件
export const Card = styled.div<{ 
  padding?: string; 
  hover?: boolean;
  gradient?: boolean;
}>`
  background: ${({ theme, gradient }) => 
    gradient ? theme.colors.gradient.primary : theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.large};
  padding: ${({ padding, theme }) => padding || theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.small};
  transition: all ${({ theme }) => theme.animations.normal} ease;

  ${({ hover, theme }) =>
    hover &&
    `
    &:hover {
      border-color: ${theme.colors.borderHover};
      box-shadow: ${theme.shadows.medium};
      transform: translateY(-2px);
    }
  `}
`;

// 按钮组件
export const Button = styled.button<{
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.radius.medium};
  font-weight: 600;
  cursor: pointer;
  transition: all ${({ theme }) => theme.animations.fast} ease;
  text-decoration: none;
  font-family: inherit;
  position: relative;
  overflow: hidden;

  /* 尺寸 */
  ${({ size, theme }) => {
    switch (size) {
      case 'small':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: 14px;
          height: 36px;
        `;
      case 'large':
        return `
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: 16px;
          height: 48px;
        `;
      default:
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
          font-size: 15px;
          height: 40px;
        `;
    }
  }}

  /* 变体样式 */
  ${({ variant, theme }) => {
    switch (variant) {
      case 'secondary':
        return `
          background: ${theme.colors.secondary};
          color: ${theme.colors.text.inverse};
          &:hover:not(:disabled) {
            background: ${theme.colors.secondary}E6;
            transform: translateY(-1px);
          }
        `;
      case 'outline':
        return `
          background: transparent;
          color: ${theme.colors.primary};
          border: 1px solid ${theme.colors.primary};
          &:hover:not(:disabled) {
            background: ${theme.colors.primary}10;
            border-color: ${theme.colors.primaryHover};
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${theme.colors.text.primary};
          &:hover:not(:disabled) {
            background: ${theme.colors.surfaceHover};
          }
        `;
      default:
        return `
          background: ${theme.colors.gradient.primary};
          color: ${theme.colors.text.inverse};
          &:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: ${theme.shadows.glow};
          }
        `;
    }
  }}

  /* 宽度 */
  ${({ fullWidth }) => fullWidth && 'width: 100%;'}

  /* 禁用状态 */
  ${({ disabled, theme }) =>
    disabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
    &:hover {
      transform: none;
      box-shadow: none;
    }
  `}

  /* 波纹效果 */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:active::before {
    width: 300px;
    height: 300px;
  }
`;

// 输入框组件
export const Input = styled.input<{ error?: boolean }>`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme, error }) => error ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.medium};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 15px;
  font-family: inherit;
  transition: all ${({ theme }) => theme.animations.fast} ease;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderHover};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 徽章组件
export const Badge = styled.span<{ variant?: 'success' | 'warning' | 'error' | 'info' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.radius.small};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${({ variant, theme }) => {
    switch (variant) {
      case 'success':
        return `
          background: ${theme.colors.success}20;
          color: ${theme.colors.success};
        `;
      case 'warning':
        return `
          background: ${theme.colors.warning}20;
          color: ${theme.colors.warning};
        `;
      case 'error':
        return `
          background: ${theme.colors.error}20;
          color: ${theme.colors.error};
        `;
      case 'info':
        return `
          background: ${theme.colors.info}20;
          color: ${theme.colors.info};
        `;
      default:
        return `
          background: ${theme.colors.primary}20;
          color: ${theme.colors.primary};
        `;
    }
  }}
`;

// 加载器组件
export const Spinner = styled.div<{ size?: number }>`
  width: ${({ size }) => size || 20}px;
  height: ${({ size }) => size || 20}px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-top: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 网格布局
export const Grid = styled.div<{ columns?: number; gap?: string }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns || 1}, 1fr);
  gap: ${({ gap, theme }) => gap || theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
  }
`;

// Flex布局
export const Flex = styled.div<{
  direction?: 'row' | 'column';
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  gap?: string;
  wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${({ direction }) => direction || 'row'};
  align-items: ${({ align }) => align || 'center'};
  justify-content: ${({ justify }) => justify || 'flex-start'};
  gap: ${({ gap, theme }) => gap || theme.spacing.sm};
  ${({ wrap }) => wrap && 'flex-wrap: wrap;'}
`;

// 文本组件
export const Text = styled.span<{
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse';
}>`
  ${({ size }) => {
    switch (size) {
      case 'xs': return 'font-size: 12px;';
      case 'sm': return 'font-size: 14px;';
      case 'md': return 'font-size: 16px;';
      case 'lg': return 'font-size: 18px;';
      case 'xl': return 'font-size: 24px;';
      default: return 'font-size: 15px;';
    }
  }}

  ${({ weight }) => {
    switch (weight) {
      case 'medium': return 'font-weight: 500;';
      case 'semibold': return 'font-weight: 600;';
      case 'bold': return 'font-weight: 700;';
      default: return 'font-weight: 400;';
    }
  }}

  ${({ color, theme }) => {
    switch (color) {
      case 'secondary': return `color: ${theme.colors.text.secondary};`;
      case 'tertiary': return `color: ${theme.colors.text.tertiary};`;
      case 'inverse': return `color: ${theme.colors.text.inverse};`;
      default: return `color: ${theme.colors.text.primary};`;
    }
  }}
`;