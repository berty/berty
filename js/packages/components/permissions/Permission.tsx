import LottieView, { AnimatedLottieViewProps } from 'lottie-react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'
import { PermissionStatus, RESULTS } from 'react-native-permissions'

import audioLottie from '@berty/assets/lottie/audio-lottie.json'
import cameraLottie from '@berty/assets/lottie/camera-lottie.json'
import notificationLottie from '@berty/assets/lottie/notification-lottie.json'
import proximityLottie from '@berty/assets/lottie/proximity-lottie.json'
import { PrimaryButton, TertiaryAltButton } from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { PermissionType } from '@berty/utils/permissions/permissions'

const animations: Record<PermissionType, AnimatedLottieViewProps['source']> = {
	audio: audioLottie,
	camera: cameraLottie,
	notification: notificationLottie,
	proximity: proximityLottie,
	gallery: cameraLottie, // get a lottie file for gallery
}

interface PermissionProps {
	permissionType: PermissionType
	permissionStatus: PermissionStatus
	onPressPrimary: () => Promise<void>
	onPressSecondary: () => Promise<void> | void
}

export const Permission: React.FC<PermissionProps> = ({
	permissionType,
	permissionStatus,
	onPressPrimary,
	onPressSecondary,
}) => {
	const colors = useThemeColor()
	const { border, margin, flex } = useStyles()
	const { t } = useTranslation()

	const altText =
		permissionType === PermissionType.notification ? t('permission.skip') : t('permission.cancel')

	return (
		<View style={[flex.tiny, { backgroundColor: colors['background-header'] }]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<View style={[styles.lottieContainer]}>
				<LottieView source={animations[permissionType]} autoPlay style={[styles.lottie]} />
			</View>
			<View
				style={[
					border.radius.top.large,
					styles.card,
					{ backgroundColor: colors['main-background'] },
				]}
			>
				<UnifiedText style={[styles.title, { color: colors['background-header'] }]}>
					{/* Ignore check for i18n missing keys
						permission.notification.title
						permission.proximity.title
						permission.camera.title
						permission.audio.title
						permission.gallery.title
					*/}
					{t(`permission.${permissionType}.title`)}
				</UnifiedText>
				<UnifiedText style={[styles.desc]}>
					{/* Ignore check for i18n missing keys
						permission.notification.desc
						permission.camera.desc
						permission.audio.desc
						permission.gallery.desc
					*/}
					{permissionType === PermissionType.proximity
						? Platform.OS === 'ios'
							? t('permission.proximity.ios-desc')
							: t('permission.proximity.android-desc')
						: t(`permission.${permissionType}.desc`)}
				</UnifiedText>
				{permissionStatus === RESULTS.BLOCKED && (
					<UnifiedText style={[styles.blocked]}>
						{t('permission.settings-text', { title: t(`permission.${permissionType}.title`) })}
					</UnifiedText>
				)}
				<View style={[styles.primary, margin.top.medium]}>
					<PrimaryButton onPress={onPressPrimary}>
						{/* Ignore check for i18n missing keys
								permission.button-labels.settings
								permission.button-labels.allow
							*/}
						{t(
							`permission.button-labels.${
								permissionStatus === RESULTS.BLOCKED ? 'settings' : 'allow'
							}`,
						)}
					</PrimaryButton>
				</View>
				<TertiaryAltButton onPress={onPressSecondary} accessibilityLabel={altText}>
					{altText}
				</TertiaryAltButton>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	lottieContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
	lottie: {
		marginVertical: 10,
	},
	card: {
		paddingTop: 24,
		paddingBottom: 30,
		paddingHorizontal: 32,
	},
	title: {
		textAlign: 'center',
		fontSize: 26,
		fontFamily: 'Bold Open Sans',
	},
	desc: {
		lineHeight: 25,
		marginTop: 20,
		textAlign: 'center',
	},
	blocked: {
		lineHeight: 25,
		marginTop: 10,
		fontSize: 17,
	},
	primary: {
		width: '100%',
		paddingHorizontal: 20,
	},
})
