import { Icon } from '@ui-kitten/components'
import React, { useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { View, TouchableOpacity, AppState, Platform, StyleSheet } from 'react-native'
import { RESULTS, openSettings } from 'react-native-permissions'

import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'
import { PermissionType, getPermissions } from '@berty/utils/react-native/permissions'

import { TabItems } from './types'

export const SecurityAccess: React.FC<{ close: () => void; activeTab: TabItems }> = ({
	activeTab,
	close,
}) => {
	const { border, padding, margin } = useStyles()
	const { t } = useTranslation()
	const colors = useThemeColor()

	const handleAppStateChange = useCallback(
		async (state: string) => {
			if (state === 'active') {
				if (activeTab === TabItems.Camera) {
					try {
						const status = (await getPermissions())[PermissionType.camera]
						if (status === RESULTS.GRANTED) {
							close()
						}
					} catch (err) {
						console.warn('failed to check camera permission:', err)
					}
				} else if (activeTab === TabItems.Gallery && Platform.OS === 'ios') {
					try {
						const status = (await getPermissions())[PermissionType.gallery]

						if (status === RESULTS.GRANTED) {
							close()
						}
					} catch (err) {}
				} else if (activeTab === TabItems.Record) {
					try {
						const status = (await getPermissions())[PermissionType.audio]

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

	const CONFIG: {
		tab: TabItems
		iconName: string
		title: string
		onPress: () => Promise<void>
	}[] = [
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
					},
					styles.header,
					padding.small,
					border.radius.top.large,
				]}
			>
				<UnifiedText style={{ textAlign: 'center' }}>{t('chat.files.security-access')}</UnifiedText>
				<TouchableOpacity onPress={close} style={styles.iconWrapper}>
					<Icon
						name='close-circle-outline'
						fill={colors['positive-asset']}
						height={40}
						width={40}
					/>
				</TouchableOpacity>
			</View>
			<TouchableOpacity onPress={activeTabConfig.onPress} style={[padding.small, styles.content]}>
				<Icon
					name={activeTabConfig.iconName}
					fill={colors['secondary-text']}
					height={36}
					width={36}
					pack='custom'
				/>
				<UnifiedText
					style={[
						margin.tiny,
						padding.horizontal.large,
						padding.vertical.small,
						{ textAlign: 'center' },
					]}
				>
					{t('chat.files.security-access-desc')} {activeTabConfig.title}
				</UnifiedText>
			</TouchableOpacity>
		</View>
	)
}

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconWrapper: {
		position: 'absolute',
		right: 20,
	},
	content: {
		alignItems: 'center',
		justifyContent: 'center',
	},
})
