import { getStorybookUI } from '@storybook/react-native'

import './storybook.requires'

const StorybookUIRoot = getStorybookUI({
	initialSelection: undefined,
	shouldPersistSelection: false,
})

export default StorybookUIRoot
