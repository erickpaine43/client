import type { Preview } from '@storybook/nextjs'
import nextIntl from './next-intl';
import '@/app/[locale]/globals.css';

const preview: Preview = {
  initialGlobals: {
        locale: 'en',
        locales: {
            en: 'English',
            es: 'Español',
        },
    },
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    nextIntl,
  },
};

export default preview;
