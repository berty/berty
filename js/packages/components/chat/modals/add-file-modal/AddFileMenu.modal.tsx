import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { useMessengerClient, useThemeColor } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import {
	handlePressCamera,
	handlePressFiles,
	handlePressGallery,
	prepareMediaAndSend,
} from '@berty/utils/permissions/handle-press-permissions'

import { GallerySection } from './GallerySection'
import { ListItemMenu } from './ListItemMenu'
import { SecurityAccess } from './SecurityAccess'
import { TabItems } from './types'

export const AddFileMenu: React.FC<{
	onClose: (value: beapi.messenger.IMedia[] | undefined) => Promise<void>
	sending: boolean
	setSending: (val: boolean) => void
}> = ({ onClose, sending, setSending }) => {
	const { t } = useTranslation()
	const [activeTab, setActiveTab] = useState(TabItems.Default)
	const [isSecurityAccessVisible, setSecurityAccessVisibility] = useState(false)
	const client = useMessengerClient()
	const colors = useThemeColor()
	const { navigate } = useNavigation()

	const handlePressButton = React.useCallback(
		async (tabType: TabItems) => {
			setActiveTab(tabType)
			if (sending) {
				return
			}
			switch (tabType) {
				case TabItems.Camera:
					await handlePressCamera({
						setSending,
						messengerClient: client,
						onClose,
						navigate,
					})
					break
				case TabItems.Files:
					await handlePressFiles({ setSending, messengerClient: client, onClose })
					break
				case TabItems.Gallery:
					await handlePressGallery({
						setSending,
						messengerClient: client,
						onClose,
						navigate,
					})
					break
				default:
					break
			}
		},
		[client, navigate, onClose, sending, setSending],
	)

	const LIST_CONFIG = [
		{
			iconProps: {
				name: 'gallery',
				fill:
					activeTab === TabItems.Gallery
						? colors['alt-secondary-background-header']
						: colors['negative-asset'],
				pack: 'custom',
			},
			title: t('chat.files.gallery'),
			onPress: async () => await handlePressButton(TabItems.Gallery),
		},
		{
			iconProps: {
				name: 'camera',
				fill:
					activeTab === TabItems.Camera
						? colors['alt-secondary-background-header']
						: colors['negative-asset'],
				pack: 'custom',
			},
			title: t('chat.files.camera'),
			onPress: async () => await handlePressButton(TabItems.Camera),
		},
		{
			iconProps: {
				name: 'files',
				fill:
					activeTab === TabItems.Files
						? colors['alt-secondary-background-header']
						: colors['negative-asset'],
				pack: 'custom',
			},
			title: t('chat.files.files'),
			onPress: async () => await handlePressButton(TabItems.Files),
		},
	]

	return (
		<>
			{isSecurityAccessVisible && (
				<SecurityAccess activeTab={activeTab} close={() => setSecurityAccessVisibility(false)} />
			)}
			<View style={styles.container}>
				{LIST_CONFIG.map(listItem => (
					<ListItemMenu {...listItem} key={listItem.title} />
				))}
			</View>
			{activeTab === TabItems.Gallery && (
				<GallerySection
					prepareMediaAndSend={async (media: beapi.messenger.IMedia[]) => {
						if (sending) {
							return
						}
						await prepareMediaAndSend({
							setSending,
							messengerClient: client,
							onClose,
							res: media,
						})
					}}
				/>
			)}
		</>
	)
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		alignItems: 'center',
		justifyContent: 'center',
	},
})
