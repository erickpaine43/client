import en from '../messages/en.json';
import es from '../messages/es.json';

const messagesByLocale: Record<string, any> = {en, es};

const nextIntl = {
  defaultLocale: 'en',
  messagesByLocale,
};

export default nextIntl;
