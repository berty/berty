import React from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'
import { HeaderSettings } from './shared-components/Header'
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
const _blockedContactsStyles = StyleSheet.create({
	item: {
		minHeight: 60,
	},
	blockedText: {
		paddingLeft: 3,
		fontSize: 11,
		opacity: 0.8,
	},
})

const HeaderBlockedContacts: React.FC<{}> = () => (
	<View>
		<ButtonSetting
			name='Block a new user'
			icon='plus-circle-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
		/>
	</View>
)

const BlockedContactItem: React.FC<BlockedContactsItempProps> = ({ avatarUri, name }) => (
	<TouchableOpacity
		style={[styles.flex, styles.bgWhite, styles.littlePadding, _blockedContactsStyles.item]}
	>
		<View style={[styles.flex, styles.row]}>
			<View style={[styles.row, styles.alignVertical]}>
				<CircleAvatar avatarUri={avatarUri} size={40} withCircle={false} />
				<View style={[styles.littlePaddingLeft]}>
					<Text style={[styles.fontFamily, styles.textBold]} category='s4'>
						{name}
					</Text>
					<View style={[styles.row, styles.alignItems]}>
						<Icon name='slash-outline' width={12} height={12} fill={colors.red} />
						<Text style={[_blockedContactsStyles.blockedText, { color: colors.black }]}>
							Blocked since 2019-04-11
						</Text>
					</View>
				</View>
			</View>
			<View style={[styles.row, styles.center]}>
				<Icon name='arrow-ios-forward' width={30} height={30} fill={colors.black} />
			</View>
		</View>
	</TouchableOpacity>
)

const BodyBlockedContacts: React.FC<BlockedContactsListProps> = ({ items }) => (
	<View style={[styles.flex, styles.padding, styles.marginBottom]}>
		<FactionButtonSetting style={[styles.littlePaddingTop, styles.littlePaddingBottom]}>
			{items.map((data) => (
				<BlockedContactItem avatarUri={data.avatarUri} name={data.name} />
			))}
		</FactionButtonSetting>
	</View>
)

export const BlockedContacts: React.FC<BlockedContactsProps> = ({ blocked }) => (
	<Layout style={[styles.flex, styles.bgWhite]}>
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
