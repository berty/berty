import React, { useState, useEffect } from 'react'
import {
	View,
	ScrollView,
	TouchableOpacity,
	SafeAreaView,
	StatusBar,
	Image,
	Dimensions,
	Linking,
} from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import RNFS from 'react-native-fs'
import { TabView, SceneMap } from 'react-native-tab-view'
import tlds from 'tlds'
import linkifyFn from 'linkify-it'
import Hyperlink from 'react-native-hyperlink'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/navigation'
import {
	useMsgrContext,
	useConvInteractions,
	useClient,
	useThemeColor,
} from '@berty-tech/store/hooks'

import { getSource, timeFormat } from '../utils'
import { isBertyDeepLink } from '../chat/message/UserMessageComponents'

const initialLayout = { width: Dimensions.get('window').width }
const linkify = linkifyFn().tlds(tlds, true)

export const SharedMedias: React.FC<{ route: { params: { convPk: string } } }> = ({
	route: {
		params: { convPk },
	},
}) => {
	const [{ flex, margin, text, padding, border }] = useStyles()
	const colors = useThemeColor()
	const { navigate } = useNavigation()
	const { t }: { t: any } = useTranslation()
	const [activeIndex, setActiveIndex] = useState(0)
	const { protocolClient } = useMsgrContext()
	const [images, setImages] = useState<any[]>([])
	const client = useClient()

	const messages = useConvInteractions(convPk).filter(
		msg =>
			msg.type === beapi.messenger.AppMessage.Type.TypeUserMessage ||
			msg.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation ||
			msg.type === beapi.messenger.AppMessage.Type.TypeMonitorMetadata,
	)

	const pictures = React.useMemo(() => {
		return messages
			.reverse()
			.filter(inte => inte?.medias?.[0]?.mimeType?.startsWith('image'))
			.reduce((arr, current) => [...arr, ...current.medias], [])
	}, [messages])

	const documents = React.useMemo(() => {
		return messages
			.reverse()
			.filter(inte => inte?.medias?.[0] && !inte.medias?.[0].mimeType?.startsWith('image'))
			.reduce((arr, current) => [...arr, { ...current.medias[0], sentDate: current.sentDate }], [])
	}, [messages])

	const links: { url: string; sentDate: number }[] = React.useMemo(() => {
		return messages
			.reverse()
			.filter(inte => inte?.payload?.body && linkify.test(inte.payload.body))
			.reduce(
				(arr, current) => [
					...arr,
					...linkify
						.match(current.payload.body)
						.map(item => ({ url: item.url, sentDate: current.sentDate })),
				],
				[],
			)
	}, [messages])

	useEffect(() => {
		if (!protocolClient) {
			return
		}

		Promise.all(
			pictures.map((media: any) => {
				return getSource(protocolClient, media.cid)
					.then(src => {
						return { ...media, uri: `data:${media.mimeType};base64,${src}` }
					})
					.catch(e => console.error('failed to get picture message image:', e))
			}),
		).then((images: any) => setImages(images.filter(Boolean)))
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [protocolClient, pictures.length])

	const tabs = [
		{
			icon: {
				name: 'image',
				pack: 'feather',
			},
			title: t('chat.shared-medias.medias'),
		},
		{
			icon: {
				name: 'link',
				pack: 'feather',
			},
			title: t('chat.shared-medias.links'),
		},
		{
			icon: {
				name: 'file-text',
				pack: 'feather',
			},
			title: t('chat.shared-medias.documents'),
		},
	]

	const mediaView = () => (
		<ScrollView contentContainerStyle={[padding.medium]}>
			{!pictures.length && (
				<Text style={[text.align.center, margin.left.small, text.size.scale(18)]}>
					No records found
				</Text>
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
							navigate.modals.imageView({ images: [image] })
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
				<Text style={[text.align.center, margin.left.small, text.size.scale(18)]}>
					No records found
				</Text>
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
								const source = await getSource(protocolClient, doc.cid)
								RNFS.writeFile(`${RNFS.DocumentDirectoryPath}/${doc.filename}`, source, 'base64')
									.then(() => {})
									.catch(err => console.log(err))
							}}
						>
							<Icon name='file' height={20} width={20} fill={colors['secondary-text']} />
							<Text
								style={{
									fontStyle: 'italic',
									textDecorationLine: 'underline',
								}}
							>
								{doc.filename}
							</Text>
						</TouchableOpacity>

						<Text style={{ fontSize: 12 }}>{timeFormat.fmtTimestamp3(doc.sentDate)}</Text>
					</View>
				))}
			</View>
		</ScrollView>
	)

	const linksView = () => (
		<ScrollView contentContainerStyle={[padding.medium]}>
			{!links.length && (
				<Text style={[text.align.center, margin.left.small, text.size.scale(18)]}>
					No records found
				</Text>
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
									navigate.modals.manageDeepLink({ type: 'link', value: url })

									return
								}
								Linking.canOpenURL(url).then(supported => supported && Linking.openURL(url))
							}}
							linkStyle={{ textDecorationLine: 'underline' }}
							linkify={linkify}
						>
							<Text
								style={{
									color: colors['background-header'],
								}}
							>
								{url}
							</Text>
						</Hyperlink>

						<Text style={{ fontSize: 12, marginTop: 8 }}>{timeFormat.fmtTimestamp3(sentDate)}</Text>
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
			<SafeAreaView style={[{ backgroundColor: colors['background-header'] }]}>
				<View style={[{ flexDirection: 'row', alignItems: 'flex-end' }, padding.top.large]}>
					{tabs.map((tab, index) => (
						<TouchableOpacity
							activeOpacity={0.9}
							onPress={() => setActiveIndex(index)}
							style={[
								padding.horizontal.small,
								padding.top.medium,
								padding.bottom.big,
								border.radius.top.small,
								margin.right.small,
								{
									flexDirection: 'row',
									alignItems: 'center',
									backgroundColor:
										activeIndex === index ? colors['main-background'] : colors['input-background'],
								},
							]}
						>
							<Icon
								height={activeIndex === index ? 30 : 25}
								width={activeIndex === index ? 30 : 25}
								fill={colors['background-header']}
								{...tab.icon}
							/>
							<Text
								style={[
									margin.left.small,
									text.size.scale(activeIndex === index ? 17 : 16),
									{ color: colors['background-header'] },
								]}
							>
								{tab.title}
							</Text>
						</TouchableOpacity>
					))}
				</View>

				<View
					style={{
						position: 'absolute',
						right: -50,
						bottom: -30,
						zIndex: -1,
					}}
				>
					<Icon
						height={200}
						width={200}
						fill={colors['background-header']}
						name={tabs[activeIndex].icon.name}
						pack='feather'
					/>
				</View>
			</SafeAreaView>

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
