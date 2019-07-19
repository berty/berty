import { NativeModules } from 'react-native'

const { CoreModule } = NativeModules

export const openURL = url => {
  if (url) {
    CoreModule.openURL(url)
  }
}
