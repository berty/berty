import React from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, FactionButtonSetting } from '../shared-components/SettingsButtons'
import { CircleAvatar } from '../shared-components/CircleAvatar'

//
// Blocked Contacts
//

// Types
type BlockedContactsItempProps = {
	avatarUri: string
	name: string
}

type BlockedContactsListProps = {
	items: Array<BlockedContactsItempProps>
}

type BlockedContactsProps = {
	blocked: BlockedContactsListProps
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

const BlockedContactItem: React.FC<BlockedContactsItempProps> = ({ avatarUri, name }) => {
	const _styles = useStylesBlockedContacts()
	const [{ flex, background, padding, row, text, color, column }] = useStyles()

	return (
		<TouchableOpacity style={[flex.tiny, background.white, padding.small, _styles.item]}>
			<View style={[flex.tiny, row.fill]}>
				<View style={[row.center, row.item.justify]}>
					<CircleAvatar avatarUri={avatarUri} size={40} withCircle={false} />
					<View style={[padding.left.small]}>
						<Text style={[text.bold.medium]} category='s4'>
							{name}
						</Text>
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
				{items &&
					items.map((data) => <BlockedContactItem avatarUri={data.avatarUri} name={data.name} />)}
			</FactionButtonSetting>
		</View>
	)
}

export const BlockedContacts: React.FC<BlockedContactsProps> = ({ blocked }) => {
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
				<BodyBlockedContacts {...blocked} />
			</ScrollView>
		</Layout>
	)
}
