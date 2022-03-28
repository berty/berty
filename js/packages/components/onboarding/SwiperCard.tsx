import { useThemeColor } from '@berty/store/hooks'
import { useStyles } from '@berty/styles'
import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { BText } from '../shared-components/BText'
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
	const [{ text, padding, margin }] = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<BText style={[text.size.large, text.align.center, { color: colors['reverted-main-text'] }]}>
				{header}
			</BText>
			<Card style={[{ backgroundColor: colors['main-background'], shadowColor: colors.shadow }]}>
				<View style={[padding.medium]}>
					<BText
						style={[
							text.size.huge,
							padding.top.medium,
							text.align.center,
							text.bold.medium,
							{ lineHeight: 25, color: colors['background-header'] },
						]}
					>
						{title}
					</BText>
					{desc ? (
						<BText
							style={[
								text.size.small,
								padding.vertical.medium,
								text.align.center,
								{ color: colors['secondary-text'] },
							]}
						>
							{desc}
						</BText>
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
							<BText
								style={[text.size.small, text.align.center, { color: colors['secondary-text'] }]}
							>
								{skip.text}
							</BText>
						</TouchableOpacity>
					) : null}
				</View>
			</Card>
		</View>
	)
}

export default SwiperCard
