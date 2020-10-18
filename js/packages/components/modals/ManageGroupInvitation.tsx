import React, { useState } from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useNavigation } from '@react-navigation/native'
import { useStyles } from '@berty-tech/styles'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { TabBar } from '../shared-components/TabBar'
import { FingerprintContent } from '../shared-components/FingerprintContent'
import InvalidScan from './InvalidScan'
import messengerMethodsHooks from '@berty-tech/store/methods'

const useStylesModal = () => {
	const [{ width, border, height, opacity }] = useStyles()
	return {
		closeRequest: [width(45), height(45), border.radius.scale(22.5)],
		closeRequestIcon: opacity(0.5),
	}
}

const BodyManageGroupInvitationContent: React.FC<{}> = ({ children }) => {
	const [{ margin }] = useStyles()
	return (
		<View style={[margin.top.big]}>
			<View>{children}</View>
		</View>
	)
}

const SelectedContent = ({ contentName, pubKey }: { contentName: string; pubKey: string }) => {
	const [{ padding }] = useStyles()
	switch (contentName) {
		case 'Fingerprint':
			return <FingerprintContent seed={pubKey} />
		default:
			return (
				<Text style={[padding.horizontal.medium]}>Error: Unknown content name "{contentName}"</Text>
			)
	}
}

export const ManageGroupInvitation: React.FC<{
	link: string
	displayName: string
	publicKey: string
	type: string
}> = ({ link, type, displayName, publicKey }) => {
	const navigation = useNavigation()
	const { call: joinConversation, done, error } = messengerMethodsHooks.useConversationJoin()
	const [{ row, text, column, color, flex, absolute, padding, background, border }] = useStyles()
	const [selectedContent, setSelectedContent] = useState('Fingerprint')
	const _styles = useStylesModal()

	// TODO: handle error (shouldn't happen since we checked the link previously, but still)

	React.useEffect(() => {
		if (done && !error) {
			navigation.goBack()
			navigation.navigate('Main.HomeModal')
		}
	}, [done, error, navigation])

	if (error) {
		let title
		if (type === 'link') {
			title = 'Invalid link!'
		} else if (type === 'qr') {
			title = 'Invalid QR code!'
		} else {
			title = 'Error!'
		}
		return <InvalidScan title={title} error={error.toString()} />
	}

	return (
		<View
			style={[{ justifyContent: 'center', alignItems: 'center', height: '100%' }, padding.medium]}
		>
			<View
				style={[
					background.white,
					padding.horizontal.medium,
					padding.bottom.medium,
					border.radius.large,
					{ width: '100%' },
				]}
			>
				<View style={[absolute.scale({ top: -50 }), row.item.justify]}>
					<ProceduralCircleAvatar
						seed={publicKey}
						style={[border.shadow.big, row.center]}
						diffSize={30}
					/>
				</View>
				<View style={[padding.top.scale(55)]}>
					<Text style={{ textAlign: 'center' }}>{displayName}</Text>
					<TabBar
						tabs={[
							{ name: 'Fingerprint', icon: 'fingerprint', iconPack: 'custom' } as any, // TODO: fix typing
							{ name: 'Info', icon: 'info-outline', buttonDisabled: true },
							{
								name: 'Devices',
								icon: 'smartphone',
								iconSize: 20,
								iconPack: 'feather',
								iconTransform: [{ rotate: '22.5deg' }, { scale: 0.8 }],
								buttonDisabled: true,
							} as any, // TODO: fix typing
						]}
						onTabChange={setSelectedContent}
					/>
					<BodyManageGroupInvitationContent>
						<SelectedContent contentName={selectedContent} pubKey={publicKey} />
					</BodyManageGroupInvitationContent>
				</View>
				<View style={[padding.top.big, row.fill, padding.medium]}>
					<TouchableOpacity
						onPress={() => joinConversation({ link })}
						style={[
							flex.medium,
							background.light.blue,
							padding.vertical.scale(12),
							border.radius.small,
						]}
					>
						<Text style={[text.color.blue, { textAlign: 'center' }]}>JOIN THIS GROUP</Text>
					</TouchableOpacity>
				</View>
			</View>
			<TouchableOpacity
				style={[
					background.white,
					padding.vertical.medium,
					border.shadow.medium,
					row.item.justify,
					column.justify,
					_styles.closeRequest,
					{ position: 'absolute', bottom: '2%' },
				]}
				onPress={navigation.goBack}
			>
				<Icon
					style={[row.item.justify, _styles.closeRequestIcon]}
					name='close-outline'
					width={25}
					height={25}
					fill={color.grey}
				/>
			</TouchableOpacity>
		</View>
	)
}

export default ManageGroupInvitation
