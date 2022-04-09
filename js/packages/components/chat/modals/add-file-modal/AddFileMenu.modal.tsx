import React, { useCallback, useState } from 'react'
import { View, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import DocumentPicker from 'react-native-document-picker'
import { RESULTS } from 'react-native-permissions'
import ImagePicker from 'react-native-image-crop-picker'

import { useMessengerClient, useThemeColor } from '@berty/store'
import beapi from '@berty/api'
import { useNavigation } from '@berty/navigation'
import { checkPermissions, PermissionType } from '@berty/rnutil/checkPermissions'

import { ListItemMenu } from './ListItemMenu'
import { GallerySection } from './GallerySection'
import { TabItems } from './types'
import { SecurityAccess } from './SecurityAccess'
import { getPath } from '@berty/rnutil/getPath'

const amap = async <T extends any, C extends (value: T) => any>(arr: T[], cb: C) =>
	Promise.all(arr.map(cb))

export const AddFileMenu: React.FC<{
	onClose: (medias?: beapi.messenger.IMedia[]) => void
	sending?: boolean
	setSending: (val: boolean) => void
}> = ({ onClose, sending, setSending }) => {
	const { t }: { t: any } = useTranslation()
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

			prepareMediaAndSend([
				{
					filename: '',
					uri: image.path || image.sourceURL || '',
					mimeType: image.mime,
				},
			])
		} catch (err) {
			console.warn(err)
		}
	}, [prepareMediaAndSend])

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
					onComplete: () => {
						openCamera()
					},
				})
				if (status === RESULTS.GRANTED) {
					openCamera()
				} else {
					console.warn('camera permission:', status)
					return
				}
				try {
					await ImagePicker.clean()
				} catch (err) {
					console.warn('failed to clean image picker:', err)
				}
				try {
					const image = await ImagePicker.openCamera({
						cropping: false,
					})

					if (image) {
						prepareMediaAndSend([
							{
								filename: '',
								uri: image.path || image.sourceURL || '',
								mimeType: image.mime,
							},
						])
					}
				} catch (err) {
					console.log(err)
				}
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
					prepareMediaAndSend([
						{
							filename: res.name,
							uri: uri,
							mimeType: res.type,
						},
					])
				} catch (err: any) {
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
			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
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
