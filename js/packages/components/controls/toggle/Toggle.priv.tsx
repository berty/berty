import { Icon } from '@ui-kitten/components'
import React, { useEffect } from 'react'
import { TouchableOpacity, Animated } from 'react-native'

import { ToggleProps } from './interfaces'

const TOGGLE_WIDTH = 50
const CIRCLE_WIDTH = 25
const BORDER_RADIUS_WIDTH = 1
const CIRCLE_RIGHT_POSITION = TOGGLE_WIDTH - CIRCLE_WIDTH - BORDER_RADIUS_WIDTH * 2

interface TogglePrivProps extends ToggleProps {
	styleColors: {
		circleBackground: string
		toggleBackgroundActive: string
		toggleBackgroundInactive: string
	}
}

export const TogglePriv: React.FC<TogglePrivProps> = ({
	checked = false,
	onChange,
	styleColors,
}) => {
	const circleLeftPositionAnimation = React.useRef(
		new Animated.Value(checked ? CIRCLE_RIGHT_POSITION : 0),
	).current
	const checkIconOpacityAnimation = React.useRef(new Animated.Value(checked ? 1 : 0)).current

	useEffect(() => {
		Animated.parallel([
			Animated.timing(circleLeftPositionAnimation, {
				toValue: !checked ? 0 : CIRCLE_RIGHT_POSITION,
				duration: 200,
				useNativeDriver: false,
			}),
			Animated.timing(checkIconOpacityAnimation, {
				toValue: !checked ? 0 : 1,
				duration: 100,
				useNativeDriver: false,
			}),
		]).start()
	}, [checked, checkIconOpacityAnimation, circleLeftPositionAnimation])

	return (
		<TouchableOpacity
			onPress={() => onChange?.(!checked)}
			style={{
				height: CIRCLE_WIDTH + BORDER_RADIUS_WIDTH * 2,
				width: TOGGLE_WIDTH,
				borderRadius: 30,
				backgroundColor:
					styleColors[checked ? 'toggleBackgroundActive' : 'toggleBackgroundInactive'],
				borderWidth: BORDER_RADIUS_WIDTH,
				borderColor: styleColors.toggleBackgroundActive,
			}}
		>
			<Animated.View
				style={{
					height: CIRCLE_WIDTH,
					width: CIRCLE_WIDTH,
					borderRadius: 30,
					backgroundColor: styleColors.circleBackground,
					alignItems: 'center',
					justifyContent: 'center',
					position: 'absolute',
					left: circleLeftPositionAnimation,
				}}
			>
				<Animated.View
					style={{
						opacity: checkIconOpacityAnimation,
					}}
				>
					<Icon
						name='checkmark-outline'
						fill={styleColors.toggleBackgroundActive}
						height={18}
						width={18}
					/>
				</Animated.View>
			</Animated.View>
		</TouchableOpacity>
	)
}
