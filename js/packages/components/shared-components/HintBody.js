import React from 'react'
import { View, Text as TextNative } from 'react-native'
import { Icon } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'

import messengerMethodsHooks from '@berty-tech/store/methods'

const useStylesHint = () => {
	const [{ text, opacity, margin }, { fontScale }] = useStyles()
	return {
		searchHintBodyText: [
			text.align.center,
			text.color.black,
			text.size.medium,
			text.bold.small,
			opacity(0.8),
			margin.top.medium,
			margin.bottom.large,
			{ fontFamily: 'Open Sans', lineHeight: 30 * fontScale },
		],
	}
}

const _landingIconSize = 45

export const HintBody = () => {
	const [{ padding, opacity, row, text }, { scaleSize }] = useStyles()
	const { searchHintBodyText } = useStylesHint()

	const { reply: bannerQuote = {}, call, called } = messengerMethodsHooks.useBannerQuote()
	React.useEffect(() => {
		if (!called) {
			call({ random: false })
		}
	}, [called, call])

	return !bannerQuote?.quote ? null : (
		<View style={[padding.horizontal.medium]}>
			<TextNative
				style={[
					text.align.center,
					row.item.justify,
					text.color.black,
					text.size.scale(30),
					opacity(0.8),
					text.bold.medium,
					{
						fontFamily: 'Open Sans',
						marginHorizontal: _landingIconSize * scaleSize, // room for speech bubble icon
					},
				]}
			>
				{'Quote of the day'}
			</TextNative>
			<Icon
				name='quote'
				pack='custom'
				width={_landingIconSize * scaleSize}
				height={_landingIconSize * scaleSize}
				style={[row.item.justify, opacity(0.8), { position: 'absolute', bottom: 20, right: 10 }]}
			/>
			<TextNative style={searchHintBodyText}>{bannerQuote?.quote || ''}</TextNative>
			{bannerQuote?.author && (
				<View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
					<TextNative
						style={[
							text.color.black,
							text.size.medium,
							text.bold.small,
							opacity(0.8),
							{ fontFamily: 'Open Sans' },
						]}
					>
						{'— ' + bannerQuote?.author}
					</TextNative>
				</View>
			)}
		</View>
	)
}
