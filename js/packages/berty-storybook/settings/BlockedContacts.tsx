import React from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { ScreenProps } from '@berty-tech/berty-navigation'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, FactionButtonSetting } from '../shared-components/SettingsButtons'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { berty } from '@berty-tech/api'

//
// Blocked Contacts
//

// Types
type BlockedContactsListProps = {
	items: Array<berty.chatmodel.IContact>
}

// Styles
const useStylesBlockedContacts = () => {
	const [{ minHeight, padding, text }] = useStyles()
	return {
		item: minHeight(60),
		blockedText: [padding.left.scale(3), text.size.tiny, text.color.light.black],
	}
}

const HeaderBlockedContacts: React.FC<{}> = () => {
	const [{ color }] = useStyles()
	return (
		<View>
			<ButtonSetting
				name='Block a new user'
				icon='plus-circle-outline'
				iconSize={30}
				iconColor={color.blue}
				actionIcon='arrow-ios-forward'
			/>
		</View>
	)
}

const BlockedContactItem: React.FC<{ user: berty.chatmodel.IContact }> = ({ user }) => {
	const _styles = useStylesBlockedContacts()
	const [{ flex, background, padding, row, text, color }] = useStyles()

	return (
		<TouchableOpacity style={[flex.tiny, background.white, padding.small, _styles.item]}>
			<View style={[flex.tiny, row.fill]}>
				<View style={[row.center, row.item.justify]}>
					<CircleAvatar avatarUri={user?.avatarUri} size={40} />
					<View style={[padding.left.small]}>
						{user.name && (
							<Text style={[text.family, text.bold]} category='s4'>
								{user?.name}
							</Text>
						)}
						<View style={[row.fill]}>
							<Icon
								name='slash-outline'
								width={12}
								height={12}
								fill={color.red}
								style={row.item.justify}
							/>
							<Text style={[row.item.justify, _styles.blockedText, { color: color.black }]}>
								Blocked since 2019-04-11
							</Text>
						</View>
					</View>
				</View>
				<View style={[row.fill, row.item.justify]}>
					<Icon name='arrow-ios-forward' width={30} height={30} fill={color.black} />
				</View>
			</View>
		</TouchableOpacity>
	)
}

const BodyBlockedContacts: React.FC<BlockedContactsListProps> = ({ items }) => {
	const [{ flex, padding, margin }] = useStyles()

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<FactionButtonSetting style={[padding.vertical.small]}>
				{items && items.map((data) => <BlockedContactItem user={data} />)}
			</FactionButtonSetting>
		</View>
	)
}

export const BlockedContacts: React.FC<ScreenProps.Settings.BlockedContacts> = ({
	route: { params },
}) => {
	const [{ flex, background }] = useStyles()

	return (
		<Layout style={[flex.tiny, background.white]}>
			<ScrollView>
				<HeaderSettings
					title='Blocked contacts'
					desc="Blocked contacts can't send you contact requests"
				>
					<HeaderBlockedContacts />
				</HeaderSettings>
				<BodyBlockedContacts items={params} />
			</ScrollView>
		</Layout>
	)
}
