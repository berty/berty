import React from 'react'
import {
	View,
	TouchableOpacity,
	Text as TextNative,
	StyleSheet,
	ImageBackground,
} from 'react-native'
import { RESULTS } from 'react-native-permissions'

import { Text, Icon } from '@ui-kitten/components'
import { BlurView } from '@react-native-community/blur'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'
import { useThemeColor } from '@berty-tech/store/hooks'
import WelcomeBackground from '@berty-tech/assets/welcome_bg.png'
import { useNavigation } from '@berty-tech/navigation'

import Avatar from './Buck_Berty_Icon_Card.svg'
import { checkPermissions } from '../utils'

const useStylesWelcome = () => {
	const [{ width, border, padding, margin }] = useStyles()
	return {
		welcomeButton: [
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

export const Body: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	const [{ row, text, margin, padding, border }, { scaleHeight }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const _styles = useStylesWelcome()
	const { navigate } = useNavigation()
	const { persistentOptions, setPersistentOption } = useMsgrContext()

	const handleSkip = async () => {
		closeModal()

		const notificationStatus = await checkPermissions('notification', {
			isToNavigate: false,
		})

		if (notificationStatus === RESULTS.GRANTED) {
			await setPersistentOption({
				type: PersistentOptionsKeys.Configurations,
				payload: {
					...persistentOptions.configurations,
					notification: {
						...persistentOptions.configurations.notification,
						state: 'added',
					},
				},
			})
		}
	}

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
						backgroundColor: colors['background-header'],
						overflow: 'hidden',
					},
				]}
			>
				<ImageBackground
					source={WelcomeBackground}
					style={[padding.horizontal.medium, padding.bottom.medium]}
				>
					<View style={[margin.top.scale(70 * scaleHeight)]}>
						<Icon
							name='info-outline'
							fill={colors['reverted-main-text']}
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
								{ fontFamily: 'Open Sans', color: colors['reverted-main-text'] },
							]}
						>
							{t('modals.welcome-configuration.title')}
						</TextNative>
						<Text style={[text.align.center, padding.top.scale(20), padding.horizontal.medium]}>
							<TextNative
								style={[
									text.bold.small,
									text.size.medium,
									{ fontFamily: 'Open Sans', color: colors['reverted-main-text'] },
								]}
							>
								{t('modals.welcome-configuration.desc')}
							</TextNative>
						</Text>
					</View>
					<View style={[row.center, padding.top.medium]}>
						<TouchableOpacity
							style={[
								margin.bottom.medium,
								_styles.welcomeButton,
								{
									flexDirection: 'row',
									justifyContent: 'center',
									backgroundColor: colors['main-background'],
								},
							]}
							onPress={handleSkip}
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
								{t('modals.welcome-configuration.skip')}
							</TextNative>
						</TouchableOpacity>
						<TouchableOpacity
							style={[
								margin.bottom.medium,
								_styles.welcomeButton,
								{
									flexDirection: 'row',
									justifyContent: 'center',
									backgroundColor: colors['positive-asset'],
								},
							]}
							onPress={async () => {
								closeModal()
								if (persistentOptions.preset.value === 'fullAnonymity') {
									navigate.main.networkOptions({ checkNotificationPermission: true })
								} else {
									navigate.onboarding.servicesAuth({ checkNotificationPermission: true })
								}
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
								{t('modals.welcome-configuration.next')}
							</TextNative>
						</TouchableOpacity>
					</View>
				</ImageBackground>
			</View>
		</View>
	)
}

export const WelcomeConfiguration: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	return (
		<View style={[StyleSheet.absoluteFill, { elevation: 6 }]}>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<Body closeModal={closeModal} />
		</View>
	)
}

export default WelcomeConfiguration
