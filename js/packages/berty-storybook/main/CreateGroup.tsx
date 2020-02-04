import React, { useState } from 'react'
import {
	View,
	SafeAreaView,
	ScrollView,
	TouchableOpacity,
	Dimensions,
	StyleSheet,
} from 'react-native'
import { Layout, Text, Icon, CheckBox, Input } from 'react-native-ui-kitten'
import { styles, colors, useStyles } from '@berty-tech/styles'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { ButtonSettingItem } from '../shared-components/SettingsButtons'
import { useNavigation } from '@berty-tech/berty-navigation'

const Screen = Dimensions.get('window')

// Styles
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
		footerCreateGroup: [padding.horizontal.scale(60), margin.bottom.scale(40)],
		footerCreateGroupButton: border.radius.small,
		footerCreateGroupText: text.size.medium,
		groupInfoProfilePhoto: [height(65), width(65), border.radius.scale(65 / 2)],
		groupInfoAboutGroupsText: text.size.medium,
	}
}

const _stylesCreateGroup = StyleSheet.create({
	groupInfoAboutGroupsItems: {
		opacity: 0.7,
	},
})

// Type
type AddMembersItemProps = {
	separateBar?: boolean
}

type AddMembersProps = {
	heightProps: number
	paddingBottom?: number
}

type FooterCreateGroupProps = {
	title: string
	icon?: string
	action?: any
}

const NewGroup: React.FC<{}> = () => {
	const _styles = useStylesCreateGroup()
	return <View style={_styles.newGroup} />
}

const AddMembersItem: React.FC<AddMembersItemProps> = ({ separateBar = true }) => {
	const [checked, setChecked] = useState()
	const [{ row, margin }] = useStyles()
	const _styles = useStylesCreateGroup()
	return (
		<View>
			<View style={[row.fill, _styles.addMembersItem]}>
				<View style={[row.left, row.item.justify]}>
					<CircleAvatar
						avatarUri='https://s3.amazonaws.com/uifaces/faces/twitter/msveet/128.jpg'
						size={50}
						style={[row.item.justify]}
					/>
					<Text style={[margin.left.small, row.item.justify]}>Alice</Text>
				</View>
				<View style={[row.item.justify]}>
					<CheckBox checked={checked} onChange={(isChecked: any) => setChecked(isChecked)} />
				</View>
			</View>
			{separateBar && <View style={[_styles.separateBar]} />}
		</View>
	)
}

const AddMembers: React.FC<AddMembersProps> = ({ heightProps, paddingBottom }) => {
	const [{ padding, background, row, height, color, text, margin }] = useStyles()
	const _styles = useStylesCreateGroup()

	return (
		<View style={[padding.horizontal.medium]}>
			<View style={[background.light.grey, padding.small, row.left, _styles.addMembers]}>
				<Icon
					name='search-outline'
					width={30}
					height={30}
					fill={color.grey}
					style={row.item.justify}
				/>
				<Text style={[text.color.grey, margin.left.small, row.item.justify]}>Search</Text>
			</View>
			<View style={[height(heightProps)]}>
				<ScrollView
					contentContainerStyle={[
						padding.top.medium,
						paddingBottom ? padding.bottom.scale(paddingBottom) : padding.bottom.medium,
					]}
					showsVerticalScrollIndicator={false}
				>
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem />
					<AddMembersItem separateBar={false} />
				</ScrollView>
			</View>
		</View>
	)
}

export const CreateGroup: React.FC<{}> = () => {
	const firstNotToggledPoint = 160 - 50
	const firstToggledPoint = firstNotToggledPoint

	const secondNotToggledPoint = -Screen.height + 160
	const secondToggledPoint = secondNotToggledPoint

	return (
		<Layout style={[styles.flex]}>
			<SafeAreaView style={styles.flex}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							title: 'Add members',
							dragEnabled: false,
							maxHeight: Screen.height - 90,
						},
						{
							toggledPoint: secondToggledPoint,
							notToggledPoint: secondNotToggledPoint,
							title: 'New group',
							titleColor: colors.white,
							icon: 'people-outline',
							iconColor: colors.white,
							bgColor: colors.blue,
						},
					]}
				>
					<AddMembers heightProps={Screen.height - 300} />
					<NewGroup />
				</SDTSModalComponent>
			</SafeAreaView>
		</Layout>
	)
}

