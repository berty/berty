import React from 'react'
import { StyleSheet, View } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'

import { berty } from '@berty/api/root.pb'
import { ContactAvatar } from '@berty/components/avatars'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/hooks'

const MemberItem: React.FC<{ member: any; divider: boolean }> = ({ member, divider = true }) => {
	const { row, margin, padding, border } = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<View style={[row.left, row.item.justify, padding.vertical.small, styles.shrink]}>
				<ContactAvatar size={50} publicKey={member?.publicKey} />
				<UnifiedText numberOfLines={1} style={[margin.left.small, row.item.justify, styles.shrink]}>
					{member?.displayName!}
				</UnifiedText>
			</View>
			{divider && (
				<View style={[border.scale(0.6), { borderColor: `${colors['secondary-text']}90` }]} />
			)}
		</View>
	)
}

export const MemberList: React.FC<{
	userList: (berty.messenger.v1.IMember | undefined)[]
	selectedEmoji: string | null | undefined
}> = ({ userList, selectedEmoji }) => {
	const { padding } = useStyles()
	const colors = useThemeColor()
	return (
		<View style={[styles.container]}>
			<UnifiedText style={[styles.emoji, padding.medium, { color: colors['background-header'] }]}>
				{selectedEmoji}
			</UnifiedText>
			<FlatList
				data={userList}
				keyExtractor={member => member.publicKey}
				renderItem={() => (
					<View style={[padding.left.medium, styles.list]}>
						{userList.map((member, index) => (
							<MemberItem
								key={`member-${index}`}
								member={member}
								divider={index < userList.length - 1}
							/>
						))}
					</View>
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
	list: { alignItems: 'flex-start' },
	shrink: { flexShrink: 1 },
})
