import React, { useEffect, useState } from 'react'
// import { useTranslation } from 'react-i18next'
import { Icon, Layout } from '@ui-kitten/components'
import { ScrollView, StatusBar, View, Text, TextInput, TouchableOpacity } from 'react-native'
import { TriangleColorPicker } from 'react-native-color-picker'

import { useNavigation } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { HeaderSettings } from '../shared-components/Header'

const ColorPickerButton: React.FC<{
	name: string
	getOptionValue: () => Promise<string> | string
	setOptionValue: (value: string) => Promise<void> | void
	color: string
}> = ({ name, color, getOptionValue, setOptionValue }) => {
	const [{ row, text, margin, border }, { scaleSize }] = useStyles()
	const [value, setValue] = useState('')
	useEffect(() => {
		;(async () => {
			setValue(await getOptionValue())
		})()
	}, [getOptionValue])
	const colors = useThemeColor()

	return (
		<View>
			<Text style={[text.size.medium, { fontFamily: 'Open Sans', color: colors['main-text'] }]}>
				{name.length > 15 ? name.substr(0, 12) + '...' : name}
			</Text>
			<View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
				<View
					style={[
						border.radius.medium,
						border.medium,
						row.fill,
						margin.vertical.small,
						margin.right.small,
						{
							alignItems: 'center',
							width: 140 * scaleSize,
							borderColor: colors['main-text'],
						},
					]}
				>
					<TextInput
						autoCorrect={false}
						autoCapitalize='none'
						onChangeText={(t) => setValue(t)}
						value={value}
						style={[
							text.bold.small,
							text.size.medium,
							margin.left.small,
							{ fontFamily: 'Open Sans', height: 40 * scaleSize, flex: 1 },
						]}
					/>
					<TouchableOpacity
						onPress={async () => {
							await setOptionValue(value)
						}}
						style={[margin.right.small]}
					>
						<Icon
							name='checkmark-outline'
							fill={colors['alt-secondary-background-header']}
							width={20}
							height={20}
						/>
					</TouchableOpacity>
				</View>

				<TouchableOpacity
					style={{
						borderWidth: 1,
						borderColor: colors['main-text'],
						backgroundColor: color,
						width: 30 * scaleSize,
						height: 30 * scaleSize,
					}}
					onPress={() => {
						// setIsOpen(true)
					}}
				/>
			</View>
		</View>
	)
}

const BodyColorPicker: React.FC<{}> = () => {
	const colors = useThemeColor()
	const [{ padding }] = useStyles()
	return (
		<View style={[padding.medium]}>
			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					justifyContent: 'space-between',
				}}
			>
				{Object.entries(colors).map((value, key) => {
					return (
						<ColorPickerButton
							key={key}
							name={value[0]}
							getOptionValue={() => value[1]}
							setOptionValue={() => {}}
							color={value[1]}
						/>
					)
				})}
			</View>
		</View>
	)
}

export const ColorPickerCategories: React.FC<{}> = () => {
	const { goBack } = useNavigation()
	const colors = useThemeColor()
	// const { t } = useTranslation()

	return (
		<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<StatusBar
				backgroundColor={colors['alt-secondary-background-header']}
				barStyle='light-content'
			/>
			<SwipeNavRecognizer>
				<ScrollView bounces={false}>
					<HeaderSettings
						title='Color picker categories'
						bgColor={colors['alt-secondary-background-header']}
						undo={goBack}
					/>
					<BodyColorPicker />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
