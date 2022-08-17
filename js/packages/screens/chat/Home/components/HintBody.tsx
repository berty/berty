import { Icon } from '@ui-kitten/components'
import React from 'react'
import { StyleSheet, View } from 'react-native'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { bertyMethodsHooks, useThemeColor } from '@berty/hooks'

const _landingIconSize = 30

export const HintBody = () => {
	const { padding, opacity, row, text, margin } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	const { reply: bannerQuote = {}, call, called } = bertyMethodsHooks.useBannerQuote()
	React.useEffect(() => {
		if (!called) {
			call({ random: false })
		}
	}, [called, call])

	return !bannerQuote?.quote ? null : (
		<View style={[padding.horizontal.medium]}>
			<UnifiedText
				style={[
					styles.quote,
					opacity(0.8),
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
				style={[row.item.justify, styles.quoteIcon, opacity(0.8)]}
			/>
			<UnifiedText
				style={[
					opacity(0.8),
					margin.top.large,
					margin.bottom.small,
					styles.hint,
					{ color: `${colors['secondary-text']}90` },
				]}
			>
				{bannerQuote?.quote || ''}
			</UnifiedText>
			{bannerQuote?.author && (
				<View style={[styles.author]}>
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

const styles = StyleSheet.create({
	quote: {
		fontSize: 22,
		fontFamily: 'Bold Open Sans',
		textAlign: 'center',
		alignSelf: 'center',
	},
	quoteIcon: { position: 'absolute', bottom: 20, right: 60 },
	author: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
	hint: { textAlign: 'center', fontFamily: 'Light Open Sans', fontSize: 15, lineHeight: 20 },
})
