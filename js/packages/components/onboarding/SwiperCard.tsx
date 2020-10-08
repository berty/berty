import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useStyles } from '@berty-tech/styles'

import { Card } from '../shared-components/Card'
import Button from './Button'

const SwiperCard: React.FC<{
	label?: 'required' | 'optional' | 'recommended' | ''
	header?: string
	title: string
	description: string
	button?: { text: string; onPress: () => Promise<void> | void }
	skip?: { text: string; onPress: () => void }
}> = ({ children, header, label, title, description, button, skip }) => {
	const [{ absolute, text, padding, margin, background, border, column }] = useStyles()
	let labelColor: keyof typeof background.light
	switch (label) {
		default:
			labelColor = 'white'
			break
		case 'required':
			labelColor = 'red'
			break
		case 'optional':
			labelColor = 'yellow'
			break
		case 'recommended':
			labelColor = 'green'
			break
	}
	return (
		<SafeAreaView style={[margin.bottom.huge, absolute.fill]}>
			<Text
				style={[
					absolute.fill,
					margin.big,
					padding.vertical.big,
					text.size.large,
					text.color.white,
					text.align.center,
				]}
			>
				{header}
			</Text>
			<Card
				style={[
					background.white,
					absolute.bottom,
					absolute.left,
					absolute.right,
					border.shadow.large,
				]}
			>
				<View
					style={[
						padding.tiny,
						column.item.right,
						background.light[labelColor],
						border.radius.tiny,
					]}
				>
					{label ? (
						<Text style={[text.size.small, text.color[labelColor], text.align.right]}>{label}</Text>
					) : null}
				</View>
				<Text
					style={[
						text.size.huge,
						padding.top.medium,
						text.align.center,
						text.bold.medium,
						text.color.blue,
					]}
				>
					{title}
				</Text>
				<Text
					style={[text.size.medium, padding.vertical.medium, text.align.center, text.color.grey]}
				>
					{description}
				</Text>
				{children}
				{button ? <Button onPress={button.onPress}>{button.text}</Button> : null}
				{skip ? (
					<TouchableOpacity style={[margin.top.medium]} onPress={skip.onPress}>
						<Text style={[text.size.small, text.color.grey, text.align.center]}>{skip.text}</Text>
					</TouchableOpacity>
				) : null}
			</Card>
		</SafeAreaView>
	)
}

export default SwiperCard
