import React from 'react'
import { View, TouchableOpacity, Text as TextNative, StyleSheet, TextInput } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { BlurView } from '@react-native-community/blur'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { CurrentGeneratedTheme, PersistentOptionsKeys } from '@berty-tech/store/context'

import Avatar from './Buck_Berty_Icon_Card.svg'

const useStylesAddBetabot = () => {
	const [{ width, border, padding, margin }] = useStyles()
	const colors = useThemeColor()

	return {
		skipButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
			{ borderColor: colors['negative-asset'] },
		],
		addButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			width(120),
			{ borderColor: colors['positive-asset'] },
		],
	}
}

export const ThemeColorBody: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	const [themeName, setThemeName] = React.useState<string>('')
	const [{ row, text, margin, padding, border, opacity }, { scaleHeight, scaleSize }] = useStyles()
	const colors = useThemeColor()
	const _styles = useStylesAddBetabot()
	const ctx = useMsgrContext()
	const { t } = useTranslation()

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
						backgroundColor: colors['main-background'],
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
					padding.horizontal.medium,
					padding.bottom.medium,
					border.radius.large,
					border.shadow.huge,
					{ backgroundColor: colors['main-background'] },
				]}
			>
				<View style={[margin.top.scale(70 * scaleHeight)]}>
					<TextNative
						style={[
							text.align.center,
							padding.top.small,
							text.size.large,
							text.bold.medium,
							{ fontFamily: 'Open Sans', color: colors['main-text'] },
						]}
					>
						{`🎨 ${t('modals.save-theme.title')}`}
					</TextNative>
					<View
						style={[padding.top.scale(20), padding.horizontal.medium, { flexDirection: 'column' }]}
					>
						<View>
							<TextNative
								style={[
									text.bold.small,
									text.size.medium,
									{ fontFamily: 'Open Sans', color: colors['main-text'] },
								]}
							>
								{t('modals.save-theme.desc')}
							</TextNative>
						</View>
						<View
							style={[
								border.radius.medium,
								padding.left.small,
								margin.top.medium,
								{ backgroundColor: colors['input-background'] },
							]}
						>
							<TextInput
								value={themeName}
								multiline
								onChange={({ nativeEvent }) => setThemeName(nativeEvent.text)}
								style={[
									text.bold.small,
									{
										fontFamily: 'Open Sans',
										color: colors['background-header'],
										paddingRight: 12 * scaleSize,
									},
								]}
								placeholder={t('modals.save-theme.placeholder')}
								placeholderTextColor={colors['secondary-text']}
							/>
						</View>
					</View>
				</View>
				<View style={[row.center, margin.top.small]}>
					<TouchableOpacity
						style={[
							margin.bottom.medium,
							opacity(0.5),
							_styles.skipButton,
							{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
						]}
						onPress={async () => {
							closeModal()
						}}
					>
						<Icon
							name='close'
							width={30}
							height={30}
							fill={colors['negative-asset']}
							style={row.item.justify}
						/>
						<TextNative
							style={[
								padding.left.small,
								row.item.justify,
								text.size.scale(16),
								text.bold.medium,
								{ fontFamily: 'Open Sans', color: colors['negative-asset'] },
							]}
						>
							{t('modals.save-theme.cancel')}
						</TextNative>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							margin.bottom.medium,
							_styles.addButton,
							{
								flexDirection: 'row',
								justifyContent: 'center',
								alignItems: 'center',
								backgroundColor: colors['positive-asset'],
							},
						]}
						onPress={async () => {
							await ctx.setPersistentOption({
								type: PersistentOptionsKeys.ThemeColor,
								payload: {
									selected: themeName,
									collection: {
										...ctx.persistentOptions.themeColor.collection,
										[themeName]: {
											colors:
												ctx.persistentOptions.themeColor.collection[CurrentGeneratedTheme].colors,
										},
									},
								},
							})
							closeModal()
						}}
					>
						<Icon
							name='checkmark-outline'
							width={30}
							height={30}
							fill={colors['background-header']}
							style={row.item.justify}
						/>
						<TextNative
							style={[
								padding.left.small,
								row.item.justify,
								text.size.scale(16),
								text.bold.medium,
								{ color: colors['background-header'] },
							]}
						>
							{t('modals.save-theme.add')}
						</TextNative>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

export const ThemeColorName: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	const [{}, { windowHeight }] = useStyles()

	return (
		<View style={[StyleSheet.absoluteFill, { elevation: 6, zIndex: 6 }]}>
			<TouchableOpacity
				activeOpacity={0}
				style={[
					StyleSheet.absoluteFill,
					{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: 0,
						right: 0,
						height: windowHeight,
					},
				]}
				onPress={() => closeModal()}
			>
				<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			</TouchableOpacity>
			<ThemeColorBody closeModal={closeModal} />
		</View>
	)
}

export default ThemeColorName
