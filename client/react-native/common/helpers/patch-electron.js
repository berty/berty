import { NativeModules, Platform } from 'react-native'
import RNDeviceInfo from 'react-native-device-info'

if (Platform.OS === 'web' &&
  window.navigator && window.navigator.userAgent && window.navigator.userAgent.toLowerCase().indexOf('electron') !== -1
) {
  Platform.Desktop = true
  const CoreModule = {}

  RNDeviceInfo.getBundleId = () => {
    return 'chat.berty.macos'
  }

  let asyncActionQueue = []

  let bridgedOpAction = (name, args) => new Promise(resolve => asyncActionQueue.push([name, args, resolve]))

  let bridgedOp = (name) => (args) => bridgedOpAction(name, args)

  document.addEventListener('astilectron-ready',  () => {
    bridgedOpAction = (name, args) => new Promise(resolve => {
      window.astilectron.sendMessage({
        name: name,
        payload: args,
      }, (response) => {
        resolve(response && response.payload)
      })
    })

    for (let [name, args, resolve] of asyncActionQueue) {
      bridgedOpAction(name, args).then(resolve)
    }

    asyncActionQueue = []
  })

  const ops = [
    'initialize',
    'listAccounts',
    'start',
    'restart',
    'dropDatabase',
    'panic',
    'throwException',
    'getPort',
    'isBotRunning',
    'startBot',
    'stopBot',
    'getNetworkConfig',
    'updateNetworkConfig',
    'setCurrentRoute',
    'getLocalGRPCInfos',
    'openURL',
    'installUpdate',
  ]

  for (let op of ops) {
    CoreModule[op] = bridgedOp(op)
  }

  CoreModule.throwException = () => {
    throw new Error('thrown exception')
  }
  window.CoreModule = CoreModule

  NativeModules.CoreModule = CoreModule

  NativeModules.RNLanguages = {}
}
