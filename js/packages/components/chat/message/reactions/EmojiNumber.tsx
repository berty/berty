import React from 'react'
import { StyleProp, TextStyle, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

export const EmojiNumber: React.FC<{ count: number; style: StyleProp<TextStyle> }> = ({
	count,
	style,
}) => (
	<View>
		<UnifiedText style={style}>{count}</UnifiedText>
	</View>
)
