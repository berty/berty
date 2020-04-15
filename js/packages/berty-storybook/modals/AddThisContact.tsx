import React, { useState } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useNavigation } from '@react-navigation/native'
import { Chat } from '@berty-tech/hooks'
import { useStyles } from '@berty-tech/styles'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { TabBar } from '../shared-components/TabBar'

const useStylesModal = () => {
	const [{ width, border, height, opacity }] = useStyles()
	return {
		closeRequest: [width(45), height(45), border.radius.scale(22.5)],
		closeRequestIcon: opacity(0.5),
	}
}

const BodyAddThisContactContent: React.FC<{}> = ({ children }) => {
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
			return (
				<View style={[padding.horizontal.medium, { width: '100%' }]}>
					<Text style={[{ textAlign: 'center' }]}>{pubKey}</Text>
				</View>
			)
		default:
			return (
				<Text style={[padding.horizontal.medium]}>Error: Unknown content name "{contentName}"</Text>
			)
	}
}

const AddThisContact: React.FC<{ name: string; rdvSeed: string; pubKey: string }> = ({
	name,
	rdvSeed,
	pubKey,
}) => {
	const [{ row, text, column, color, flex, absolute, padding, background, border }] = useStyles()
	const navigation = useNavigation()
	const sendContactRequest = Chat.useAccountSendContactRequest()
	const [selectedContent, setSelectedContent] = useState()
	const _styles = useStylesModal()

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
				]}
			>
				<View style={[absolute.scale({ top: -50 }), row.item.justify]}>
					<ProceduralCircleAvatar
						seed={pubKey}
						style={[border.shadow.big, row.center]}
						diffSize={30}
					/>
				</View>
				<View style={[padding.top.scale(55)]}>
					<Text style={{ textAlign: 'center' }}>{name}</Text>
					<TabBar
						tabs={[
							{ name: 'Fingerprint', icon: 'code-outline' },
							{ name: 'Infos', icon: 'info-outline' },
							{ name: 'Devices', icon: 'smartphone-outline' },
						]}
						onTabChange={setSelectedContent}
					/>
					<BodyAddThisContactContent>
						<SelectedContent contentName={selectedContent} pubKey={pubKey} />
					</BodyAddThisContactContent>
				</View>
				<View style={[padding.top.big, row.fill, padding.medium]}>
					<TouchableOpacity
						onPress={() => {
							sendContactRequest(name, rdvSeed, pubKey)
							navigation.navigate('Main.List')
						}}
						style={[
							flex.medium,
							background.light.blue,
							padding.vertical.scale(12),
							border.radius.small,
						]}
					>
						<Text style={[text.bold.scale('600'), text.color.blue, { textAlign: 'center' }]}>
							ADD THIS CONTACT
						</Text>
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

export default AddThisContact
