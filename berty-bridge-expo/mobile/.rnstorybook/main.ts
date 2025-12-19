import type { StorybookConfig } from '@storybook/react-native';
// berty-bridge-expo/mobile/src/screens/settings/Settings.stories.tsx
const main: StorybookConfig = {
  stories: ['./stories/**/*.stories.?(ts|tsx|js|jsx)', 
    '../src/**/*.stories.?(ts|tsx|js|jsx)'],
  addons: ['@storybook/addon-ondevice-controls', '@storybook/addon-ondevice-actions'],
};


export default main;
