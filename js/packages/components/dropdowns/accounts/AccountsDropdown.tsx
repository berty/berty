import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'

import { GenericAvatar } from '../../avatars'
import { UnifiedText } from '../../shared-components/UnifiedText'
import { DropdownPriv } from '../Dropdown.priv'

interface AccountsDropdownProps {
	items: beapi.account.IAccountMetadata[]
	onChangeItem: (item: beapi.account.IAccountMetadata) => void
	placeholder: string
	defaultValue?: string | null
}

export const AccountsDropdown: React.FC<AccountsDropdownProps> = props => {
	return (
		<View style={styles.container}>
			<DropdownPriv placeholder={props.placeholder}>
				{props.items.map(item => (
					<TouchableOpacity
						onPress={() => props.onChangeItem(item)}
						style={[
							styles.item,
							{
								backgroundColor: props.defaultValue === item.accountId ? '#CFD2FB' : 'transparent',
							},
						]}
						key={item.accountId}
					>
						<GenericAvatar
							size={25}
							cid={item.avatarCid}
							colorSeed={item.publicKey}
							nameSeed={item.name}
						/>
						<UnifiedText style={{ marginLeft: 7 }}>{item.name}</UnifiedText>
					</TouchableOpacity>
				))}
			</DropdownPriv>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 14,
		flex: 1,
		backgroundColor: '#F2F2F2',
	},
	item: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingLeft: 32,
		paddingVertical: 12,
		paddingRight: 12,
		flex: 1,
	},
})
