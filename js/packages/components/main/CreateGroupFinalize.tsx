import React, { useState } from 'react'
import { View, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'

import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/navigation'
import messengerMethodsHooks from '@berty-tech/store/methods'

import { FooterCreateGroup } from './CreateGroupFooter'
import { CreateGroupHeader } from './CreateGroupAddMembers'
import { Header } from './CreateGroupAddMembers'
import { ButtonSettingItem } from '../shared-components/SettingsButtons'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

const useStylesCreateGroup = () => {
	const [{ padding, height, width, absolute, border, column, text, background }] = useStyles()
	return {
		newGroup: height(30),
		newGroup2ItemName: padding.top.tiny,
		addMembersItem: [padding.vertical.small, padding.horizontal.tiny],
		separateBar: [border.scale(0.5), border.color.light.grey], // opacity
		addMembers: border.radius.medium,
		newGroup2ItemDelete: [
			height(25),
			width(25),
			absolute.scale({ top: 5, right: 10 }),
			border.radius.medium,
		],
		newGroup2: height(200),
		groupInfoProfilePhoto: [height(65), width(65), border.radius.scale(65 / 2)],
		groupInfoAboutGroupsText: text.size.medium,
		memberItemDelete: [
			height(25),
			width(25),
			absolute.scale({ top: 5, right: 10 }),
			border.shadow.medium,
			border.radius.medium,
			background.white,
			absolute.top,
			column.justify,
		],
	}
}

const _stylesCreateGroup = StyleSheet.create({
	groupInfoAboutGroupsItems: {
		opacity: 0.7,
	},
})

const MemberItem: React.FC<{ member: any; onRemove: () => void }> = ({ member, onRemove }) => {
	const [{ padding, column, text, color, row, maxWidth }] = useStyles()
	const _styles = useStylesCreateGroup()

	return (
		<View style={[padding.horizontal.medium, maxWidth(100)]}>
			<View style={[column.top, padding.top.small]}>
				<ProceduralCircleAvatar seed={member.publicKey} diffSize={20} size={70} />
				<Text style={[text.color.white, column.item.center, padding.top.tiny]} numberOfLines={1}>
					{member.displayName}
				</Text>
			</View>
			<TouchableOpacity style={[_styles.memberItemDelete]} onPress={onRemove}>
				<Icon
					name='close-outline'
					width={20}
					height={20}
					fill={color.red}
					style={row.item.justify}
				/>
			</TouchableOpacity>
		</View>
	)
}

const MemberList: React.FC<{
	members: any[]
	onRemoveMember: (id: string) => void
}> = ({ members, onRemoveMember }) => {
	const [{ height, padding }] = useStyles()

	return (
		<View style={[height(135)]}>
			<ScrollView
				horizontal={true}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[padding.left.medium]}
			>
				{members.map((member: any) => (
					<MemberItem member={member} onRemove={() => onRemoveMember(member.publicKey)} />
				))}
			</ScrollView>
		</View>
	)
}

type GroupInfoProps = { onGroupNameChange: (name: string) => void; layout: number }

