import { pickBy } from 'lodash'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { useAppDispatch, useAppSelector, useThemeColor } from '@berty/hooks'
import {
	PeerNetworkStatus,
	getPeerFromMemberPK,
	selectPeerNetworkStatusDict,
} from '@berty/redux/reducers/messenger.reducer'

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
	const dispatch = useAppDispatch()
	const [peer, setPeer] = React.useState<PeerNetworkStatus | null>(null)
	const peers = useAppSelector(selectPeerNetworkStatusDict)

	React.useEffect(() => {
		const f = async () => {
			const peerFromMemberPK = await dispatch(
				getPeerFromMemberPK({ memberPK: item.publicKey, convPK: item.conversationPublicKey }),
			)

			// fallback peer object in waiting for go implementation
			const fallBackPeer: PeerNetworkStatus = {
				id: '',
				transport: beapi.messenger.StreamEvent.PeerStatusConnected.Transport.Unknown,
				connectionStatus: beapi.protocol.GroupDeviceStatus.Type.TypePeerDisconnected,
			}
			setPeer((peerFromMemberPK.payload as PeerNetworkStatus) || fallBackPeer)
		}

		f()
		// we put peers dependencies to update the connectionStatus of peers
	}, [convPK, dispatch, item.publicKey, item.conversationPublicKey, peers])

	return peer ? (
		<TouchableOpacity onPress={onPress} style={[styles.item, padding.horizontal.medium]}>
			<View style={[styles.content]}>
				<MemberAvatarWithStatus
					publicKey={item.publicKey}
					convPK={convPK}
					memberStatus={peer.connectionStatus}
					isMe={item.isMe}
				/>
				<MemberName displayName={item.displayName} isMe={item.isMe} />
			</View>
			<MemberTransport memberStatus={peer.connectionStatus} memberTransport={peer.transport} />
		</TouchableOpacity>
	) : null
}

export const MembersDropdown: React.FC<MembersDropdownProps> = props => {
	const { border } = useStyles()
	const colors = useThemeColor()
	const [value, setValue] = React.useState<string>('')

	const lowSearchValue = value.toLowerCase()
	const searchMembers = React.useMemo(
		() =>
			value.length
				? pickBy(props.items, val => val.displayName?.toLowerCase().includes(lowSearchValue))
				: props.items,
		[lowSearchValue, props.items, value.length],
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
						key={item.publicKey}
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
