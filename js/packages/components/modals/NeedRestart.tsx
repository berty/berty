import React from 'react'
import { StyleSheet, Text as TextNative, TouchableOpacity, View } from 'react-native'
import { BlurView } from '@react-native-community/blur'
import { useTranslation } from 'react-i18next'
import { Icon, Text } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'
import { useMsgrContext } from '@berty-tech/store/context'

import Avatar from './Buck_Berty_Icon_Card.svg'

const useStylesNeedRestart = () => {
	const [{ width, border, padding, margin }] = useStyles()
	return {
		skipButton: [
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
		],
		addButton: [
			border.color.light.blue,
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
		],
	}
}

const Body: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	const [{ row, text, margin, color, padding, background, border }, { scaleHeight }] = useStyles()
	const { t } = useTranslation()
	const _styles = useStylesNeedRestart()
	const ctx = useMsgrContext()

	return (
		<View
			style={[
				{
					justifyContent: 'center',
					alignItems: 'center',
					height: 250 * scaleHeight,
					top: '25%',
				},
				margin.big,
			]}
		>
			<View
				style={[
					{
						width: 110 * scaleHeight,
						height: 110 * scaleHeight,
						justifyContent: 'center',
						alignItems: 'center',
						position: 'relative',
						top: 50 * scaleHeight,
						zIndex: 1,
						elevation: 7,
						shadowOpacity: 0.1,
						shadowRadius: 5,
						shadowOffset: { width: 0, height: 3 },
					},
					border.radius.scale(60),
				]}
			>
				<Avatar width={125 * scaleHeight} height={125 * scaleHeight} />
			</View>
			<View
				style={[
					border.radius.large,
					border.shadow.huge,
					{
						backgroundColor: '#4147D8',
						overflow: 'hidden',
					},
				]}
			>
				<View style={[margin.top.scale(55 * scaleHeight)]}>
					<Icon
						name='info-outline'
						fill={color.white}
						width={60 * scaleHeight}
						height={60 * scaleHeight}
						style={[row.item.justify, padding.top.large]}
					/>
					<TextNative
						style={[
							text.align.center,
							padding.top.small,
							text.size.large,
							text.bold.medium,
							text.color.white,
							padding.horizontal.medium,
							{ fontFamily: 'Open Sans' },
						]}
					>
						{t('modals.need-restart.title')}
					</TextNative>
					<Text style={[text.align.center, padding.top.scale(20), padding.horizontal.medium]}>
						<TextNative
							style={[
								text.bold.small,
								text.size.medium,
								text.color.white,
								{ fontFamily: 'Open Sans' },
							]}
						>
							{t('modals.need-restart.desc')}
						</TextNative>
					</Text>
				</View>
				<View style={[row.center, padding.top.medium]}>
					<TouchableOpacity
						style={[
							margin.bottom.medium,
							_styles.skipButton,
							{
								flexDirection: 'row',
								justifyContent: 'center',
								backgroundColor: 'white',
							},
						]}
						onPress={() => {
							closeModal()
						}}
					>
						<Icon name='close' width={30} height={30} fill={color.grey} style={row.item.justify} />
						<TextNative
							style={[
								text.color.grey,
								padding.left.small,
								row.item.justify,
								text.size.scale(16),
								{ fontFamily: 'Open Sans', fontWeight: '700' },
							]}
						>
							{t('modals.need-restart.cancel-button')}
						</TextNative>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							margin.bottom.medium,
							background.light.blue,
							_styles.addButton,
							{ flexDirection: 'row', justifyContent: 'center' },
						]}
						onPress={async () => {
							closeModal()
							await ctx.restart()
						}}
					>
						<Icon
							name='checkmark-outline'
							width={30}
							height={30}
							fill={color.blue}
							style={[row.item.justify, padding.left.small]}
						/>
						<TextNative
							style={[
								text.color.blue,
								padding.left.small,
								row.item.justify,
								text.size.scale(16),
								text.bold.large,
								{ fontFamily: 'Open Sans', fontWeight: '700' },
							]}
						>
							{t('modals.need-restart.restart-button')}
						</TextNative>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

export const NeedRestart: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	return (
		<View style={[StyleSheet.absoluteFill]}>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<Body closeModal={closeModal} />
		</View>
	)
}
