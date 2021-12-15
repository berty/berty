import React, { useState } from 'react'
import { View, Modal, Platform, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import DocumentPicker from 'react-native-document-picker'
import { request, check, RESULTS, PERMISSIONS } from 'react-native-permissions'
import ImagePicker from 'react-native-image-crop-picker'
import getPath from '@flyerhq/react-native-android-uri-path'

import { useStyles } from '@berty-tech/styles'
import { useMessengerClient, useThemeColor } from '@berty-tech/store'
import beapi from '@berty-tech/api'
import rnutil from '@berty-tech/rnutil'
import { useNavigation } from '@berty-tech/navigation'

import { MenuListItem } from './MenuListItem'
import { GallerySection } from './GallerySection'
import { TabItems } from './types'
import { SecurityAccess } from './SecurityAccess'

const amap = async <T extends any, C extends (value: T) => any>(arr: T[], cb: C) =>
	Promise.all(arr.map(cb))

export const AddFileMenu: React.FC<{ onClose: (medias?: beapi.messenger.IMedia[]) => void }> = ({
	onClose,
}) => {
	const [{ border, padding }] = useStyles()
	const { t }: { t: any } = useTranslation()
	const [activeTab, setActiveTab] = useState(TabItems.Default)
	const [isSecurityAccessVisible, setSecurityAccessVisibility] = useState(false)
	const [isLoading, setLoading] = useState(false)
	const client = useMessengerClient()
	const colors = useThemeColor()
	const navigate = useNavigation()

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
				setActiveTab(TabItems.Gallery)
				if (Platform.OS === 'ios') {
					try {
						const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY)
						if (status !== RESULTS.GRANTED) {
							try {
								const status = await request(PERMISSIONS.IOS.PHOTO_LIBRARY)
								if (status !== RESULTS.GRANTED) {
									setSecurityAccessVisibility(true)
									return
								}
							} catch (err) {
								console.log(err)
							}
						}
					} catch (err) {
						console.log(err)
					}
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
				setActiveTab(TabItems.Camera)
				const permissionStatus = await rnutil.checkPermissions('camera', navigate)
				if (permissionStatus !== RESULTS.GRANTED) {
					console.warn('camera permission:', permissionStatus)
					return
				}
				try {
					await ImagePicker.clean()
				} catch (err) {}
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
						uri = 'file://' + getPath(uri)
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

	const prepareMediaAndSend = async (res: (beapi.messenger.IMedia & { uri?: string })[]) => {
		if (isLoading) {
			return
		}
		setLoading(true)
		try {
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
		} catch (err) {}
		setLoading(false)
	}

	return (
		<Modal
			transparent
			visible
			animationType='slide'
			style={{
				position: 'relative',
				flex: 1,
				height: '100%',
			}}
		>
			<TouchableOpacity
				style={{
					flex: 1,
				}}
				onPress={() => {
					onClose()
				}}
			/>
			<View
				style={{
					zIndex: 999,
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
				}}
			>
				<View style={{ width: '100%' }}>
					{isSecurityAccessVisible && (
						<SecurityAccess
							activeTab={activeTab}
							close={() => setSecurityAccessVisibility(false)}
						/>
					)}
					<View
						style={[
							border.radius.top.large,
							border.shadow.big,
							padding.bottom.large,
							{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
						]}
					>
						<View
							style={{
								flexDirection: 'row',
								flexWrap: 'wrap',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							{LIST_CONFIG.map(listItem => (
								<MenuListItem {...listItem} key={listItem.title} />
							))}
						</View>
						{activeTab === TabItems.Gallery && (
							<GallerySection prepareMediaAndSend={prepareMediaAndSend} isLoading={isLoading} />
						)}
					</View>
				</View>
			</View>
		</Modal>
	)
}
