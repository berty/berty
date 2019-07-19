import { Dimensions } from 'react-native'

const window = Dimensions.get('window')

const screen = {
  dimensions: { width: window.width, height: window.height },
  orientation: window.width < window.height ? 'portrait' : 'landscape',
}

export default screen
