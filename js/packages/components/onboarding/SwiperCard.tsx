import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useStyles } from '@berty-tech/styles'

import { Card } from '../shared-components/Card'
import Button from './Button'

const SwiperCard: React.FC<{
	label?: 'Required' | 'optional' | 'Recommended' | ''
	header?: string
	title: string
	description: string
	button?: { text: string; onPress: () => Promise<void> | void }
	secondButton?: { text: string; onPress: () => Promise<void> | void }
	skip?: { text: string; onPress: () => void }
}> = ({ children, header, label, title, description, button, skip, secondButton }) => {
	const [{ absolute, text, padding, margin, background, border, column }] = useStyles()
	let labelColor: keyof typeof background.light
	switch (label) {
		default:
			labelColor = 'white'
			break
		case 'Required':
			labelColor = 'red'
			break
		case 'optional':
			labelColor = 'yellow'
			break
		case 'Recommended':
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
						margin.bottom.large,
						padding.tiny,
						padding.horizontal.scale(12),
						column.item.right,
						border.radius.medium,
						label === 'Required' ? { backgroundColor: '#FEE4E9' } : background.light[labelColor],
					]}
				>
					{label ? (
						<Text style={[text.size.small, text.color[labelColor], text.align.right]}>{label}</Text>
					) : null}
				</View>
				<View style={[padding.scale(16)]}>
					<Text
						style={[
							text.size.huge,
							padding.top.medium,
							text.align.center,
							text.bold.medium,
							text.color.blue,
							{ lineHeight: 25 },
						]}
					>
						{title}
					</Text>
					<Text
						style={[text.size.small, padding.vertical.medium, text.align.center, text.color.grey]}
					>
						{description}
					</Text>
					{children}
					{button ? <Button onPress={button.onPress}>{button.text}</Button> : null}
					{secondButton ? (
						<Button
							onPress={secondButton.onPress}
							style={{
								backgroundColor: '#DAE4FF',
								marginTop: 5,
							}}
						>
							{secondButton.text}
						</Button>
					) : null}

					{skip ? (
						<TouchableOpacity style={[margin.top.medium]} onPress={skip.onPress}>
							<Text style={[text.size.small, text.color.grey, text.align.center]}>{skip.text}</Text>
						</TouchableOpacity>
					) : null}
				</View>
			</Card>
		</SafeAreaView>
	)
}

export default SwiperCard
