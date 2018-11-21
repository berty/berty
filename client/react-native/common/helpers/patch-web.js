import { NativeModules, Platform } from 'react-native'

if (Platform.OS === 'web') {
  const CoreModule = {
    initialize: async () => {},
    listAccounts: async () => 'berty-daemon',
    start: async () => {},
    restart: async () => console.warn('not implemented in web'),
    dropDatabase: async () => console.warn('not implemented in web'),
    // TODO: remove circle dependencies with containers to implem directly panic here
    panic: async () => console.warn('not implemented in web'),
    throwException: () => {
      throw new Error('thrown exception')
    },
    getPort: async () => {
      const url = new URL(window.location.href)
      return url.searchParams.get('gql-port') || '8700'
    },
    isBotRunning: async () => console.warn('not implemented in web'),
    startBot: async () => console.warn('not implemented in web'),
    stopBot: async () => console.warn('not implemented in web'),
    getNetworkConfig: async () => console.warn('not implemented in web'),
    updateNetworkConfig: async () => console.warn('not implemented in web'),
  }
  NativeModules.CoreModule = CoreModule
}
