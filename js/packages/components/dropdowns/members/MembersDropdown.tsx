import { pickBy } from 'lodash'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

import { DropdownPriv } from '../Dropdown.priv'
import { MemberAvatarWithStatus } from './MemberAvatarWithStatus.priv'
import { MemberName } from './MemberName.priv'
import { MembersDropdownHeader } from './MembersDropdownHeader.priv'
import { MemberTransport } from './MemberTransport.priv'

interface MembersDropdownProps {
	items: beapi.messenger.IMember[]
	onChangeItem: (item: beapi.messenger.IMember) => void
	placeholder: string
	defaultValue?: string | null
	publicKey: string
	accessibilityLabel?: string
}

interface MemberItemProps {
	onPress: () => void
	item: beapi.messenger.IMember
	convPK: string
}

const MemberItem: React.FC<MemberItemProps> = ({ onPress, convPK, item }) => {
	const { padding } = useStyles()

	// TODO change it and recup it in redux store
	const memberStatus = 'reconnecting'
	const memberUserType = 'replication'
	const memberTransport = 'wifi'
	return (
		<TouchableOpacity
			onPress={onPress}
			style={[styles.item, padding.horizontal.medium]}
			key={item.publicKey}
		>
			<View style={[styles.content]}>
				<MemberAvatarWithStatus
					publicKey={item.publicKey}
					convPK={convPK}
					memberStatus={memberStatus}
				/>
				<MemberName displayName={item.displayName} memberUserType={memberUserType} />
			</View>
			<MemberTransport memberStatus={memberStatus} memberTransport={memberTransport} />
		</TouchableOpacity>
	)
}

export const MembersDropdown: React.FC<MembersDropdownProps> = props => {
	const { border } = useStyles()
	const colors = useThemeColor()
	const [value, setValue] = React.useState<string>('')

	const lowSearchValue = value.toLowerCase()
	const searchCheck = React.useCallback(
		searchIn => searchIn.toLowerCase().includes(lowSearchValue),
		[lowSearchValue],
	)
	const searchMembers = React.useMemo(
		() => (value.length ? pickBy(props.items, val => searchCheck(val.displayName)) : props.items),
		[props.items, searchCheck, value],
	)

	return (
		<View
			style={[
				styles.container,
				border.shadow.medium,
				{ shadowColor: colors.shadow, backgroundColor: colors['main-background'] },
			]}
		>
			<DropdownPriv
				icon='users'
				placeholder={props.placeholder}
				accessibilityLabel={props.accessibilityLabel}
			>
				<MembersDropdownHeader inputValue={value} setInputValue={setValue} />
				{/* TODO: enable it when replication node is up */}
				{/* <AddConversationBoosterButton /> */}
				{Object.values(searchMembers).map(item => (
					<MemberItem
						onPress={() => props.onChangeItem(item)}
						convPK={props.publicKey}
						item={item}
					/>
				))}
			</DropdownPriv>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
		flex: 1,
		borderWidth: 1,
		borderColor: '#EDF1F7',
	},
	item: {
		borderTopWidth: 1,
		borderTopColor: '#EDF1F7',
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		flex: 1,
		justifyContent: 'space-between',
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
	},
})
