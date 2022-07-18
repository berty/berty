import { Icon } from '@ui-kitten/components'
import React, { createRef, FC, useCallback, useEffect, useState } from 'react'
import { StyleProp, TextStyle, View } from 'react-native'
import { FlatList, ScrollView, TouchableOpacity } from 'react-native-gesture-handler'

import { berty } from '@berty/api/root.pb'
import { BottomModal } from '@berty/components'
import { ContactAvatar } from '@berty/components/avatars'
import { useStyles } from '@berty/contexts/styles'
import {
	useAppSelector,
	useConversationMembersDict,
	useMessengerClient,
	useThemeColor,
} from '@berty/hooks'
import { selectInteraction } from '@berty/redux/reducers/messenger.reducer'
import { getEmojiByName } from '@berty/utils/emojis/emojis'

import { UnifiedText } from '../../shared-components/UnifiedText'

const MemberItem: React.FC<{ member: any; divider: boolean }> = ({ member, divider = true }) => {
	const { row, margin, padding, border } = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<View style={[row.left, row.item.justify, padding.vertical.small, { flexShrink: 1 }]}>
				<ContactAvatar size={50} publicKey={member?.publicKey} />
				<UnifiedText
					numberOfLines={1}
					style={[margin.left.small, row.item.justify, { flexShrink: 1 }]}
				>
					{member?.displayName!}
				</UnifiedText>
			</View>
			{divider && (
				<View style={[border.scale(0.6), { borderColor: `${colors['secondary-text']}90` }]} />
			)}
		</View>
	)
}

const AnimatedNumber: React.FC<{ count: number; style: StyleProp<TextStyle> }> = ({
	count,
	style,
}) => (
	<View>
		<UnifiedText style={style}>{count}</UnifiedText>
	</View>
)

