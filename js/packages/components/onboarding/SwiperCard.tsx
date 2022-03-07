import { useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Card } from '../shared-components/Card'
import Button from './Button'

const SwiperCard: React.FC<{
	title: string
	desc?: string
	header?: string
	button?: { text: string; onPress: () => Promise<void> | void; status?: 'primary' | 'secondary' }
	secondButton?: {
		text: string
		onPress: () => Promise<void> | void
		status?: 'primary' | 'secondary'
	}
	skip?: { text: string; onPress: () => void }
}> = ({ children, desc, header, title, button, skip, secondButton }) => {
	const [{ text, padding, margin, border }] = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<Text style={[text.size.large, text.align.center, { color: colors['reverted-main-text'] }]}>
				{header}
			</Text>
			<Card
				style={[
					border.shadow.large,
					{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
				]}
			>
				<View style={[padding.medium]}>
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
					{desc ? (
						<Text
							style={[
								text.size.small,
								padding.vertical.medium,
								text.align.center,
								{ color: colors['secondary-text'], fontFamily: 'Open Sans' },
							]}
						>
							{desc}
						</Text>
					) : null}
					{children}
					{button ? (
						<Button status={button.status} onPress={button.onPress}>
							{button.text}
						</Button>
					) : null}
					{secondButton ? (
						<Button status={secondButton.status} onPress={secondButton.onPress}>
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
		</View>
	)
}

export default SwiperCard
