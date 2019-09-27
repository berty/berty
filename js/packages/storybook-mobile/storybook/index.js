import { AppRegistry } from 'react-native'
import { getStorybookUI, configure, storiesOf } from '@storybook/react-native'
import bertyStories from '@berty-tech/berty-storybook'
import sharedStories from '@berty-tech/shared-storybook'

import './rn-addons'

// import stories
configure(
  () => [bertyStories, sharedStories].forEach((s) => s({ storiesOf })),
  module
)

// Refer to https://github.com/storybookjs/storybook/tree/master/app/react-native#start-command-parameters
// To find allowed options for getStorybookUI
const StorybookUIRoot = getStorybookUI({})

// If you are using React Native vanilla write your app name here.
// If you use Expo you can safely remove this line.
AppRegistry.registerComponent('BertyMobileStorybook', () => StorybookUIRoot)

export default StorybookUIRoot
