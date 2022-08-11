import Clipboard from '@react-native-clipboard/clipboard'
import { Icon } from '@ui-kitten/components'
import LinkifyIt from 'linkify-it'
import React, { useState, useEffect } from 'react'
import {
	View,
	ScrollView,
	TouchableOpacity,
	StatusBar,
	Image,
	Dimensions,
	Linking,
	Share,
	Platform,
} from 'react-native'
import RNFS from 'react-native-fs'
import Hyperlink from 'react-native-hyperlink'
import { TabView, SceneMap } from 'react-native-tab-view'
import { useSelector } from 'react-redux'
import tlds from 'tlds'

import beapi from '@berty/api'
import { isBertyDeepLink } from '@berty/components/chat/message/user-message/user-message-box/HyperlinkUserMessage'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useConversationInteractions, useMessengerClient, useThemeColor } from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { selectProtocolClient } from '@berty/redux/reducers/ui.reducer'
import { pbDateToNum, timeFormat } from '@berty/utils/convert/time'
import { retrieveMediaBytes } from '@berty/utils/messenger/media'
import { getSource } from '@berty/utils/protocol/attachments'
import { Maybe } from '@berty/utils/type/maybe'

import { TabSwitch } from './components/TabSwitch'

const initialLayout = { width: Dimensions.get('window').width }
const linkify = LinkifyIt().tlds(tlds, true)

const iconInfoFromMimeType = (mimeType: Maybe<string>): { name: string; pack?: string } => {
	if (mimeType) {
		if (mimeType.startsWith('audio')) {
			return { name: 'headphones' }
		}
		if (mimeType.startsWith('image')) {
			return { name: 'image' }
		}
	}
	return { name: 'file' }
}

