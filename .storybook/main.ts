import type { StorybookConfig } from '@storybook/nextjs';
import path from 'path';

const config: StorybookConfig = {
  "stories": [
    "../**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    'storybook-next-intl',
    '@storybook/addon-jest'
  ],
  "framework": {
    "name": "@storybook/nextjs",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ],
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, '../'),
      };
    }
    return config;
  }
};
export default config;