const GroupInfo: React.FC<GroupInfoProps> = ({ onGroupNameChange, layout }) => {
	const [
		{ row, background, column, margin, flex, height, border, padding, color, text },
		{ scaleSize, windowHeight },
	] = useStyles()
	const _styles = useStylesCreateGroup()
	const restScreen = windowHeight - layout - 400 * scaleSize // Rest of screen // 400 = size of the component (300) + header (90) + padding (10)
	const paddingBottom =
		restScreen < 90 * scaleSize ? 90 * scaleSize - restScreen + 20 * scaleSize : 0 // Padding in scrollview if the rest of screen was smaller than footer // 90 = size of footer, 20 = padding

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			bounces={paddingBottom ? true : false}
			style={[height(300 + restScreen), padding.horizontal.large]}
			contentContainerStyle={[padding.bottom.scale(paddingBottom)]}
		>
			<View style={[row.center]}>
				<View
					style={[
						background.light.blue,
						row.item.justify,
						column.justify,
						_styles.groupInfoProfilePhoto,
					]}
				>
					<Icon
						name='camera-outline'
						height={30}
						width={30}
						fill={color.blue}
						style={row.item.justify}
					/>
				</View>
				<View
					style={[
						margin.left.medium,
						flex.tiny,
						row.item.justify,
						background.light.grey,
						padding.small,
						border.radius.small,
						{ backgroundColor: '#F7F8FF' },
					]}
				>
					<TextInput
						style={[
							margin.left.small,
							text.bold.small,
							{ fontFamily: 'Open Sans', color: '#AFB1C0' },
						]}
						placeholder='Group name'
						onChangeText={onGroupNameChange}
						autoCorrect={false}
					/>
				</View>
			</View>
			<TouchableOpacity
				style={[border.radius.medium, border.shadow.medium, padding.medium, margin.top.medium]}
			>
				<View style={[row.fill]}>
					<View style={[row.center]}>
						<Icon
							name='info-outline'
							height={30}
							width={30}
							fill={color.blue}
							style={row.item.justify}
						/>
						<Text
							style={[
								text.color.black,
								margin.left.medium,
								row.item.justify,
								_styles.groupInfoAboutGroupsText,
							]}
						>
							About groups
						</Text>
					</View>
					<Icon
						name='arrow-ios-upward'
						width={30}
						height={30}
						fill={color.black}
						style={row.item.justify}
					/>
				</View>
				<View style={[margin.top.medium, _stylesCreateGroup.groupInfoAboutGroupsItems]}>
					<ButtonSettingItem
						value='Anyone in the group can rename it or invite new members'
						color='rgba(43,46,77,0.8)'
						iconColor={color.blue}
					/>
					<ButtonSettingItem
						value='You can invite members by link'
						color='rgba(43,46,77,0.8)'
						iconColor={color.blue}
					/>
					<ButtonSettingItem
						value='You can leave this group'
						color='rgba(43,46,77,0.8)'
						iconColor={color.blue}
					/>
					<ButtonSettingItem
						value='You cannot delete this group'
						color='rgba(43,46,77,0.8)'
						icon='close-circle'
						iconColor={color.red}
					/>
					<ButtonSettingItem
						value='You cannot remove a member from this group'
						color='rgba(43,46,77,0.8)'
						icon='close-circle'
						iconColor={color.red}
					/>
				</View>
			</TouchableOpacity>
		</ScrollView>
	)
}

export const CreateGroupFinalize: React.FC<{
	members: any[]
	onRemoveMember: (id: string) => void
}> = ({ members, onRemoveMember }) => {
	const navigation = useNavigation()
	const { navigate } = useNativeNavigation()
	const [groupName, setGroupName] = useState('New group')
	const { refresh, error, done } = (messengerMethodsHooks as any).useConversationCreate()
	const createGroup = React.useCallback(
		() => refresh({ displayName: groupName, contactsToInvite: members.map((m) => m.publicKey) }),
		[groupName, members, refresh],
	)
	const [layout, setLayout] = useState<number>(0)
	const [{ flex, background, padding }] = useStyles()

	React.useEffect(() => {
		// TODO: better handle error
		if (done) {
			if (error) {
				console.error('Failed to create group:', error)
			} else {
				navigation.navigate.main.home()
			}
		}
	}, [done, error, navigation.navigate.main])

	return (
		<Layout style={[flex.tiny]}>
			<SwipeNavRecognizer
				onSwipeUp={() => navigate('Main.HomeModal')}
				onSwipeDown={() => navigate('Main.HomeModal')}
				onSwipeLeft={() => navigate('Main.HomeModal')}
				onSwipeRight={() => navigate('Main.HomeModal')}
			>
				<SafeAreaView style={[background.blue]}>
					<View onLayout={(e) => setLayout(e.nativeEvent.layout.height)}>
						<CreateGroupHeader />
						<MemberList members={members} onRemoveMember={onRemoveMember} />
						<Header
							title='Add members'
							onPress={navigation.goBack}
							style={[padding.bottom.small]}
							first
						/>
					</View>
					<View style={[{ top: -5 }]}>
						<Header title='Group info'>
							<GroupInfo onGroupNameChange={setGroupName} layout={layout} />
						</Header>
					</View>
				</SafeAreaView>
				<FooterCreateGroup
					title='CREATE A GROUP'
					action={() => {
						createGroup()
					}}
				/>
			</SwipeNavRecognizer>
		</Layout>
	)
}
