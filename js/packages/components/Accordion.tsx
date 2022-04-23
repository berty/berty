import React, { useState, useRef, FC, useCallback, useMemo } from 'react'
import { Divider, Icon } from '@ui-kitten/components'
import { View, Animated, Easing, TouchableOpacity } from 'react-native'

import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { Toggle } from './shared-components/Toggle'
import { UnifiedText } from './shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const heightButton = 55

const AccordionIconV2: FC<{ name: string; pack?: string; fill?: string; size?: number }> = ({
	name,
	pack,
	fill,
	size = 20,
}) => {
	const colors = useThemeColor()
	const { scaleSize } = useAppDimensions()

	return (
		<Icon
			name={name}
			width={size * scaleSize}
			height={size * scaleSize}
			pack={pack ? pack : undefined}
			fill={fill ? fill : colors['background-header']}
		/>
	)
}

export const AccordionItemV2: FC<{
	value: string | null
	toggle: boolean
	onToggleChange?: (list: any) => void
	onPressModify?: () => void
}> = ({ value, toggle, onToggleChange, onPressModify }) => {
	const { margin, padding } = useStyles()
	const { scaleSize } = useAppDimensions()

	return (
		<>
			<View
				style={[
					padding.horizontal.medium,
					{
						flex: 1,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
					},
				]}
			>
				<View style={{ height: heightButton * scaleSize, marginLeft: 30 }}>
					<View
						style={[
							margin.left.small,
							{ height: heightButton, flexDirection: 'row', alignItems: 'center' },
						]}
					>
						<UnifiedText>{value}</UnifiedText>
					</View>
				</View>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{onPressModify ? (
						<TouchableOpacity onPress={onPressModify} style={[padding.right.medium]}>
							<AccordionIconV2 name='edit-outline' size={24} />
						</TouchableOpacity>
					) : null}
					<Toggle status='primary' checked={toggle} onChange={onToggleChange} />
				</View>
			</View>
			<Divider />
		</>
	)
}

export const AccordionAddItemV2: FC<{
	onPress: () => void
}> = ({ onPress }) => {
	const { padding } = useStyles()
	const { scaleSize } = useAppDimensions()

	return (
		<>
			<TouchableOpacity
				style={[
					padding.horizontal.medium,
					{
						flex: 1,
						flexDirection: 'row',
						justifyContent: 'center',
					},
				]}
				onPress={onPress}
			>
				<View
					style={{
						height: heightButton * scaleSize,
						justifyContent: 'center',
					}}
				>
					<AccordionIconV2 name='plus-circle' pack='feather' size={24} />
				</View>
			</TouchableOpacity>
		</>
	)
}

export const AccordionV2: FC<{
	title: string
	icon?: string
}> = ({ title, icon, children }) => {
	const { margin, padding, border } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const [open, setOpen] = useState(false)
	const animatedController = useRef(new Animated.Value(0)).current
	const [bodySectionHeight, setBodySectionHeight] = useState(0)

	const bodyHeight = useMemo(
		() =>
			animatedController.interpolate({
				inputRange: [0, 1],
				outputRange: [0, bodySectionHeight],
			}),
		[animatedController, bodySectionHeight],
	)

	const arrowAngle = useMemo(
		() =>
			animatedController.interpolate({
				inputRange: [0, 1],
				outputRange: ['0rad', `${Math.PI * 0.5}rad`],
			}),
		[animatedController],
	)

	const toggleListItem = useCallback(() => {
		if (open) {
			Animated.timing(animatedController, {
				duration: 300,
				toValue: 0,
				easing: Easing.bezier(0.4, 0.0, 0.2, 1),
				useNativeDriver: false,
			}).start()
		} else {
			Animated.timing(animatedController, {
				duration: 300,
				toValue: 1,
				easing: Easing.bezier(0.4, 0.0, 0.2, 1),
				useNativeDriver: false,
			}).start()
		}
		setOpen(!open)
	}, [animatedController, open])

	return (
		<>
			<TouchableOpacity
				onPress={() => toggleListItem()}
				activeOpacity={0.2}
				style={[
					padding.vertical.medium,
					padding.horizontal.medium,
					{
						height: heightButton * scaleSize,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
					},
				]}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{icon && (
						<View style={[{ height: heightButton, flexDirection: 'row', alignItems: 'center' }]}>
							<AccordionIconV2 name={icon} />
						</View>
					)}
					<View
						style={[
							margin.left.small,
							{ height: heightButton, flexDirection: 'row', alignItems: 'center' },
						]}
					>
						<UnifiedText>{title}</UnifiedText>
					</View>
					<View style={{ flex: 1 }} />
					<Animated.View style={{ transform: [{ rotateZ: arrowAngle }] }}>
						<AccordionIconV2 name='arrow-ios-forward' fill={colors['main-text']} />
					</Animated.View>
				</View>
			</TouchableOpacity>
			<Animated.View
				style={{
					height: bodyHeight,
					overflow: 'hidden',
				}}
			>
				<View
					style={[
						border.radius.bottom.medium,
						{
							position: 'absolute',
							bottom: 0,
							right: 0,
							left: 0,
							overflow: 'hidden',
						},
					]}
					onLayout={event => setBodySectionHeight(event.nativeEvent.layout.height)}
				>
					{children}
				</View>
			</Animated.View>
		</>
	)
}
