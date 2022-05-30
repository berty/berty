import { Icon } from '@ui-kitten/components'
import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Animated, Easing, TouchableOpacity, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store/hooks'

import { UnifiedText } from '../shared-components/UnifiedText'

interface DropdownPrivProps {
	icon?: string
	placeholder: string
	children: React.ReactNode
}

export const DropdownPriv = forwardRef(
	({ icon, children, placeholder = '' }: DropdownPrivProps, ref) => {
		const { padding, margin } = useStyles()
		const colors = useThemeColor()

		const [isOpen, setOpen] = useState(false)
		const [animateHeight] = useState(new Animated.Value(0))
		const [rotateValue] = useState(new Animated.Value(0))

		const rotateAnimation = rotateValue.interpolate({
			inputRange: [0, 1],
			outputRange: ['0deg', '180deg'],
		})

		const toggleView = () => {
			Animated.parallel([
				Animated.timing(animateHeight, {
					toValue: isOpen ? 0 : 200,
					duration: 200,
					easing: isOpen ? Easing.out(Easing.circle) : Easing.linear,
					useNativeDriver: false,
				}),
				Animated.timing(rotateValue, {
					toValue: isOpen ? 0 : 1,
					duration: 150,
					useNativeDriver: true,
				}),
			]).start()
			setOpen(prev => !prev)
		}

		useImperativeHandle(ref, () => ({
			toggleView,
		}))

		return (
			<>
				<TouchableOpacity
					activeOpacity={0.9}
					style={[
						padding.horizontal.medium,
						{
							height: 48,
							flexDirection: 'row',
							alignItems: 'center',
						},
					]}
					onPress={toggleView}
				>
					{!!icon && (
						<View style={[margin.right.medium]}>
							<Icon
								name={icon}
								pack='custom'
								fill={colors['background-header']}
								width={25}
								height={25}
							/>
						</View>
					)}
					<UnifiedText>{placeholder}</UnifiedText>
					<View style={[{ flex: 1, alignItems: 'flex-end' }]}>
						<Animated.View style={[{ transform: [{ rotate: rotateAnimation }] }]}>
							<Icon name='arrow-ios-downward' height={25} width={25} fill='#393C63' />
						</Animated.View>
					</View>
				</TouchableOpacity>

				<Animated.ScrollView
					style={[
						{
							maxHeight: animateHeight,
							borderBottomLeftRadius: 14,
							borderBottomRightRadius: 14,
						},
					]}
					nestedScrollEnabled
					showsVerticalScrollIndicator={false}
				>
					{children}
				</Animated.ScrollView>
			</>
		)
	},
)