const ReactionList: FC<{
	reactions: berty.messenger.v1.Interaction.IReactionView[]
	emoji: string | null | undefined
	cid: string
	convPk: string
	close: () => void
}> = ({ reactions, emoji, cid, convPk }) => {
	const colors = useThemeColor()
	const { padding, border, margin, text } = useStyles()
	const [currentEmoji, setCurrentEmoji] = useState<string | null | undefined>(emoji)
	const [dataSourceCords, setDataSourceCords] = useState<number[] | undefined>()
	const [userList, setUserList] = useState<(berty.messenger.v1.IMember | undefined)[]>([])
	const scrollViewRef = createRef<ScrollView>()
	const client = useMessengerClient()
	const members = useConversationMembersDict(convPk)

	const getReactionList = useCallback(async () => {
		const r = (await client?.interactionReactionsForEmoji({
			emoji: currentEmoji,
			interactionCid: cid,
		})) as berty.messenger.v1.InteractionReactionsForEmoji.Reply

		setUserList(
			Object.values(members).filter(member =>
				r?.reactions.find(reaction => reaction.memberPublicKey === member?.publicKey),
			) || [],
		)
	}, [cid, client, currentEmoji, members])

	useEffect(() => {
		setCurrentEmoji(emoji)
	}, [emoji])

	useEffect(() => {
		getReactionList().then()
	}, [getReactionList, currentEmoji])

	useEffect(() => {
		const index = reactions.findIndex(({ emoji }) => emoji === currentEmoji)
		setTimeout(
			() => {
				scrollViewRef.current?.scrollTo({
					x: dataSourceCords ? dataSourceCords[index] : 0,
					y: 0,
					animated: true,
				})
			},
			(dataSourceCords || []).length === reactions.length ? 0 : 50,
		)
		scrollViewRef.current?.scrollTo({
			x: dataSourceCords ? dataSourceCords[index] : 0,
			y: 0,
			animated: true,
		})
	}, [currentEmoji, dataSourceCords, reactions, scrollViewRef])

	return (
		<View>
			<ScrollView horizontal ref={scrollViewRef} style={[padding.vertical.small]}>
				{reactions.map(({ emoji, count }) => (
					<TouchableOpacity
						style={[
							margin.small,
							margin.horizontal.small,
							padding.small,
							border.radius.small,

							{
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor:
									currentEmoji === emoji ? colors['background-header'] : colors['input-background'],
							},
						]}
						key={`reaction-list${emoji}`}
						onPress={() => setCurrentEmoji(emoji)}
						onLayout={e => {
							if (!dataSourceCords) {
								setDataSourceCords(
									reactions.reduce(p => {
										return [...p, p[p.length - 1] + e.nativeEvent.layout.width + 25]
									}, Array(1).fill(0)),
								)
							}
						}}
					>
						<UnifiedText style={[padding.right.small]}>{`${getEmojiByName(
							emoji as string,
						)}`}</UnifiedText>
						<AnimatedNumber
							count={count as unknown as number}
							style={[
								text.size.small,
								text.bold,
								{
									color:
										currentEmoji === emoji
											? colors['main-background']
											: colors['background-header'],
								},
							]}
						/>
					</TouchableOpacity>
				))}
			</ScrollView>
			<View style={{ height: 300 }}>
				<View>
					<UnifiedText
						style={[
							padding.medium,
							text.size.small,
							text.bold,
							{ color: colors['background-header'] },
						]}
					>
						{currentEmoji}
					</UnifiedText>
				</View>
				<FlatList
					data={userList}
					keyExtractor={member => member.publicKey}
					renderItem={() => (
						<View style={[padding.left.medium, { alignItems: 'flex-start' }]}>
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
		</View>
	)
}

export const Reactions: FC<{
	reactions: berty.messenger.v1.Interaction.IReactionView[]
	onEmojiKeyboard: () => void
	onRemoveEmoji: (emoji: string, remove: boolean) => void
	cid: string
	convPk: string
}> = ({ reactions, onEmojiKeyboard, onRemoveEmoji, cid, convPk }) => {
	const { margin, padding, border, text } = useStyles()
	const colors = useThemeColor()
	const inte = useAppSelector(state => selectInteraction(state, convPk, cid))
	const [isVisible, setIsVisible] = useState<boolean>(false)
	const [emoji, setEmoji] = useState<string | null | undefined>('')

	if (!reactions.length) {
		return null
	}

	return (
		<>
			<View style={{ flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
				{reactions
					.filter(({ emoji }) => typeof emoji === 'string')
					.map(({ emoji, ownState, count }) => (
						<TouchableOpacity
							onPress={() => {
								if (ownState) {
									onRemoveEmoji(emoji!, true)
								}
							}}
							onLongPress={() => {
								setIsVisible(true)
								setEmoji(emoji)
							}}
							key={`reaction-list${emoji}`}
						>
							<View
								style={[
									padding.tiny,
									margin.right.tiny,
									margin.bottom.tiny,
									border.radius.small,
									{
										flexDirection: 'row',
										borderColor: colors['background-header'],
										backgroundColor: ownState
											? colors['background-header']
											: colors['input-background'],
										borderWidth: 1,
										alignItems: 'center',
									},
								]}
							>
								<UnifiedText style={[text.size.tiny, { marginHorizontal: 2 }]}>
									{`${getEmojiByName(emoji as string)}`}
								</UnifiedText>
								<AnimatedNumber
									count={count as unknown as number}
									style={[
										text.size.tiny,
										{ color: ownState ? colors['main-background'] : colors['background-header'] },
									]}
								/>
							</View>
						</TouchableOpacity>
					))}
				{!inte?.isMine && (
					<TouchableOpacity onPress={onEmojiKeyboard}>
						<View
							style={[
								padding.tiny,
								margin.right.tiny,
								border.radius.small,
								{
									borderColor: colors['background-header'],
									backgroundColor: colors['input-background'],
									borderWidth: 1,
								},
							]}
						>
							<Icon name='plus-outline' width={18} height={18} fill={colors['background-header']} />
						</View>
					</TouchableOpacity>
				)}
			</View>
			{isVisible && emoji?.length && (
				<BottomModal isVisible={isVisible} setIsVisible={setIsVisible}>
					<ReactionList
						reactions={reactions}
						emoji={emoji}
						cid={cid}
						convPk={convPk}
						close={() => setIsVisible(false)}
					/>
				</BottomModal>
			)}
		</>
	)
}
