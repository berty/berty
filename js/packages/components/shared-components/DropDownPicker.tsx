import React, { useState } from 'react'
import { useStyles } from '@berty-tech/styles'
import { Text, Icon } from '@ui-kitten/components'

import { View, TouchableOpacity, Animated, Easing } from 'react-native'

type Item = {
	label: string
	value: string
}

export const DropDownPicker: React.FC<{
	items: Item[]
	defaultValue: string
	onChangeItem: (item: Item) => void
}> = ({ items, defaultValue, onChangeItem }) => {
	const [{ padding, border, background, opacity }] = useStyles()

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
		setOpen((prev) => !prev)
	}
	return (
		<View
			style={[
				background.white,
				border.shadow.medium,
				border.radius.medium,
				{ flex: 1, marginTop: 22, minHeight: 60 },
			]}
		>
			<TouchableOpacity
				activeOpacity={0.9}
				style={[
					padding.vertical.medium,
					padding.horizontal.medium,
					{
						flexDirection: 'row',
						alignItems: 'space-between',
					},
				]}
				onPress={toggleView}
			>
				<Text>{items.find((item) => item.value === defaultValue)?.label}</Text>
				<View style={[{ flex: 1, alignItems: 'flex-end' }]}>
					<Animated.View
						style={[
							{
								transform: [{ rotate: rotateAnimation }],
							},
						]}
					>
						<Icon name='arrow-ios-downward' height={25} width={25} fill='black' />
					</Animated.View>
				</View>
			</TouchableOpacity>

			<Animated.ScrollView
				style={[
					border.radius.bottom.medium,
					{
						maxHeight: animateHeight,
					},
				]}
			>
				{items.map((item) => (
					<TouchableOpacity
						activeOpacity={0.9}
						onPress={() => {
							toggleView()
							onChangeItem(item)
						}}
						style={[padding.medium]}
					>
						<Text key={item.value}>{item.label}</Text>
						<View
							style={[
								border.color.grey,
								border.medium,
								opacity(0.2),
								{
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
