import React from 'react'
import { View, Text as TextNative } from 'react-native'
import Quote from './quote.svg'
import { useStyles } from '@berty-tech/styles'

import messengerMethodsHooks from '@berty-tech/store/methods'

const useStylesHint = () => {
	const [{ text, margin }, { fontScale }] = useStyles()
	return {
		searchHintBodyText: [
			text.align.center,
			text.size.medium,
			text.bold.small,
			margin.top.medium,
			margin.bottom.large,
			{ fontFamily: 'Open Sans', lineHeight: 30 * fontScale, color: '#DBE1EC' },
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
					text.size.scale(30),
					text.bold.medium,
					{
						fontFamily: 'Open Sans',
						marginHorizontal: _landingIconSize * scaleSize, // room for speech bubble icon
						color: '#DADDE6'
					},
				]}
			>
				{'Quote of the day'}
			</TextNative>
			<Quote
				width={_landingIconSize * scaleSize}
				height={_landingIconSize * scaleSize}
				style={{ position: 'absolute', bottom: 150, right: 30 }}
			/>
			<TextNative style={searchHintBodyText}>{bannerQuote?.quote || ''}</TextNative>
			{bannerQuote?.author && (
				<View style={[{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}>
					<TextNative
						style={[
							text.color.black,
							text.size.medium,
							text.bold.small,
							{ fontFamily: 'Open Sans', color: '#DBE1EC' },
						]}
					>
						{'— ' + bannerQuote?.author}
					</TextNative>
				</View>
			)}
		</View>
	)
}