export const SharedMedias: ScreenFC<'Chat.SharedMedias'> = ({
	route: {
		params: { convPk },
	},
	navigation: { navigate },
}) => {
	const { flex, margin, text, padding, border } = useStyles()
	const colors = useThemeColor()
	const [activeIndex, setActiveIndex] = useState(0)
	const protocolClient = useSelector(selectProtocolClient)
	const [images, setImages] = useState<any[]>([])
	const client = useMessengerClient()

	const messages = useConversationInteractions(convPk).filter(
		msg =>
			msg.type === beapi.messenger.AppMessage.Type.TypeUserMessage ||
			msg.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation ||
			msg.type === beapi.messenger.AppMessage.Type.TypeMonitorMetadata,
	)

	const pictures = React.useMemo(() => {
		return messages
			.reverse()
			.filter(inte => inte?.medias?.[0]?.mimeType?.startsWith('image'))
			.reduce((arr, current) => [...arr, ...(current.medias || [])], [] as beapi.messenger.IMedia[])
	}, [messages])

	const documents = React.useMemo(() => {
		return messages
			.reverse()
			.filter(inte => inte?.medias?.[0] && !inte.medias?.[0].mimeType?.startsWith('image'))
			.reduce((arr, current) => {
				if (!current.medias?.length) {
					return arr
				}
				return [
					...arr,
					{ ...current.medias[0], sentDate: current.sentDate as unknown as number | Date },
				]
			}, [] as (beapi.messenger.IMedia & { sentDate: number | Date })[])
	}, [messages])

	const links = React.useMemo(() => {
		return messages
			.reverse()
			.filter(
				inte =>
					inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage &&
					linkify.test(inte.payload?.body || ''),
			)
			.reduce((arr, current) => {
				if (current?.type !== beapi.messenger.AppMessage.Type.TypeUserMessage) {
					return arr
				}
				return [
					...arr,
					...(linkify.match(current.payload?.body || '') as { url: string }[]).map(item => ({
						url: item.url,
						sentDate: pbDateToNum(current.sentDate),
					})),
				]
			}, [] as { url: string; sentDate: number }[])
	}, [messages])

	useEffect(() => {
		if (!protocolClient) {
			return
		}

		Promise.all(
			pictures.map(async media => {
				try {
					const src = await getSource(protocolClient, media.cid)

					return { ...media, uri: `data:${media.mimeType};base64,${src}` }
				} catch (e) {
					console.error('failed to get picture message image:', e)
				}
			}),
			// https://michaeluloth.com/filter-boolean -> filter(Boolean): a way to quickly remove all empty items from an array
		).then(images => setImages(images.filter(Boolean)))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [protocolClient, pictures.length])

	const mediaView = () => (
		<ScrollView contentContainerStyle={[padding.medium]}>
			{!pictures.length && (
				<UnifiedText style={[text.align.center, margin.left.small, text.size.scale(18)]}>
					No records found
				</UnifiedText>
			)}

			<View
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				{images.map(image => (
					<TouchableOpacity
						key={image.cid}
						onPress={() => {
							navigate('Modals.ImageView', { images: [image] })
						}}
						activeOpacity={0.9}
					>
						<Image
							key={image.filename}
							source={{
								uri: image.uri || '',
							}}
							style={[
								{
									height: 100,
									width: 100,
								},
								border.radius.tiny,
								margin.small,
							]}
						/>
					</TouchableOpacity>
				))}
			</View>
		</ScrollView>
	)

	const documentsView = () => (
		<ScrollView contentContainerStyle={[padding.medium]}>
			{!documents.length && (
				<UnifiedText style={[text.align.center, margin.left.small, text.size.scale(18)]}>
					No records found
				</UnifiedText>
			)}

			<View style={{}}>
				{documents.map(doc => (
					<View
						key={doc.cid}
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							marginTop: 10,
						}}
					>
						<TouchableOpacity
							style={{
								flexDirection: 'row',
								alignItems: 'center',
							}}
							onPress={async () => {
								if (!client || !doc.cid) {
									return
								}
								const { data } = await retrieveMediaBytes(client, doc.cid)
								const tmpFilename = RNFS.TemporaryDirectoryPath + '/' + (doc.filename || 'document')
								try {
									console.log('will share', data.length / 1000 / 1000, 'MB')
									await RNFS.writeFile(tmpFilename, data.toString('base64'), 'base64')
									const url = 'file://' + tmpFilename
									if (Platform.OS === 'web') {
										Clipboard.setString(url)
									} else {
										await Share.share({ url, message: url })
									}
								} catch (err: any) {
									if (!(typeof err?.message === 'string' && err.message.contains('cancelled'))) {
										console.warn('failed to write shareable file: ', err)
									}
								}
								try {
									await RNFS.unlink(tmpFilename)
								} catch (err) {
									console.warn('failed to unlink shareable file: ', err)
								}
							}}
						>
							<Icon
								{...iconInfoFromMimeType(doc.mimeType)}
								height={20}
								width={20}
								fill={colors['secondary-text']}
								style={margin.right.small}
							/>
							<UnifiedText style={[text.italic, { textDecorationLine: 'underline' }]}>
								{doc.displayName || doc.filename || 'document'}
							</UnifiedText>
						</TouchableOpacity>

						<UnifiedText style={[text.size.small]}>
							{timeFormat.fmtTimestamp3(doc.sentDate)}
						</UnifiedText>
					</View>
				))}
			</View>
		</ScrollView>
	)

	const linksView = () => (
		<ScrollView contentContainerStyle={[padding.medium]}>
			{!links.length && (
				<UnifiedText style={[text.align.center, margin.left.small, text.size.scale(18)]}>
					No records found
				</UnifiedText>
			)}

			<View style={{}}>
				{links.map(({ url, sentDate }) => (
					<View
						key={url + sentDate}
						style={{
							alignItems: 'flex-end',
							marginTop: 10,
						}}
					>
						<Hyperlink
							onPress={async url => {
								if (client && (await isBertyDeepLink(client, url))) {
									navigate('Chat.ManageDeepLink', { type: 'link', value: url })
									return
								}
								Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url))
							}}
							linkStyle={{ textDecorationLine: 'underline' }}
							linkify={linkify}
						>
							<UnifiedText
								style={{
									color: colors['background-header'],
								}}
							>
								{url}
							</UnifiedText>
						</Hyperlink>

						<UnifiedText style={[text.size.small, { marginTop: 8 }]}>
							{timeFormat.fmtTimestamp3(sentDate)}
						</UnifiedText>
					</View>
				))}
			</View>
		</ScrollView>
	)

	const [routes] = React.useState([
		{ key: 'medias', title: 'Medias' },
		{ key: 'links', title: 'Links' },
		{ key: 'docs', title: 'Documents' },
	])

	const renderScene = SceneMap({
		medias: mediaView,
		links: linksView,
		docs: documentsView,
	})

	return (
		<View style={[flex.tiny, { backgroundColor: colors['main-background'] }]}>
			<StatusBar barStyle='light-content' backgroundColor={colors['background-header']} />
			<TabSwitch activeIndex={activeIndex} setActiveIndex={setActiveIndex} />

			<View
				style={[
					border.radius.top.large,
					flex.tiny,
					{
						marginTop: -20,
						backgroundColor: colors['main-background'],
					},
				]}
			>
				<TabView
					navigationState={{ index: activeIndex, routes }}
					renderScene={renderScene}
					onIndexChange={setActiveIndex}
					initialLayout={initialLayout}
					renderTabBar={() => null}
				/>
			</View>
		</View>
	)
}
