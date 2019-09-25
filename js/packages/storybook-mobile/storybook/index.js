import { AppRegistry } from 'react-native'
import { getStorybookUI, configure, storiesOf } from '@storybook/react-native'
import stories from '@berty-tech/berty-storybook'

import './rn-addons'

// import stories
configure(() => {
  stories({ storiesOf })
}, module)

// Refer to https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI({})

// If you are using React Native vanilla write your app name here.
// If you use Expo you can safely remove this line.
AppRegistry.registerComponent('BertyMobileStorybook', () => StorybookUIRoot)

export default StorybookUIRoot
