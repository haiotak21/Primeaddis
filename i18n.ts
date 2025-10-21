import {getRequestConfig} from 'next-intl/server';
import messages from './messages.json';

const SUPPORTED_LOCALES = ['en', 'am'] as const;
type AppLocale = typeof SUPPORTED_LOCALES[number];

export default getRequestConfig(async ({locale}) => {
  const current = locale ?? 'en';
  const loc: AppLocale = (SUPPORTED_LOCALES as readonly string[]).includes(current)
    ? (current as AppLocale)
    : 'en';

  return {
    locale: loc,
    messages: (messages as Record<AppLocale, any>)[loc]
  };
});
