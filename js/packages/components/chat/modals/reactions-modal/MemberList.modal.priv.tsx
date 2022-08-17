import React from 'react'
import { StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

import { berty } from '@berty/api/root.pb'
import { MemberAvatar } from '@berty/components/avatars'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

const MemberItem: React.FC<{ member: any; divider: boolean }> = ({ member, divider = true }) => {
	const { margin, padding } = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<View style={[padding.vertical.small, styles.item]}>
				<MemberAvatar
					publicKey={member?.publicKey}
					conversationPublicKey={member.conversationPublicKey}
					size={50}
				/>
				<UnifiedText numberOfLines={1} style={[margin.left.small]}>
					{member?.displayName!}
				</UnifiedText>
			</View>
			{divider && (
				<View style={[{ backgroundColor: `${colors['secondary-text']}90` }, styles.divider]} />
			)}
		</View>
	)
}

export const MemberList: React.FC<{ userList: (berty.messenger.v1.IMember | undefined)[] }> = ({
	userList,
}) => {
	const { flex, margin } = useStyles()
	return (
		<View style={[styles.container]}>
			<FlatList
				contentContainerStyle={[margin.horizontal.medium, flex.tiny]}
				data={userList}
				keyExtractor={member => member.publicKey}
				renderItem={({ item, index }) => (
					<MemberItem key={`member-${index}`} member={item} divider={index < userList.length - 1} />
				)}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		height: 300,
	},
	emoji: {
		fontSize: 13,
		fontFamily: 'Bold Open Sans',
	},
	item: {
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
	},
	divider: {
		height: 1,
	},
})
