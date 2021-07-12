import React from 'react'
import {
	View,
	TouchableOpacity,
	Text as TextNative,
	StyleSheet,
	ImageBackground,
} from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { BlurView } from '@react-native-community/blur'
import { useTranslation } from 'react-i18next'
import { useStyles } from '@berty-tech/styles'
import { PersistentOptionsKeys, useMsgrContext } from '@berty-tech/store/context'
import WelcomeBackground from '@berty-tech/assets/welcome_bg.png'
import { useNavigation } from '@berty-tech/navigation'

import Avatar from './Buck_Berty_Icon_Card.svg'
import { checkPermissions } from '../utils'
import { RESULTS } from 'react-native-permissions'

const useStylesWelcome = () => {
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

export const Body: React.FC<{ closeModal: () => void }> = ({ closeModal }) => {
	const [{ row, text, margin, color, padding, background, border }, { scaleHeight }] = useStyles()
	const { t } = useTranslation()
	const _styles = useStylesWelcome()
	const { navigate } = useNavigation()
	const { persistentOptions, setPersistentOption } = useMsgrContext()

	const handleSkip = async () => {
		closeModal()

		const p2pStatus = await checkPermissions(['p2p'], { isToNavigate: false })

		const notificationStatus = await checkPermissions(['notification'], {
			isToNavigate: false,
		})

		if (p2pStatus === RESULTS.GRANTED) {
			const state = true
			await setPersistentOption({
				type: PersistentOptionsKeys.BLE,
				payload: {
					enable: state,
				},
			})
			await setPersistentOption({
				type: PersistentOptionsKeys.MC,
				payload: {
					enable: state,
				},
			})
			await setPersistentOption({
				type: PersistentOptionsKeys.Nearby,
				payload: {
					enable: state,
				},
			})
		}
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
						backgroundColor: '#4147D8',
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
								{ fontFamily: 'Open Sans' },
							]}
						>
							{t('modals.welcome-configuration.title')}
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
								{t('modals.welcome-configuration.desc')}
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
							onPress={handleSkip}
						>
							<Icon
								name='close'
								width={30}
								height={30}
								fill={color.grey}
								style={row.item.justify}
							/>
							<TextNative
								style={[
									text.color.grey,
									padding.left.small,
									row.item.justify,
									text.size.scale(16),
									text.bold.medium,
									{ fontFamily: 'Open Sans' },
								]}
							>
								{t('modals.welcome-configuration.skip')}
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
								if (persistentOptions.preset.value === 'full-anonymity') {
									navigate.main.networkOptions()
								} else {
									navigate.onboarding.servicesAuth()
								}
							}}
						>
							<Icon
								name='checkmark-outline'
								width={30}
								height={30}
								fill={color.blue}
								style={row.item.justify}
							/>
							<TextNative
								style={[
									text.color.blue,
									padding.left.small,
									row.item.justify,
									text.size.scale(16),
									text.bold.medium,
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
		<View style={[StyleSheet.absoluteFill]}>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<Body closeModal={closeModal} />
		</View>
	)
}

export default WelcomeConfiguration
