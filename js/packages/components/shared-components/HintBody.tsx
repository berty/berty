import React from 'react'
import { View } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useStyles } from '@berty/contexts/styles'
import messengerMethodsHooks from '@berty/store/methods'
import { useThemeColor } from '@berty/store/hooks'
import { UnifiedText } from './UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const useStylesHint = () => {
	const { text, opacity, margin } = useStyles()
	const { fontScale } = useAppDimensions()

	return {
		searchHintBodyText: [
			text.align.center,
			text.size.medium,
			text.light,
			opacity(0.8),
			margin.top.large,
			margin.bottom.small,
			{ lineHeight: 20 * fontScale },
		],
	}
}

const _landingIconSize = 30

export const HintBody = () => {
	const { padding, opacity, row, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { searchHintBodyText } = useStylesHint()

	const { reply: bannerQuote = {}, call, called } = messengerMethodsHooks.useBannerQuote()
	React.useEffect(() => {
		if (!called) {
			call({ random: false })
		}
	}, [called, call])

	return !bannerQuote?.quote ? null : (
		<View style={[padding.horizontal.medium, { bottom: 0 }]}>
			<UnifiedText
				style={[
					text.align.center,
					row.item.justify,
					text.size.big,
					opacity(0.8),
					text.bold,
					{
						color: `${colors['secondary-text']}90`,
						marginHorizontal: _landingIconSize * scaleSize, // room for speech bubble icon
					},
				]}
			>
				{'Quote of the day'}
			</UnifiedText>
			<Icon
				name='quote'
				pack='custom'
				width={_landingIconSize * scaleSize}
				height={_landingIconSize * scaleSize}
				fill={`${colors['secondary-text']}90`}
				style={[
					row.item.justify,
					opacity(0.8),
					{ position: 'absolute', bottom: 20 * scaleSize, right: 60 * scaleSize },
				]}
			/>
			<UnifiedText style={[searchHintBodyText, { color: `${colors['secondary-text']}90` }]}>
				{bannerQuote?.quote || ''}
			</UnifiedText>
			{bannerQuote?.author && (
				<View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
					<UnifiedText
						style={[
							text.size.scale(15),
							text.light,
							opacity(0.8),
							{ color: `${colors['secondary-text']}90` },
						]}
					>
						{'— ' + bannerQuote?.author}
					</UnifiedText>
				</View>
			)}
		</View>
	)
}
