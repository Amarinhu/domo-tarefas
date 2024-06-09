import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'domo.tarefas',
  appName: 'domo-tarefas',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
