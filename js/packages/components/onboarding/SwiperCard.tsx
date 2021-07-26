import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'

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
	const [{ absolute, text, padding, margin, border, column }] = useStyles()
	const colors = useThemeColor()

	let labelColor: string
	switch (label) {
		default:
			labelColor = 'reverted-main-text'
			break
		case 'Required':
			labelColor = 'warning-asset'
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
					text.align.center,
					{ color: colors['reverted-main-text'] },
				]}
			>
				{header}
			</Text>
			<Card
				style={[
					absolute.bottom,
					absolute.left,
					absolute.right,
					border.shadow.large,
					{ backgroundColor: colors['main-background'] },
				]}
			>
				<View
					style={[
						margin.bottom.large,
						padding.tiny,
						padding.horizontal.scale(12),
						column.item.right,
						border.radius.medium,
						{ backgroundColor: `${colors[labelColor]}30` },
					]}
				>
					{label ? (
						<Text style={[text.size.small, text.align.right, { color: colors[labelColor] }]}>
							{label}
						</Text>
					) : null}
				</View>
				<View style={[padding.scale(16)]}>
					<Text
						style={[
							text.size.huge,
							padding.top.medium,
							text.align.center,
							text.bold.medium,
							{ lineHeight: 25, color: colors['background-header'] },
						]}
					>
						{title}
					</Text>
					<Text
						style={[
							text.size.small,
							padding.vertical.medium,
							text.align.center,
							{ color: colors['secondary-text'] },
						]}
					>
						{description}
					</Text>
					{children}
					{button ? <Button onPress={button.onPress}>{button.text}</Button> : null}
					{secondButton ? (
						<Button
							onPress={secondButton.onPress}
							style={{
								marginTop: 5,
							}}
						>
							{secondButton.text}
						</Button>
					) : null}

					{skip ? (
						<TouchableOpacity style={[margin.top.medium]} onPress={skip.onPress}>
							<Text
								style={[text.size.small, text.align.center, { color: colors['secondary-text'] }]}
							>
								{skip.text}
							</Text>
						</TouchableOpacity>
					) : null}
				</View>
			</Card>
		</SafeAreaView>
	)
}

export default SwiperCard
