import React from 'react'
import { View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { timeFormat } from '@berty/utils/convert/time'

import { UnifiedText } from '../shared-components/UnifiedText'

//
// DateChat
//

// Types
type ChatDateProps = {
	date: number
}

// Styles
const useStylesChatDate = () => {
	const { padding, text } = useStyles()
	return {
		date: [padding.horizontal.scale(8), padding.vertical.scale(2)],
		dateText: [text.size.small, text.align.center],
	}
}

export const ChatDate: React.FC<ChatDateProps> = React.memo(({ date }) => {
	const _styles = useStylesChatDate()
	const { border, row } = useStyles()
	const colors = useThemeColor()
	const backgroundColor = colors['input-background']
	const textColor = colors['secondary-text']
	return (
		<View style={[row.item.justify, border.radius.medium, _styles.date, { backgroundColor }]}>
			<UnifiedText style={[_styles.dateText, { color: textColor }]}>
				{timeFormat.fmtTimestamp2(date)}
			</UnifiedText>
		</View>
	)
})
