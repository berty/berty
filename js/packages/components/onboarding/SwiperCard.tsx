import React, { ComponentProps } from 'react'
import { TextStyle, TouchableOpacity, View } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store/hooks'

import { UnifiedText } from '../shared-components/UnifiedText'
import { Card } from '../shared-components/Card'
import Button from './Button'

const SwiperCard: React.FC<{
	title: string
	desc?: string
	header?: string
	button?: {
		text: string
	} & ComponentProps<typeof Button>
	secondButton?: {
		text: string
	} & ComponentProps<typeof Button>
	skip?: { text: string; onPress: () => void; textStyle: TextStyle | TextStyle[] }
}> = ({ children, desc, header, title, button, skip, secondButton }) => {
	const { text, padding, margin } = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<UnifiedText
				style={[text.size.large, text.align.center, { color: colors['reverted-main-text'] }]}
			>
				{header}
			</UnifiedText>
			<Card style={[{ backgroundColor: colors['main-background'], shadowColor: colors.shadow }]}>
				<View style={[padding.medium]}>
					<UnifiedText
						style={[
							text.size.huge,
							padding.top.medium,
							text.align.center,
							text.bold,
							{ lineHeight: 25, color: colors['background-header'] },
						]}
					>
						{title}
					</UnifiedText>
					{desc ? (
						<UnifiedText
							style={[
								text.size.small,
								padding.vertical.medium,
								text.align.center,
								{ color: colors['secondary-text'] },
							]}
						>
							{desc}
						</UnifiedText>
					) : null}
					{children}
					{button ? <Button {...button}>{button.text}</Button> : null}
					{secondButton ? <Button {...secondButton}>{secondButton.text}</Button> : null}

					{skip ? (
						<TouchableOpacity style={[margin.top.medium]} onPress={skip.onPress}>
							<UnifiedText
								style={[
									text.size.small,
									text.align.center,
									{ color: colors['secondary-text'] },
									skip.textStyle,
								]}
							>
								{skip.text}
							</UnifiedText>
						</TouchableOpacity>
					) : null}
				</View>
			</Card>
		</View>
	)
}

export default SwiperCard
