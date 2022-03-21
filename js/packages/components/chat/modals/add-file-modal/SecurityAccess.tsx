import React, { useEffect, useCallback } from 'react'

import { Text, Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { View, TouchableOpacity, AppState, Platform } from 'react-native'
import { check, RESULTS, PERMISSIONS, openSettings } from 'react-native-permissions'

import { useThemeColor } from '@berty-tech/store/hooks'
import { useStyles } from '@berty-tech/styles'

import { TabItems } from './types'

export const SecurityAccess: React.FC<{ close: () => void; activeTab: TabItems }> = ({
	activeTab,
	close,
}) => {
	const [{ border, padding, margin }, { scaleSize }] = useStyles()
	const { t }: { t: any } = useTranslation()
	const colors = useThemeColor()

	const handleAppStateChange = useCallback(
		async (state: string) => {
			if (state === 'active') {
				if (activeTab === TabItems.Camera) {
					try {
						const status = await check(
							Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA,
						)
						if (status === RESULTS.GRANTED) {
							close()
						}
					} catch (err) {
						console.warn('failed to check camera permission:', err)
					}
				} else if (activeTab === TabItems.Gallery && Platform.OS === 'ios') {
					try {
						const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)

						if (status === RESULTS.GRANTED) {
							close()
						}
					} catch (err) {}
				} else if (activeTab === TabItems.Record) {
					try {
						const status = await check(
							Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
						)

						if (status === RESULTS.GRANTED) {
							close()
						}
					} catch (err) {}
				}
			}
		},
		[activeTab, close],
	)

	useEffect(() => {
		AppState.addEventListener('change', handleAppStateChange)
		return () => {
			AppState.removeEventListener('change', handleAppStateChange)
		}
	}, [handleAppStateChange])

	const CONFIG = [
		{
			tab: TabItems.Gallery,
			iconName: 'gallery',
			title: t('chat.files.gallery'),
			onPress: async () => {
				try {
					await openSettings()
				} catch (err) {}
			},
		},
		{
			tab: TabItems.Camera,
			iconName: 'camera',
			title: t('chat.files.camera'),
			onPress: async () => {
				try {
					await openSettings()
				} catch (err) {}
			},
		},
		{
			tab: TabItems.Record,
			iconName: 'microphone',
			title: t('chat.files.microphone'),
			onPress: async () => {
				try {
					await openSettings()
				} catch (err) {}
			},
		},
	]

	const activeTabConfig = CONFIG.find(config => activeTab === config.tab)

	if (!activeTabConfig) {
		return null
	}

	return (
		<View style={{ backgroundColor: colors['main-background'] }}>
			<View
				style={[
					{
						backgroundColor: colors['positive-asset'],
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'center',
					},
					padding.small,
					border.radius.top.large,
				]}
			>
				<Text style={{ textAlign: 'center' }}>{t('chat.files.security-access')}</Text>
				<TouchableOpacity
					onPress={close}
					style={{
						position: 'absolute',
						right: 20,
					}}
				>
					<Icon
						name='close-circle-outline'
						fill={colors['positive-asset']}
						height={40}
						width={40}
					/>
				</TouchableOpacity>
			</View>
			<TouchableOpacity
				onPress={activeTabConfig.onPress}
				style={[
					padding.small,
					{
						alignItems: 'center',
						justifyContent: 'center',
					},
				]}
			>
				<Icon
					name={activeTabConfig.iconName}
					fill={colors['secondary-text']}
					height={36 * scaleSize}
					width={36 * scaleSize}
					pack='custom'
				/>
				<Text
					style={[
						margin.tiny,
						padding.horizontal.large,
						padding.vertical.small,
						{ textAlign: 'center' },
					]}
				>
					{t('chat.files.security-access-desc')} {t(activeTabConfig.title)}
				</Text>
			</TouchableOpacity>
		</View>
	)
}
