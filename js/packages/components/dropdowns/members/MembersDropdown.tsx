import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'

import { MemberAvatar } from '../../avatars'
import { UnifiedText } from '../../shared-components/UnifiedText'
import { DropdownPriv } from '../Dropdown.priv'

interface MembersDropdownProps {
	items: beapi.messenger.IMember[]
	onChangeItem: (item: beapi.messenger.IMember) => void
	placeholder: string
	defaultValue?: string | null
	publicKey: string
}

export const MembersDropdown: React.FC<MembersDropdownProps> = props => {
	const { padding, margin, border } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				styles.container,
				border.shadow.medium,
				{ shadowColor: colors.shadow, backgroundColor: colors['main-background'] },
			]}
		>
			<DropdownPriv icon='users' placeholder={props.placeholder}>
				{props.items.map(item => (
					<TouchableOpacity
						onPress={() => props.onChangeItem(item)}
						style={[styles.item, padding.horizontal.medium]}
						key={item.publicKey}
					>
						<MemberAvatar
							publicKey={item?.publicKey}
							conversationPublicKey={props.publicKey}
							size={25}
						/>
						<UnifiedText style={[margin.left.medium]}>{item.displayName ?? ''}</UnifiedText>
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
	},
})
