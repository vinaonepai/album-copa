import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'br.com.albumcopa.app',
  appName: 'Album Copa',
  webDir: 'dist',
  plugins: {
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      backgroundColor: '#111827',
      style: 'DARK',
    },
  },
};

export default config;