const NewGroup2Item: React.FC<{}> = () => {
	const [{ padding, column, text, color, absolute, background, row }] = useStyles()
	const _styles = useStylesCreateGroup()

	return (
		<View style={[padding.horizontal.medium]}>
			<View style={[column.top, padding.top.small]}>
				<CircleAvatar
					avatarUri='https://s3.amazonaws.com/uifaces/faces/twitter/msveet/128.jpg'
					size={65}
					diffSize={7}
				/>
				<Text style={[text.color.white, column.item.center, _styles.newGroup2ItemName]}>Alice</Text>
			</View>
			<TouchableOpacity
				style={[background.white, absolute.top, column.justify, _styles.newGroup2ItemDelete]}
			>
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

const NewGroup2: React.FC<{}> = () => {
	const _styles = useStylesCreateGroup()
	return (
		<View style={[_styles.newGroup2]}>
			<ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
				<NewGroup2Item />
			</ScrollView>
		</View>
	)
}

const FooterCreateGroup: React.FC<FooterCreateGroupProps> = ({ title, icon, action }) => {
	const [{ absolute, background, row, padding, color, text, margin }] = useStyles()
	const _styles = useStylesCreateGroup()

	return (
		<View style={[absolute.bottom, absolute.left, absolute.right, _styles.footerCreateGroup]}>
			<TouchableOpacity onPress={action}>
				<View
					style={[
						background.light.blue,
						row.center,
						padding.horizontal.medium,
						padding.vertical.small,
						_styles.footerCreateGroupButton,
					]}
				>
					<View style={row.item.justify}>
						<Text
							style={[
								text.bold,
								text.color.blue,
								text.align.center,
								margin.right.medium,
								_styles.footerCreateGroupText,
							]}
						>
							{title}
						</Text>
					</View>
					{icon && (
						<View style={row.item.justify}>
							<Icon name='arrow-forward-outline' width={30} height={30} fill={color.blue} />
						</View>
					)}
				</View>
			</TouchableOpacity>
		</View>
	)
}

export const CreateGroup2: React.FC<{}> = () => {
	const firstNotToggledPoint = 230
	const firstToggledPoint = firstNotToggledPoint

	const secondNotToggledPoint = -Screen.height + 200 + 80
	const secondToggledPoint = secondNotToggledPoint
	const navigation = useNavigation()
	const [{ flex }] = useStyles()

	return (
		<Layout style={[flex.tiny]}>
			<SafeAreaView style={flex.tiny}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							title: 'Add members',
							dragEnabled: false,
							maxHeight: Screen.height - 90,
						},
						{
							toggledPoint: secondToggledPoint,
							notToggledPoint: secondNotToggledPoint,
							title: 'New group',
							titleColor: colors.white,
							icon: 'people-outline',
							iconColor: colors.white,
							bgColor: colors.blue,
						},
					]}
				>
					<AddMembers heightProps={Screen.height - 187 - 230} paddingBottom={120} />
					<NewGroup2 />
				</SDTSModalComponent>
			</SafeAreaView>
			<FooterCreateGroup
				title='CONTINUE'
				icon='arrow-forward-outline'
				action={navigation.navigate.main.createGroup.createGroup3}
			/>
		</Layout>
	)
}

const GroupInfo: React.FC<{}> = () => {
	const [{ row, background, column, margin, flex, border, padding, color, text }] = useStyles()
	const _styles = useStylesCreateGroup()

	return (
		<View>
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
				<View style={[margin.left.medium, flex.tiny, row.item.justify]}>
					<Input placeholder='Name of the group' />
				</View>
			</View>
			<TouchableOpacity
				style={[
					background.white,
					border.radius.medium,
					border.shadow.medium,
					padding.medium,
					margin.top.medium,
				]}
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
						value='Anyone in the grup can rename the group or invite new members'
						color='rgba(43,46,77,0.8)'
						iconColor={color.blue}
					/>
					<ButtonSettingItem
						value='You can invite members by link'
						color='rgba(43,46,77,0.8)'
						iconColor={color.blue}
					/>
					<ButtonSettingItem
						value='You can leave the group'
						color='rgba(43,46,77,0.8)'
						iconColor={color.blue}
					/>
					<ButtonSettingItem
						value='You cannot delete the group'
						color='rgba(43,46,77,0.8)'
						icon='close-circle'
						iconColor={color.red}
					/>
					<ButtonSettingItem
						value='You cannot remove a member from group'
						color='rgba(43,46,77,0.8)'
						icon='close-circle'
						iconColor={color.red}
					/>
				</View>
			</TouchableOpacity>
		</View>
	)
}

export const CreateGroup3: React.FC<{}> = () => {
	const firstToggledPoint = 300
	const firstNotToggledPoint = firstToggledPoint

	const secondToggledPoint = -170
	const secondNotToggledPoint = secondToggledPoint

	const thirdToggledPoint = -Screen.height + 200 + 210
	const thirdNotToggledPoint = thirdToggledPoint
	const navigation = useNavigation()

	return (
		<Layout style={[styles.flex]}>
			<SafeAreaView style={[styles.flex]}>
				<SDTSModalComponent
					rows={[
						{
							toggledPoint: firstToggledPoint,
							notToggledPoint: firstNotToggledPoint,
							title: 'Group info',
							dragEnabled: false,
							maxHeight: Screen.height - 90,
						},
						{
							toggledPoint: secondToggledPoint,
							notToggledPoint: secondNotToggledPoint,
							title: 'Add members',
							dragEnabled: false,
							headerAction: navigation.navigate.main.createGroup.createGroup2,
						},
						{
							toggledPoint: thirdToggledPoint,
							notToggledPoint: thirdNotToggledPoint,
							title: 'New group',
							titleColor: colors.white,
							icon: 'people-outline',
							iconColor: colors.white,
							bgColor: colors.blue,
						},
					]}
				>
					<GroupInfo />
					<View />
					<NewGroup2 />
				</SDTSModalComponent>
			</SafeAreaView>
			<FooterCreateGroup title='CREATE THE GROUP' />
		</Layout>
	)
}
