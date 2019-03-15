import { Linking } from 'react-native';

export const openURL = url => {
  if (url) {
    Linking.openURL(url)
  }
}
