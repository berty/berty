import Long from 'long'
import React, { createRef, FC, useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler'

import { berty } from '@berty/api/root.pb'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import {
	useConversationMembers,
	useMessengerClient,
	useMountEffect,
	useThemeColor,
} from '@berty/hooks'
import { getEmojiByName } from '@berty/utils/emojis/emojis'

import { EmojiNumber } from '../../message/reactions/EmojiNumber'
import { MemberList } from './MemberList.modal.priv'

const ReactionItemModal: FC<{
	onPress: () => void
	onLayout: (event: LayoutChangeEvent) => void
	isSelectedEmoji: boolean
	emoji?: string | null | undefined
	count?: Long | null | undefined
}> = ({ onPress, onLayout, isSelectedEmoji, emoji, count }) => {
	const colors = useThemeColor()
	const { padding, border, margin } = useStyles()

	return (
		<TouchableOpacity
			style={[
				margin.small,
				padding.small,
				border.radius.small,
				styles.item,
				{
					backgroundColor: isSelectedEmoji
						? colors['background-header']
						: colors['input-background'],
				},
			]}
			key={`reaction-list${emoji}`}
			onPress={onPress}
			onLayout={onLayout}
		>
			<UnifiedText style={[padding.right.small]}>{`${getEmojiByName(
				emoji as string,
			)}`}</UnifiedText>
			<EmojiNumber
				count={count as unknown as number}
				style={[
					styles.number,
					{ color: isSelectedEmoji ? colors['main-background'] : colors['background-header'] },
				]}
			/>
		</TouchableOpacity>
	)
}

export const ReactionListModal: FC<{
	reactions: berty.messenger.v1.Interaction.IReactionView[]
	emoji: string | null | undefined
	cid: string
	convPk: string
}> = ({ reactions, emoji, cid, convPk }) => {
	const { padding } = useStyles()
	const [selectedEmoji, setSelectedEmoji] = useState<string | null | undefined>(emoji)
	const [dataSourceCords, setDataSourceCords] = useState<number[] | undefined>()
	const [userList, setUserList] = useState<(berty.messenger.v1.IMember | undefined)[]>([])
	const scrollViewRef = createRef<ScrollView>()
	const client = useMessengerClient()
	const members = useConversationMembers(convPk)

	const getReactionList = useCallback(
		async (emoji: string | null | undefined) => {
			const r = (await client?.interactionReactionsForEmoji({
				emoji: emoji,
				interactionCid: cid,
			})) as berty.messenger.v1.InteractionReactionsForEmoji.Reply

			setUserList(
				Object.values(members).filter(member =>
					r?.reactions.find(reaction => reaction.memberPublicKey === member?.publicKey),
				) || [],
			)
		},
		[cid, client, members],
	)

	const selectEmoji = useCallback(
		async (emoji: string | null | undefined) => {
			setSelectedEmoji(emoji)
			await getReactionList(emoji)
		},
		[getReactionList],
	)

	useMountEffect(() => {
		selectEmoji(emoji)
	})

	// effect to handle scrollTo on the selected emoji
	useEffect(() => {
		if (dataSourceCords) {
			const index = reactions.findIndex(({ emoji }) => emoji === selectedEmoji)
			scrollViewRef.current?.scrollTo({
				x: dataSourceCords ? dataSourceCords[index] : 0,
				y: 0,
				animated: true,
			})
		}
	}, [selectedEmoji, dataSourceCords, reactions, scrollViewRef])

	return (
		<View>
			<ScrollView horizontal ref={scrollViewRef} style={[padding.vertical.small]}>
				{reactions.map(props => (
					<ReactionItemModal
						key={props.emoji}
						onPress={async () => await selectEmoji(props.emoji)}
						onLayout={e => {
							if (!dataSourceCords) {
								setDataSourceCords(
									// set an array of width coordinates for all emojis
									reactions.reduce(p => {
										// to have the specific width it's simple: the last coordinate + the size of the component + the padding between components
										return [...p, p[p.length - 1] + e.nativeEvent.layout.width + 17]
									}, Array(1).fill(0)),
								)
							}
						}}
						isSelectedEmoji={selectedEmoji === props.emoji}
						{...props}
					/>
				))}
			</ScrollView>
			<MemberList userList={userList} />
		</View>
	)
}

const styles = StyleSheet.create({
	item: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	number: {
		fontSize: 13,
		fontFamily: 'Bold Open Sans',
	},
})
