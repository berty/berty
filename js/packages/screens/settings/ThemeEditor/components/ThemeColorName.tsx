import { BlurView } from '@react-native-community/blur'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'

import Avatar from '@berty/assets/logo/buck_berty_icon_card.svg'
<<<<<<< HEAD
import {
	TwoHorizontalButtons,
	PrimaryButtonIconLeft,
	SecondaryButtonIconLeft,
} from '@berty/components'
=======
>>>>>>> e4edfd187751da22d2fda64af1e4162bcfb202d4
import { SmallInput } from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { saveTheme } from '@berty/redux/reducers/theme.reducer'
import { useThemeColor } from '@berty/store'

const ThemeColorBody: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	const [themeName, setThemeName] = React.useState<string>('')
<<<<<<< HEAD
	const { text, margin, padding, border } = useStyles()
=======
	const { row, text, margin, padding, border, opacity } = useStyles()
>>>>>>> e4edfd187751da22d2fda64af1e4162bcfb202d4
	const { scaleHeight } = useAppDimensions()
	const colors = useThemeColor()
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

						<View style={[margin.top.medium]}>
							<SmallInput
								value={themeName}
								onChangeText={setThemeName}
								placeholder={t('modals.save-theme.placeholder')}
							/>
						</View>
					</View>
				</View>
<<<<<<< HEAD

				<View style={[margin.top.medium, margin.horizontal.medium]}>
					<TwoHorizontalButtons>
						<SecondaryButtonIconLeft name='close' onPress={closeModal}>
=======
				<View style={[row.center, margin.top.small]}>
					<TouchableOpacity
						style={[
							margin.bottom.medium,
							opacity(0.5),
							_styles.skipButton,
							{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
						]}
						onPress={async () => closeModal()}
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
>>>>>>> e4edfd187751da22d2fda64af1e4162bcfb202d4
							{t('modals.save-theme.cancel')}
						</SecondaryButtonIconLeft>
						<PrimaryButtonIconLeft
							onPress={() => {
								dispatch(saveTheme({ themeName }))
								closeModal()
							}}
						>
							{t('modals.save-theme.add')}
						</PrimaryButtonIconLeft>
					</TwoHorizontalButtons>
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
