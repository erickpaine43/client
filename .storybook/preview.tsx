import type { Preview } from '@storybook/nextjs'
import nextIntl from './next-intl';
import '@/app/[locale]/globals.css';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { SidebarProvider } from '../components/ui/sidebar';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const preview: Preview = {
  initialGlobals: {
    locale: 'en',
    locales: {
      en: 'English',
      es: 'Español',
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <SidebarProvider defaultOpen={true}>
            <Story />
          </SidebarProvider>
        </AuthProvider>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true, // IMPORTANTE para Next 13/14/15 con next/navigation
      navigation: {
        pathname: "/dashboard",
        query: {},
      },
    },
    nextIntl,
  },
};

export default preview;
