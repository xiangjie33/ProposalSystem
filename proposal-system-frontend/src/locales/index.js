import zhCN from './zh-CN';
import enUS from './en-US';

const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

let currentLocale = localStorage.getItem('locale') || 'zh-CN';

export const setLocale = (locale) => {
  currentLocale = locale;
  localStorage.setItem('locale', locale);
};

export const getLocale = () => currentLocale;

export const t = (key) => {
  const keys = key.split('.');
  let value = locales[currentLocale];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

export const formatMessage = (key, params = {}) => {
  let message = t(key);
  Object.keys(params).forEach(param => {
    message = message.replace(`{${param}}`, params[param]);
  });
  return message;
};

export default locales;
