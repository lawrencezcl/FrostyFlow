import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Space } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const LanguageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LanguageLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  @media (max-width: 768px) {
    display: none;
  }
`;

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' }
];

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const customSelectStyle = {
    minWidth: 100,
  };

  const dropdownRender = (menu: React.ReactElement) => (
    <div>
      {menu}
    </div>
  );

  return (
    <LanguageContainer>
      <LanguageLabel>
        <GlobalOutlined />
      </LanguageLabel>
      <Select
        value={currentLanguage.code}
        onChange={handleLanguageChange}
        style={customSelectStyle}
        dropdownRender={dropdownRender}
        size="middle"
        variant="borderless"
      >
        {languages.map((language) => (
          <Select.Option key={language.code} value={language.code}>
            <Space>
              <span>{language.flag}</span>
              <span>{language.nativeName}</span>
            </Space>
          </Select.Option>
        ))}
      </Select>
    </LanguageContainer>
  );
};

export default LanguageSwitcher;