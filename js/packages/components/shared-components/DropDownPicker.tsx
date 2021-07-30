import React, { useState } from 'react'
import { View, TouchableOpacity, Animated, Easing } from 'react-native'
import Flag from 'react-native-flags'
import { Text, Icon } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'

type Item = {
	label: string
	value: string
}

const DropDownPickerFlagValue: React.FC<{ value: string | undefined }> = ({ value }) => {
	return <Flag code={value?.split('-')[1]} size={24} />
}

export const DropDownPicker: React.FC<{
	items: Item[]
	defaultValue: string | null
	onChangeItem: (item: Item) => void
	mode?: 'languages' | 'themeCollection'
}> = ({ items, defaultValue, onChangeItem, mode = 'languages' }) => {
	const [{ padding, border, opacity, text, margin }, { scaleSize }] = useStyles()
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
		setOpen((prev) => !prev)
	}
	const selectedItem = items.find((item) =>
		isModeLanguages ? item.value === defaultValue : item.label === defaultValue,
	)
	return (
		<View
			style={[
				border.shadow.medium,
				border.radius.medium,
				{
					flex: 1,
					marginTop: 22 * scaleSize,
					minHeight: 60 * scaleSize,
					backgroundColor: colors['main-background'],
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
				<View style={[margin.right.medium]}>
					{isModeLanguages ? <DropDownPickerFlagValue value={selectedItem?.value} /> : null}
				</View>
				<Text style={[text.size.medium, { color: colors['main-text'] }]}>
					{selectedItem?.label}
				</Text>
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
						<View style={[margin.right.medium]}>
							{isModeLanguages ? <Flag code={item.value.split('-')[1]} size={24} /> : null}
						</View>
						<Text style={[text.size.medium, { color: colors['main-text'] }]} key={item.value}>
							{item.label}
						</Text>
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
