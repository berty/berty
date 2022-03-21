import React from 'react'

import { Text } from '@ui-kitten/components'
import moment from 'moment'
import { Animated, Easing, View, ViewToken } from 'react-native'

import { useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

import { timeFormat } from '../helpers'

//
// ChatFooter => Textinput for type message
//

const aDuration = 200

// create interpolations
export const createAnimationInterpolation = (
	value: Animated.Value,
	outputRange: number[],
	inputRange?: number[],
) => {
	return value.interpolate({
		inputRange: inputRange || [0, 1],
		outputRange,
	})
}

// create animations
export const createAnimationTiming = (
	value: Animated.Value,
	toValue:
		| number
		| Animated.Value
		| Animated.ValueXY
		| { x: number; y: number }
		| Animated.AnimatedInterpolation,
	duration?: number,
) => {
	return Animated.timing(value, {
		toValue,
		duration: duration || aDuration,
		easing: Easing.linear,
		useNativeDriver: false,
	})
}

//
// DateChat
//

// Types
type ChatDateProps = {
	date: number
}

// Styles
const useStylesChatDate = () => {
	const [{ padding, text }] = useStyles()
	return {
		date: [padding.horizontal.scale(8), padding.vertical.scale(2)],
		dateText: [text.size.small, text.align.center],
	}
}

export const ChatDate: React.FC<ChatDateProps> = React.memo(({ date }) => {
	const _styles = useStylesChatDate()
	const [{ border, row }] = useStyles()
	const colors = useThemeColor()
	const backgroundColor = colors['input-background']
	const textColor = colors['secondary-text']
	return (
		<View style={[row.item.justify, border.radius.medium, _styles.date, { backgroundColor }]}>
			<Text style={[_styles.dateText, { color: textColor }]}>{timeFormat.fmtTimestamp2(date)}</Text>
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
