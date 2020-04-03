import React, { useState } from 'react'
import {
	SafeAreaView,
	View,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Dimensions,
	Share,
} from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { RequestProps } from '../shared-props/User'
import { TabBar } from '../shared-components/TabBar'
import { RequestAvatar } from '../shared-components/Request'
import { Chat } from '@berty-tech/hooks'
import { useNavigation } from '@berty-tech/berty-navigation'
import QRCode from 'react-native-qrcode-svg'
import { SimpleModal } from '../main/SimpleModal'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'

//
// Settings My Berty ID Vue
//

const AVATAR_SIZE = 100

// Style
const useStylesBertyId = () => {
	const [{ margin, padding, maxHeight, minHeight }] = useStyles()
	return {
		bodyMarginTop: margin.top.scale(60),
		bodyContent: [margin.bottom.scale(40)],
		scrollViewMaxHeight: maxHeight(400),
		contentMinHeight: minHeight(400),
	}
}
const _bertyIdStyles = StyleSheet.create({
	headerToggleBar: {
		borderWidth: 2.5,
		width: '12%',
		borderRadius: 4,
	},
	bertyLayout: { borderTopLeftRadius: 25, borderTopRightRadius: 25, height: '100%' },
	bertyIdButton: { width: 60, height: 60, borderRadius: 60 / 2, marginRight: 60, bottom: 30 },
})

const BertyIdContent: React.FC<{}> = ({ children }) => {
	const _styles = useStylesBertyId()
	const [{ padding, column }] = useStyles()

	return (
		<ScrollView
			style={[_styles.scrollViewMaxHeight]}
			contentContainerStyle={[padding.vertical.medium]}
		>
			<View style={[column.justify, { alignItems: 'center' }]}>{children}</View>
		</ScrollView>
	)
}

const min = (a: number, b: number) => (a < b ? a : b)

const ContactRequestQR = () => {
	const contactRequestReference = Chat.useContactRequestReference()
	const contactRequestEnabled = Chat.useContactRequestEnabled()
	const [styles] = useStyles()
	// I would like to use binary mode in QR but the scanner used seems to not support it, extended tests were done
	if (contactRequestEnabled) {
		return (
			<View style={[styles.padding.top.big]}>
				<QRCode
					size={min(Dimensions.get('window').height * 0.33, Dimensions.get('window').width * 0.66)}
					value={contactRequestReference}
				/>
			</View>
		)
	} else {
		return <Text>Error: Contact request is disabled</Text>
	}
}

const SelectedContent = ({ contentName }: { contentName: string }) => {
	switch (contentName) {
		case 'QR':
			return <ContactRequestQR />
		default:
			return <Text>Error: Unknown content name "{contentName}"</Text>
	}
}

const Avatar: React.FC<{ seed?: string }> = ({ seed }) => {
	const [{ background, border, row }] = useStyles()
	const size = 90
	const diff = 20
	return (
		<View
			style={{ display: 'flex', alignItems: 'center', padding: 0, margin: 0, paddingTop: size / 2 }}
		>
			<View
				style={[
					background.white,
					border.shadow.medium,
					{
						display: 'flex',
						justifyContent: 'center',
						borderRadius: size / 2,
						width: size,
						height: size,
						padding: 0,
						margin: 0,
						position: 'absolute',
						top: -(size / 2),
					},
				]}
			>
				<ProceduralCircleAvatar seed={seed} size={size} diffSize={diff} />
			</View>
		</View>
	)
}

const BertIdBody: React.FC<RequestProps> = ({ user }) => {
	const _styles = useStylesBertyId()
	const [{ background, border, margin, padding }] = useStyles()
	const [selectedContent, setSelectedContent] = useState()
	const client = Chat.useClient()
	const account = Chat.useAccount()
	return (
		<View
			style={[
				background.white,
				border.radius.scale(30),
				margin.horizontal.medium,
				{ marginTop: 45 },
			]}
		>
			<Avatar {...user} seed={client?.accountPk} />
			<Text
				style={{
					alignSelf: 'center',
					fontSize: 18,
					color: '#383B62',
					fontWeight: '600',
					marginTop: 10,
				}}
			>
				{account?.name}
			</Text>
			<View style={[padding.horizontal.big, _styles.bodyContent]}>
				<TabBar
					tabs={[
						{ name: 'QR', icon: 'code-outline' },
						{ name: 'Fingerprint', icon: 'code-outline' },
						{ name: 'Devices', icon: 'smartphone-outline' },
					]}
					onTabChange={setSelectedContent}
				/>
				<BertyIdContent>
					<SelectedContent contentName={selectedContent} />
				</BertyIdContent>
			</View>
		</View>
	)
}

const BertyIdShare: React.FC<{}> = () => {
	const [{ row, border, background, flex, color }] = useStyles()
	const contactRequestReference = Chat.useContactRequestReference()
	if (!contactRequestReference) {
		return null
	}
	return (
		<TouchableOpacity
			style={[
				row.item.bottom,
				background.light.blue,
				border.shadow.medium,
				_bertyIdStyles.bertyIdButton,
			]}
			onPress={async () => {
				try {
					await Share.share({ url: `berty://${encodeURIComponent(contactRequestReference)}` })
				} catch (e) {
					console.error(e)
				}
			}}
		>
			<View style={[flex.tiny, { justifyContent: 'center' }]}>
				<Icon
					style={row.item.justify}
					name='share-outline'
					width={40}
					height={40}
					fill={color.blue}
				/>
			</View>
		</TouchableOpacity>
	)
}

const Screen = Dimensions.get('window')

export const MyBertyId: React.FC<RequestProps> = ({ user }) => {
	const [{ color }] = useStyles()
	return (
		<SimpleModal title='My Berty ID' color={color.blue} iconName='person-outline'>
			<BertIdBody user={user} />
			<BertyIdShare />
		</SimpleModal>
	)
}
