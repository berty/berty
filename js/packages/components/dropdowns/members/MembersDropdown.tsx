import { Dictionary } from '@reduxjs/toolkit'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { MemberAvatar } from '../../avatars'
import { UnifiedText } from '../../shared-components/UnifiedText'
import { DropdownPriv } from '../Dropdown.priv'

interface MembersDropdownProps {
	items: Dictionary<beapi.messenger.IMember>
	onChangeItem: (item: beapi.messenger.IMember) => void
	placeholder: string
	defaultValue?: string | null
	publicKey: string
}

export const MembersDropdown: React.FC<MembersDropdownProps> = props => {
	const { padding, margin, border } = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[styles.container, { shadowColor: colors.shadow }, border.shadow.medium]}>
			<DropdownPriv icon='users' placeholder={props.placeholder}>
				{Object.entries(props.items)
					.filter(([, m]) => m !== undefined)
					.map(
						([, item], key) =>
							item !== undefined && (
								<TouchableOpacity
									onPress={() => props.onChangeItem(item)}
									style={[styles.item, padding.horizontal.medium]}
									key={key}
								>
									<MemberAvatar
										publicKey={item?.publicKey}
										conversationPublicKey={props.publicKey}
										size={25}
									/>
									<UnifiedText style={[margin.left.medium]}>{item.displayName ?? ''}</UnifiedText>
								</TouchableOpacity>
							),
					)}
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
		paddingVertical: 12,
		flex: 1,
	},
})
