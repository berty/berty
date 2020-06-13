import { ButtonSettingItem } from '../shared-components/SettingsButtons'
import React, { useState, useEffect } from 'react'
import { View, TouchableOpacity, TextInput, Dimensions, StyleSheet, ScrollView } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { scaleSize } from '@berty-tech/styles/constant'
import { useNavigation } from '@berty-tech/navigation'
import { Messenger } from '@berty-tech/hooks'
import { messenger } from '@berty-tech/store'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDimensions } from '@react-native-community/hooks'
import { FooterCreateGroup } from './CreateGroupFooter'
import { MemberList, CreateGroupHeader, AddMembersHeader } from './CreateGroupAddMembers'
import { Header } from './HomeModal'

const useStylesCreateGroup = () => {
	const [{ padding, height, width, absolute, border, margin, text }] = useStyles()
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
	}
}

const _stylesCreateGroup = StyleSheet.create({
	groupInfoAboutGroupsItems: {
		opacity: 0.7,
	},
})

type GroupInfoProps = { onGroupNameChange: (name: string) => void; layout: number }

const GroupInfo: React.FC<GroupInfoProps> = ({ onGroupNameChange, layout }) => {
	const [
		{ row, background, column, margin, flex, height, border, padding, color, text },
	] = useStyles()
	const _styles = useStylesCreateGroup()
	const dimensions = useDimensions().window
	const restScreen = dimensions.height - layout - 400 * scaleSize // Rest of screen // 400 = size of the component (300) + header (90) + padding (10)
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
					]}
				>
					<TextInput
						style={[text.color.grey, margin.left.small]}
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
	members: messenger.contact.Entity[]
	onRemoveMember: (id: string) => void
}> = ({ members, onRemoveMember }) => {
	const navigation = useNavigation()
	const [groupName, setGroupName] = useState('New group')
	const createGroup = Messenger.useConversationCreate({ name: groupName, members })
	const [layout, setLayout] = useState<number>(0)
	const [{ flex, background, padding }] = useStyles()

	return (
		<Layout style={[flex.medium]}>
			<SafeAreaView style={[flex.medium, background.blue]}>
				<View onLayout={(e) => setLayout(e.nativeEvent.layout.height)}>
					<CreateGroupHeader />
					<MemberList members={members} onRemoveMember={onRemoveMember} />
					<Header title='Add members' onPress={navigation.goBack} first />
				</View>
				<Header title='Group info'>
					<GroupInfo onGroupNameChange={setGroupName} layout={layout} />
				</Header>
			</SafeAreaView>
			<FooterCreateGroup title='CREATE A GROUP' action={() => createGroup()} />
		</Layout>
	)
}
