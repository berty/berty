import { berty } from '@berty-tech/api/root.pb'
import { getEmojiByName } from '@berty-tech/components/utils'
import { useMessengerClient, useThemeColor } from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import React, { createRef, FC, useCallback, useEffect, useState } from 'react'
import { Modal, Text, View } from 'react-native'
import AddEmojiIcon from '@berty-tech/assets/add_emoji.svg'
import AnimatedNumber from '@berty-tech/components/shared-components/AnimatedNumber'
import {
	FlatList,
	ScrollView,
	TouchableOpacity,
	TouchableWithoutFeedback,
} from 'react-native-gesture-handler'
import { useConversationMembersDict } from '@berty-tech/react-redux'
import { ContactAvatar } from '@berty-tech/components/avatars'

const MemberItem: React.FC<{ member: any; divider: boolean }> = ({ member, divider = true }) => {
	const [{ row, margin, padding, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<View style={[row.left, row.item.justify, padding.vertical.small, { flexShrink: 1 }]}>
				<ContactAvatar size={50 * scaleSize} publicKey={member?.publicKey} />
				<Text
					numberOfLines={1}
					style={[
						margin.left.small,
						row.item.justify,
						{ flexShrink: 1, color: colors['main-text'] },
					]}
				>
					{member?.displayName!}
				</Text>
			</View>
			{divider && (
				<View style={[border.scale(0.6), { borderColor: `${colors['secondary-text']}90` }]} />
			)}
		</View>
	)
}

const ReactionList: FC<{
	closeModal: () => void
	reactions: berty.messenger.v1.Interaction.IReactionView[]
	emoji: string | null | undefined
	cid: string
	convPk: string
}> = ({ reactions, closeModal, emoji, cid, convPk }) => {
	const colors = useThemeColor()
	const [{ padding, border, margin }] = useStyles()
	const [currentEmoji, setCurrentEmoji] = useState<string | null | undefined>(emoji)
	const [dataSourceCords, setDataSourceCords] = useState<number[] | undefined>()
	const [userList, setUserList] = useState<(berty.messenger.v1.IMember | undefined)[]>([])
	const scrollViewRef = createRef<ScrollView>()
	const client = useMessengerClient()
	const members = useConversationMembersDict(convPk)

	console.log({ members })

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
		getReactionList()
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
		<Modal
			transparent
			visible={!!currentEmoji}
			animationType='slide'
			style={{
				position: 'relative',
				flex: 1,
				height: '100%',
			}}
		>
			<View
				style={{
					zIndex: 999,
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					top: 0,
				}}
			>
				<TouchableWithoutFeedback onPress={closeModal} style={{ height: '100%' }} />
			</View>
			<View
				style={{
					zIndex: 999,
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
				}}
			>
				<View style={{ width: '100%' }}>
					<View
						style={[
							border.radius.top.large,
							border.shadow.big,
							padding.bottom.large,
							{
								backgroundColor: colors['main-background'],
								shadowColor: colors.shadow,
							},
						]}
					>
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
													currentEmoji === emoji
														? colors['background-header']
														: colors['input-background'],
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
										<Text style={[padding.right.small]}>{`${getEmojiByName(
											emoji as string,
										)}`}</Text>
										<AnimatedNumber
											number={count as unknown as number}
											fontStyle={{
												fontSize: 12,
												fontWeight: 'bold',
												color:
													currentEmoji === emoji
														? colors['main-background']
														: colors['background-header'],
											}}
										/>
									</TouchableOpacity>
								))}
							</ScrollView>
							<View style={{ height: 300 }}>
								<View>
									<Text
										style={[
											padding.medium,
											{
												fontSize: 12,
												fontWeight: 'bold',
												color: colors['background-header'],
											},
										]}
									>
										{currentEmoji}
									</Text>
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
					</View>
				</View>
			</View>
		</Modal>
	)
}

export const Reactions: FC<{
	reactions: berty.messenger.v1.Interaction.IReactionView[]
	onEmojiKeyboard: () => void
	onRemoveEmoji: (emoji: string, remove: boolean) => void
	cid: string
	convPk: string
}> = ({ reactions, onEmojiKeyboard, onRemoveEmoji, cid, convPk }) => {
	const [{ margin, padding, border }] = useStyles()
	const colors = useThemeColor()
	const [emoji, setEmoji] = useState<string | null | undefined>()

	if (!reactions.length) {
		return null
	}

	return (
		<View style={{ flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
			<ReactionList
				closeModal={() => setEmoji(undefined)}
				reactions={reactions}
				emoji={emoji}
				cid={cid}
				convPk={convPk}
			/>
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
								},
							]}
						>
							<Text
								style={{
									marginHorizontal: 2,
									fontSize: 10,
								}}
							>
								{`${getEmojiByName(emoji as string)}`}
							</Text>
							<AnimatedNumber
								number={count as unknown as number}
								fontStyle={{
									fontSize: 10,
									color: ownState ? colors['main-background'] : colors['background-header'],
								}}
							/>
						</View>
					</TouchableOpacity>
				))}
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
					<AddEmojiIcon width={13} height={13} fill={colors['background-header']} />
				</View>
			</TouchableOpacity>
		</View>
	)
}
