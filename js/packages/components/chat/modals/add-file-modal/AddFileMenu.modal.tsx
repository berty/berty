import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Platform, StyleSheet } from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import ImagePicker from 'react-native-image-crop-picker'
import { RESULTS } from 'react-native-permissions'

import beapi from '@berty/api'
import { useMessengerClient, useThemeColor } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import { checkPermissions } from '@berty/utils/react-native/checkPermissions'
import { getPath } from '@berty/utils/react-native/file-system'
import { PermissionType } from '@berty/utils/react-native/permissions'

import { GallerySection } from './GallerySection'
import { ListItemMenu } from './ListItemMenu'
import { SecurityAccess } from './SecurityAccess'
import { TabItems } from './types'

const amap = async <T extends any, C extends (value: T) => any>(arr: T[], cb: C) =>
	Promise.all(arr.map(cb))

export const AddFileMenu: React.FC<{
	onClose: (medias?: beapi.messenger.IMedia[]) => void
	sending?: boolean
	setSending: (val: boolean) => void
}> = ({ onClose, sending, setSending }) => {
	const { t } = useTranslation()
	const [activeTab, setActiveTab] = useState(TabItems.Default)
	const [isSecurityAccessVisible, setSecurityAccessVisibility] = useState(false)
	const client = useMessengerClient()
	const colors = useThemeColor()
	const { navigate } = useNavigation()

	const prepareMediaAndSend = useCallback(
		async (res: (beapi.messenger.IMedia & { uri?: string })[]) => {
			try {
				if (sending) {
					return
				}
				setSending(true)
				const mediaCids = (
					await amap(res, async doc => {
						const stream = await client?.mediaPrepare({})
						await stream?.emit({
							info: {
								filename: doc.filename,
								mimeType: doc.mimeType,
								displayName: doc.displayName || doc.filename || 'document',
							},
							uri: doc.uri,
						})
						const reply = await stream?.stopAndRecv()
						return reply?.cid
					})
				).filter(cid => !!cid)
				onClose(
					res.map(
						(doc, i): beapi.messenger.IMedia => ({
							cid: mediaCids[i],
							filename: doc.filename,
							mimeType: doc.mimeType,
							displayName: doc.displayName || doc.filename || 'document',
						}),
					),
				)
			} catch (err) {
				console.warn('error while preparing files:', err)
			}
			setSending(false)
		},
		[client, onClose, sending, setSending],
	)

	const openCamera = useCallback(async () => {
		setActiveTab(TabItems.Camera)
		try {
			await ImagePicker.clean()
		} catch (err) {
			console.warn('failed to clean image picker:', err)
		}
		try {
			const image = await ImagePicker.openCamera({
				cropping: false,
			})

			await prepareMediaAndSend([
				{
					filename: '',
					uri: image.path || image.sourceURL || '',
					mimeType: image.mime,
				},
			])
		} catch (err) {
			console.warn(err)
		}
		onClose()
	}, [prepareMediaAndSend, onClose])

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
			onPress: async () => {
				const status = await checkPermissions(PermissionType.gallery, {
					navigate,
					navigateToPermScreenOnProblem: true,
					onComplete: () => {
						setActiveTab(TabItems.Gallery)
					},
				})
				if (status === RESULTS.GRANTED) {
					setActiveTab(TabItems.Gallery)
				}
			},
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
			onPress: async () => {
				const status = await checkPermissions(PermissionType.camera, {
					navigate,
					navigateToPermScreenOnProblem: true,
					onComplete: async () => {
						await openCamera()
					},
				})
				if (status === RESULTS.BLOCKED || status === RESULTS.DENIED) {
					return
				}
				await openCamera()
			},
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
			onPress: async () => {
				setActiveTab(TabItems.Files)
				try {
					const res = await DocumentPicker.pickSingle({
						type: [DocumentPicker.types.allFiles],
					})
					let uri = res.uri
					if (Platform.OS === 'android') {
						uri = await getPath(uri)
					}
					await prepareMediaAndSend([
						{
							filename: res.name,
							uri: uri,
							mimeType: res.type,
						},
					])
				} catch (err) {
					if (DocumentPicker.isCancel(err)) {
						// ignore
					} else {
						console.warn(err)
					}
				}
			},
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
				<GallerySection prepareMediaAndSend={prepareMediaAndSend} />
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
