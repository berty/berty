import { useThemeColor } from '@berty/store/hooks'
import { useStyles } from '@berty/contexts/styles'
import { Icon } from '@ui-kitten/components'
import React, { useState } from 'react'
import { Animated, Easing, TouchableOpacity, View } from 'react-native'
import { UnifiedText } from './UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export type Item = {
	label: string
	value: string
}

export const DropDownPicker: React.FC<{
	items: Item[]
	defaultValue: string | number | symbol | null
	onChangeItem: (item: Item) => void
	icon?: string
	pack?: string
	placeholder?: string
	mode?: 'languages' | 'themeCollection'
}> = ({
	items,
	defaultValue,
	onChangeItem,
	icon = null,
	pack = '',
	placeholder = null,
	mode = 'languages',
}) => {
	const { padding, border, opacity, margin } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	const [isOpen, setOpen] = useState(false)
	const [animateHeight] = useState(new Animated.Value(0))
	const [rotateValue] = useState(new Animated.Value(0))
	const isModeLanguages = mode === 'languages'

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
	const selectedItem = items.find(item =>
		isModeLanguages ? item.value === defaultValue : item.label === defaultValue,
	)
	return (
		<View
			style={[
				// border.shadow.medium,
				border.radius.medium,
				{
					flex: 1,
					marginTop: 22 * scaleSize,
					minHeight: 55 * scaleSize,
					backgroundColor: colors['input-background'],
					// shadowColor: colors.shadow,
				},
			]}
		>
			<TouchableOpacity
				activeOpacity={0.9}
				style={[
					padding.vertical.medium,
					padding.horizontal.medium,
					{
						flexDirection: 'row',
						alignItems: 'center',
					},
				]}
				onPress={toggleView}
			>
				{icon ? (
					<View style={[margin.right.medium]}>
						<Icon
							name={icon}
							pack={pack}
							fill={colors['main-text']}
							width={25 * scaleSize}
							height={25 * scaleSize}
						/>
					</View>
				) : null}
				{placeholder && !selectedItem?.label ? (
					<UnifiedText style={{ color: `${colors['main-text']}50` }}>{placeholder}</UnifiedText>
				) : (
					<UnifiedText>{selectedItem?.label}</UnifiedText>
				)}
				<View style={[{ flex: 1, alignItems: 'flex-end' }]}>
					<Animated.View style={[{ transform: [{ rotate: rotateAnimation }] }]}>
						<Icon name='arrow-ios-downward' height={25} width={25} fill={colors['main-text']} />
					</Animated.View>
				</View>
			</TouchableOpacity>

			<Animated.ScrollView
				style={[border.radius.bottom.medium, { maxHeight: animateHeight }]}
				nestedScrollEnabled
				showsVerticalScrollIndicator={false}
			>
				{items.map((item, key) => (
					<TouchableOpacity
						activeOpacity={0.9}
						onPress={() => {
							toggleView()
							onChangeItem(item)
						}}
						style={[padding.medium, { flexDirection: 'row', alignItems: 'center' }]}
						key={key}
					>
						<UnifiedText key={item.value}>{item.label}</UnifiedText>
						<View
							style={[
								border.medium,
								opacity(0.2),
								{
									borderColor: colors['secondary-text'],
									position: 'absolute',
									top: 0,
									left: 0,
									right: 0,
								},
							]}
						/>
					</TouchableOpacity>
				))}
			</Animated.ScrollView>
		</View>
	)
}
