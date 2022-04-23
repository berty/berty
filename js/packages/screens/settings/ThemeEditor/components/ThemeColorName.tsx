import React from 'react'
import { View, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'

import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'
import { saveTheme } from '@berty/redux/reducers/theme.reducer'
import { BlurView } from '@react-native-community/blur'

import Avatar from '@berty/assets/logo/buck_berty_icon_card.svg'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStylesDefaultModal } from '@berty/hooks'

const ThemeColorBody: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	const [themeName, setThemeName] = React.useState<string>('')
	const { row, text, margin, padding, border, opacity } = useStyles()
	const { scaleHeight, scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const _styles = useStylesDefaultModal()
	const { t } = useTranslation()
	const dispatch = useDispatch()

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
						shadowColor: colors.shadow,
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
					{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
				]}
			>
				<View style={[margin.top.scale(70 * scaleHeight)]}>
					<UnifiedText style={[text.align.center, padding.top.small, text.size.large, text.bold]}>
						{`🎨 ${t('modals.save-theme.title')}`}
					</UnifiedText>
					<View
						style={[padding.top.scale(20), padding.horizontal.medium, { flexDirection: 'column' }]}
					>
						<View>
							<UnifiedText style={[text.light]}>{t('modals.save-theme.desc')}</UnifiedText>
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
									text.light,
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
						<UnifiedText
							style={[
								padding.left.small,
								row.item.justify,
								text.bold,
								{ color: colors['negative-asset'], textTransform: 'uppercase' },
							]}
						>
							{t('modals.save-theme.cancel')}
						</UnifiedText>
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
						onPress={() => {
							dispatch(saveTheme({ themeName }))
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
						<UnifiedText
							style={[
								padding.left.small,
								row.item.justify,
								text.bold,
								{ color: colors['background-header'], textTransform: 'uppercase' },
							]}
						>
							{t('modals.save-theme.add')}
						</UnifiedText>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	)
}

export const ThemeColorName: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	const { windowHeight } = useAppDimensions()

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
				onPress={async () => {
					closeModal()
				}}
			>
				<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			</TouchableOpacity>
			<ThemeColorBody closeModal={closeModal} />
		</View>
	)
}
