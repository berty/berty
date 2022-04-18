import React from 'react'
import { View, ViewToken } from 'react-native'
import moment from 'moment'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { timeFormat } from '../helpers'
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

export const updateStickyDate: (
	setStickyDate: (date: number) => void,
) => (info: { viewableItems: ViewToken[] }) => void =
	(setStickyDate: (date: number) => void) =>
	({ viewableItems }) => {
		if (viewableItems && viewableItems.length) {
			const minDate = viewableItems[viewableItems.length - 1]?.section?.title
			if (minDate) {
				setStickyDate(moment(minDate, 'DD/MM/YYYY').unix() * 1000)
			}
		}
	}
