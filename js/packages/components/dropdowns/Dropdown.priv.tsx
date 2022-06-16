import { Icon } from '@ui-kitten/components'
import React, { useState, forwardRef, useImperativeHandle } from 'react'
import { Animated, Easing, StyleSheet, TouchableOpacity, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store/hooks'

import { UnifiedText } from '../shared-components/UnifiedText'

interface DropdownPrivProps {
	icon?: string
	placeholder: string
	children: React.ReactNode
	accessibilityLabel?: string
}

export const DropdownPriv = forwardRef(
	({ icon, children, accessibilityLabel, placeholder = '' }: DropdownPrivProps, ref) => {
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
					style={[padding.horizontal.medium, styles.button]}
					onPress={toggleView}
					accessibilityLabel={accessibilityLabel}
				>
					{!!icon && (
						<Icon
							name={icon}
							pack='custom'
							fill={colors['background-header']}
							width={20}
							height={20}
						/>
					)}
					<View style={styles.textWrapper}>
						<UnifiedText numberOfLines={1} style={[margin.left.small]}>
							{placeholder}
						</UnifiedText>
					</View>
					<View style={styles.iconWrapper}>
						<Animated.View style={[{ transform: [{ rotate: rotateAnimation }] }]}>
							<Icon name='arrow-ios-downward' height={20} width={20} fill='#393C63' />
						</Animated.View>
					</View>
				</TouchableOpacity>

				<Animated.ScrollView
					style={[
						{
							maxHeight: animateHeight,
						},
						styles.scrollView,
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

const styles = StyleSheet.create({
	button: {
		height: 48,
		flexDirection: 'row',
		alignItems: 'center',
	},
	textWrapper: {
		width: '80%',
	},
	iconWrapper: {
		flex: 1,
		alignItems: 'flex-end',
	},
	scrollView: {
		borderBottomLeftRadius: 14,
		borderBottomRightRadius: 14,
	},
})
