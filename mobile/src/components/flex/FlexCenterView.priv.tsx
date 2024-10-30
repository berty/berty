import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'

export const FlexCenterViewPriv: React.FC = ({ children }) => {
	const { flex } = useStyles()

	return <View style={[flex.tiny, flex.align.center, flex.justify.center]}>{children}</View>
}
