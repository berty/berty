import React from 'react'
import { View, ViewProps } from 'react-native'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { PrimaryButton, SecondaryButton, TertiaryAltButton } from '../buttons'
import { UnifiedText } from '../shared-components/UnifiedText'

const Card: React.FC<ViewProps> = ({ style, children, ...props }) => (
	<View
		{...props}
		style={[
			{
				borderRadius: 20,
				padding: 16,
				margin: 16,
			},
			style,
		]}
	>
		<>{children}</>
	</View>
)

const SwiperCard: React.FC<{
	title: string
	desc?: string
	header?: string
	button?: {
		text: string
		onPress: () => void
		accessibilityLabel?: string
	}
	secondButton?: {
		text: string
		onPress: () => void
	}
	skip?: { text: string; onPress: () => void }
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
			<Card style={[{ backgroundColor: '#F2F2F2', shadowColor: colors.shadow }]}>
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
					<View style={[margin.horizontal.large, margin.top.small]}>
						{!!button && (
							<PrimaryButton onPress={button.onPress} accessibilityLabel={button.text}>
								{button.text}
							</PrimaryButton>
						)}
						{!!secondButton && (
							<View style={margin.top.small}>
								<SecondaryButton
									onPress={secondButton.onPress}
									accessibilityLabel={secondButton.text}
								>
									{secondButton.text}
								</SecondaryButton>
							</View>
						)}
					</View>

					{!!skip && <TertiaryAltButton onPress={skip.onPress}>{skip.text}</TertiaryAltButton>}
				</View>
			</Card>
		</View>
	)
}

export default SwiperCard
