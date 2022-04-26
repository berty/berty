import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StatusBar, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import LottieView from 'lottie-react-native'

import proximityLottie from '@berty/assets/lottie/proximity-lottie.json'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { setBlePerm } from '@berty/redux/reducers/networkConfig.reducer'
import { PermissionType, requestPermission } from '@berty/rnutil/checkPermissions'
import { useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'

export const BlePermission: ScreenFC<'Chat.BlePermission'> = ({ route: { params } }) => {
	const { accept, deny } = params
	const { text, border } = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	const { goBack } = useNavigation()
	const dispatch = useDispatch()

	const handleRequestPermission = React.useCallback(async () => {
		try {
			// request the permission
			const status = await requestPermission(PermissionType.proximity)
			// set new Ble status for toggle's condition in settings
			dispatch(setBlePerm(status))
			// check status
			switch (status) {
				case 'granted':
					await accept()
					break
				case 'unavailable':
					// TODO: dig why (on iOS) when i accept the request the status is unavailable
					await accept()
					break
				case 'blocked':
					await deny()
					break
			}
			goBack()
		} catch (err) {
			console.warn('handleRequestPermission error:', err)
		}
	}, [accept, deny, dispatch, goBack])

	return (
		<View style={{ flex: 1, backgroundColor: colors['background-header'] }}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
				<LottieView
					source={proximityLottie}
					autoPlay
					style={{
						marginVertical: 10,
					}}
				/>
			</View>
			<View
				style={[
					border.radius.top.large,
					{
						paddingVertical: 24,
						paddingHorizontal: 32,
						backgroundColor: colors['main-background'],
					},
				]}
			>
				<UnifiedText
					style={[
						text.size.huge,
						text.bold,
						{
							color: colors['background-header'],
							textAlign: 'center',
						},
					]}
				>
					{t('permission.proximity.title')}
				</UnifiedText>
				<UnifiedText
					style={[
						{
							lineHeight: 25,
							marginTop: 20,
							textAlign: 'center',
						},
					]}
				>
					{Platform.OS === 'ios'
						? t('permission.proximity.ios-desc')
						: t('permission.proximity.android-desc')}
				</UnifiedText>
				<View
					style={{
						width: '100%',
						paddingHorizontal: 20,
					}}
				>
					<TouchableOpacity
						onPress={async () => {
							await handleRequestPermission()
						}}
						style={{
							backgroundColor: colors['background-header'],
							paddingVertical: 16,
							alignItems: 'center',
							borderRadius: 12,
							marginTop: 20,
							width: '100%',
						}}
						activeOpacity={0.9}
					>
						<UnifiedText
							style={[text.size.scale(18), text.bold, { color: colors['reverted-main-text'] }]}
						>
							{t('permission.button-labels.allow')}
						</UnifiedText>
					</TouchableOpacity>
				</View>
				<TouchableOpacity
					onPress={async () => {
						await deny()
						goBack()
					}}
				>
					<UnifiedText
						style={{
							marginTop: 16,
							color: colors['secondary-text'],
							textTransform: 'uppercase',
							textAlign: 'center',
						}}
					>
						{t('permission.skip')}
					</UnifiedText>
				</TouchableOpacity>
			</View>
		</View>
	)
}
