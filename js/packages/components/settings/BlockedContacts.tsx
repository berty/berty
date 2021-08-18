import React from 'react'
import { View, ScrollView, TouchableOpacity } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'

import { useStyles } from '@berty-tech/styles'
import { useThemeColor } from '@berty-tech/store/hooks'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, FactionButtonSetting } from '../shared-components/SettingsButtons'

//
// Blocked Contacts
//

// check deep link handling

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
	const colors = useThemeColor()

	return {
		item: minHeight(60),
		blockedText: [padding.left.scale(3), text.size.tiny, { color: colors['secondary-text'] }],
	}
}

const HeaderBlockedContacts: React.FC<{}> = () => {
	const colors = useThemeColor()

	return (
		<View>
			<ButtonSetting
				name='Block a new user'
				icon='plus-circle-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				actionIcon='arrow-ios-forward'
			/>
		</View>
	)
}

const BlockedContactItem: React.FC<BlockedContactsItempProps> = ({ name }) => {
	const _styles = useStylesBlockedContacts()
	const [{ flex, padding, row, text }] = useStyles()
	const colors = useThemeColor()

	return (
		<TouchableOpacity
			style={[
				flex.tiny,
				padding.small,
				_styles.item,
				{ backgroundColor: colors['main-background'] },
			]}
		>
			<View style={[flex.tiny, row.fill]}>
				<View style={[row.center, row.item.justify]}>
					{/*<CircleAvatar avatarUri={avatarUri} size={40} withCircle={false} />*/}
					<View style={[padding.left.small]}>
						<Text style={[text.bold.medium]} category='s4'>
							{name}
						</Text>
						<View style={[row.fill]}>
							<Icon
								name='slash-outline'
								width={12}
								height={12}
								fill={colors['warning-asset']}
								style={row.item.justify}
							/>
							<Text style={[row.item.justify, _styles.blockedText, { color: colors['main-text'] }]}>
								Blocked since 2019-04-11
							</Text>
						</View>
					</View>
				</View>
				<View style={[row.fill, row.item.justify]}>
					<Icon name='arrow-ios-forward' width={30} height={30} fill={colors['main-text']} />
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
					items.map(data => <BlockedContactItem avatarUri={data.avatarUri} name={data.name} />)}
			</FactionButtonSetting>
		</View>
	)
}

export const BlockedContacts: React.FC<BlockedContactsProps> = ({ blocked }) => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<ScrollView bounces={false}>
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
