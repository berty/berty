import React, { useEffect, useState } from 'react'
import { TouchableOpacity, Animated, ViewStyle } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useThemeColor } from '@berty/store/hooks'

const TOGGLE_WIDTH = 50
const CIRCLE_WIDTH = 25
const BORDER_RADIUS_WIDTH = 1
const CIRCLE_RIGHT_POSITION = TOGGLE_WIDTH - CIRCLE_WIDTH - BORDER_RADIUS_WIDTH * 2

type Status = 'primary' | 'secondary' | 'third'
type ToggleProps = {
	status: Status
	checked?: boolean
	onChange?: (checked: boolean) => void
	disabled?: boolean
	style?: ViewStyle
}

const generateStyleColors = (
	status: Status,
	disabled: boolean,
	colors: any,
): {
	circleBackground: string
	toggleBackgroundActive: string
	toggleBackgroundInactive: string
	checkColor: string
} => {
	if (disabled) {
		return {
			circleBackground: '#CBD1DC',
			toggleBackgroundActive: '#DEE2E8',
			toggleBackgroundInactive: '#DEE2E8',
			checkColor: '#FFFFFF',
		}
	} else {
		const statusColors = {
			primary: {
				circleBackground: 'white',
				toggleBackgroundInactive: '#EDF0F3',
				toggleBackgroundActive: colors['background-header'],
				checkColor: colors['background-header'],
			},
			secondary: {
				circleBackground: 'white',
				toggleBackgroundInactive: '#C7C6FF61',
				toggleBackgroundActive: colors['background-header'],
				checkColor: colors['background-header'],
			},
			third: {
				circleBackground: colors['background-header'],
				toggleBackgroundInactive: '#DEE2E8',
				toggleBackgroundActive: colors['input-background'],
				checkColor: colors['background-header'],
			},
		}
		return statusColors[status]
	}
}

export const Toggle: React.FC<ToggleProps> = ({
	status = 'primary',
	disabled = false,
	checked: defaultChecked = false,
	style,
	onChange,
}) => {
	const colors = useThemeColor()
	const [checked, setChecked] = useState(defaultChecked)

	const circleLeftPositionAnimation = React.useRef(
		new Animated.Value(checked ? CIRCLE_RIGHT_POSITION : 0),
	).current
	const checkIconOpacityAnimation = React.useRef(new Animated.Value(checked ? 1 : 0)).current
	const styleColors = generateStyleColors(status, disabled, colors)

	useEffect(() => {
		setChecked(defaultChecked)
	}, [defaultChecked])

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
			activeOpacity={0.7}
			onPress={() => {
				onChange?.(!checked)
				// setChecked(!checked)
			}}
			style={[
				{
					height: CIRCLE_WIDTH + BORDER_RADIUS_WIDTH * 2,
					width: TOGGLE_WIDTH,
					borderRadius: 30,
					backgroundColor:
						styleColors[checked ? 'toggleBackgroundActive' : 'toggleBackgroundInactive'],
					borderWidth: BORDER_RADIUS_WIDTH,
					borderColor: styleColors.toggleBackgroundActive,
				},
				style,
			]}
			disabled={disabled}
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
