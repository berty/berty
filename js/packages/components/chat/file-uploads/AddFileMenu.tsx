import React, { useState } from 'react'
import { View, Modal, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { useTranslation } from 'react-i18next'
import DocumentPicker from 'react-native-document-picker'
import ImagePicker from 'react-native-image-crop-picker'
import { request, check, RESULTS, PERMISSIONS } from 'react-native-permissions'
import beapi from '@berty-tech/api'

import { MenuListItem } from './MenuListItem'
import { GallerySection } from './GallerySection'
import { GifSection } from './GifSection'
import { TabItems } from './types'
import { SecurityAccess } from './SecurityAccess'
import { useClient } from '@berty-tech/store/hooks'

const amap = async <T extends any, C extends (value: T) => any>(arr: T[], cb: C) =>
	Promise.all(arr.map(cb))

export const AddFileMenu: React.FC<{ onClose: (medias?: string[]) => void }> = ({ onClose }) => {
	const [{ color, border, padding }] = useStyles()
	const { t }: { t: any } = useTranslation()
	const [activeTab, setActiveTab] = useState(TabItems.Default)
	const [isSecurityAccessVisible, setSecurityAccessVisibility] = useState(false)
	const [isLoading, setLoading] = useState(false)
	const client = useClient()

	const LIST_CONFIG = [
		{
			iconProps: {
				name: 'gallery',
				fill: activeTab === TabItems.Gallery ? '#383B63' : '#C7C8D8',
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
				fill: activeTab === TabItems.Camera ? '#383B63' : '#C7C8D8',
				pack: 'custom',
			},
			title: t('chat.files.camera'),
			onPress: async () => {
				setActiveTab(TabItems.Camera)
				try {
					const status = await check(
						Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
					)
					if (status !== RESULTS.GRANTED) {
						try {
							const status = await request(
								Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
							)
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
				fill: activeTab === TabItems.Files ? '#383B63' : '#C7C8D8',
				pack: 'custom',
			},
			title: t('chat.files.files'),
			onPress: async () => {
				setActiveTab(TabItems.Files)
				try {
					const res = await DocumentPicker.pick({
						type: [DocumentPicker.types.allFiles],
					})
					prepareMediaAndSend([
						{
							filename: res.name,
							uri: res.uri,
							mimeType: res.type,
						},
					])
				} catch (err) {
					if (DocumentPicker.isCancel(err)) {
						// ignore
					}
				}
			},
		},
		{
			iconProps: {
				name: 'bertyzzz',
				fill: 'white',
				pack: 'custom',
			},
			title: 'Bertyzz!',
			onPress: () => {
				// setActiveTab(TabItems.Bertyzz)
			},
		},
		{
			iconProps: {
				name: 'gif',
				fill: activeTab === TabItems.GIF ? '#383B63' : '#C7C8D8',
				pack: 'custom',
			},
			title: t('chat.files.gif'),
			onPress: async () => {
				setActiveTab(TabItems.GIF)
			},
		},
	]

	const prepareMediaAndSend = async (res: beapi.messenger.IMedia[]) => {
		if (isLoading) {
			return
		}
		setLoading(true)
		try {
			const mediaCids = (
				await amap(res, async (doc) => {
					const stream = await client?.mediaPrepare({})
					await stream?.emit({
						info: { filename: doc.filename, mimeType: doc.mimeType, displayName: doc.filename },
						uri: doc.uri,
					})
					const reply = await stream?.stopAndRecv()
					return reply?.cid
				})
			).filter((cid) => !!cid)

			onClose(mediaCids)
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
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'position' : 'height'}
				style={{
					zIndex: 999,
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
				}}
			>
				<View
					style={[
						{
							width: '100%',
						},
					]}
				>
					{isSecurityAccessVisible && (
						<SecurityAccess
							activeTab={activeTab}
							close={() => setSecurityAccessVisibility(false)}
						/>
					)}
					<View
						style={[
							{
								backgroundColor: color.white,
							},
							border.radius.top.large,
							border.shadow.big,
							padding.bottom.large,
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
							{LIST_CONFIG.map((listItem) => (
								<MenuListItem {...listItem} key={listItem.title} />
							))}
						</View>

						{activeTab === TabItems.Gallery && (
							<GallerySection prepareMediaAndSend={prepareMediaAndSend} isLoading={isLoading} />
						)}
						{activeTab === TabItems.GIF && <GifSection prepareMediaAndSend={prepareMediaAndSend} />}
					</View>
				</View>
			</KeyboardAvoidingView>
		</Modal>
	)
}
