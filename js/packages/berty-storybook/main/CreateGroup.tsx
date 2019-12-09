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
import { styles, colors } from '@berty-tech/styles'
import { SDTSModalComponent } from '../shared-components/SDTSModalComponent'
import { CircleAvatar } from '../shared-components/CircleAvatar'
import { ButtonSettingItem } from '../shared-components/SettingsButtons'

const Screen = Dimensions.get('window')

// Styles
const _stylesCreateGroup = StyleSheet.create({
	newGroup: {
		height: 30,
	},
	addMembersItem: {
		paddingVertical: 10,
		paddingHorizontal: 5,
	},
	separateBar: {
		borderWidth: 0.5,
		borderColor: colors.grey,
		opacity: 0.3,
	},
	addMembers: {
		borderRadius: 14,
	},
	newGroup2ItemName: {
		paddingTop: 5,
	},
	newGroup2ItemDelete: {
		right: 10,
		top: 5,
		height: 25,
		width: 25,
		borderRadius: 15,
	},
	newGroup2: {
		height: 200,
	},
	footerCreateGroup: {
		paddingHorizontal: 60,
		marginBottom: 40,
	},
	footerCreateGroupButton: {
		borderRadius: 8,
	},
	footerCreateGroupText: {
		fontSize: 16,
	},
	groupInfoProfilePhoto: {
		height: 65,
		width: 65,
		borderRadius: 32.5,
	},
	groupInfoAboutGroupsText: {
		fontSize: 16,
	},
	groupInfoAboutGroupsItems: {
		opacity: 0.7,
	},
})

// Type
type AddMembersItemProps = {
	separateBar?: boolean
}

type AddMembersProps = {
	height: number
	paddingBottom?: number
}

type FooterCreateGroupProps = {
	title: string
	icon?: string
}

const NewGroup: React.FC<{}> = () => <View style={_stylesCreateGroup.newGroup} />

const AddMembersItem: React.FC<AddMembersItemProps> = ({ separateBar = true }) => {
	const [checked, setChecked] = useState()
	return (
		<View>
			<View
				style={[
					styles.row,
					styles.spaceBetween,
					styles.alignItems,
					_stylesCreateGroup.addMembersItem,
				]}
			>
				<View style={[styles.row, styles.alignItems]}>
					<CircleAvatar
						avatarUri='https://s3.amazonaws.com/uifaces/faces/twitter/msveet/128.jpg'
						withCircle={false}
						size={50}
					/>
					<Text style={[styles.littleMarginLeft]}>Alice</Text>
				</View>
				<View>
					<CheckBox checked={checked} onChange={(isChecked: any) => setChecked(isChecked)} />
				</View>
			</View>
			{separateBar && <View style={[_stylesCreateGroup.separateBar]} />}
		</View>
	)
}

const AddMembers: React.FC<AddMembersProps> = ({ height, paddingBottom }) => (
	<View style={[styles.paddingHorizontal]}>
		<View
			style={[
				styles.bgLightGrey,
				styles.row,
				styles.alignItems,
				styles.littlePadding,
				_stylesCreateGroup.addMembers,
			]}
		>
			<Icon name='search-outline' width={30} height={30} fill={colors.grey} />
			<Text style={[styles.textGrey, styles.littleMarginLeft]}>Search</Text>
		</View>
		<View style={[{ height }]}>
			<ScrollView
				contentContainerStyle={[
					styles.paddingTop,
					paddingBottom ? { paddingBottom } : styles.paddingBottom,
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

export const CreateGroup: React.FC<{}> = () => {
	const firstNotToggledPoint = 187 - 50
	const firstToggledPoint = firstNotToggledPoint

	const secondNotToggledPoint = -Screen.height + 187
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
							dragEnabled: false,
						},
					]}
				>
					<AddMembers height={Screen.height - 300} />
					<NewGroup />
				</SDTSModalComponent>
			</SafeAreaView>
		</Layout>
	)
}

const NewGroup2Item: React.FC<{}> = () => (
	<View style={[styles.paddingHorizontal]}>
		<View style={[styles.col, styles.centerItems, styles.alignItems, styles.littlePaddingTop]}>
			<CircleAvatar
				avatarUri='https://s3.amazonaws.com/uifaces/faces/twitter/msveet/128.jpg'
				size={65}
				diffSize={7}
			/>
			<Text style={[styles.textWhite, _stylesCreateGroup.newGroup2ItemName]}>Alice</Text>
		</View>
		<TouchableOpacity
			style={[
				styles.absolute,
				styles.bgWhite,
				styles.alignItems,
				styles.spaceCenter,
				_stylesCreateGroup.newGroup2ItemDelete,
			]}
		>
			<Icon name='close-outline' width={20} height={20} fill={colors.red} />
		</TouchableOpacity>
	</View>
)

const NewGroup2: React.FC<{}> = () => (
	<View style={[_stylesCreateGroup.newGroup2]}>
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

const FooterCreateGroup: React.FC<FooterCreateGroupProps> = ({ title, icon }) => (
	<View
		style={[
			styles.absolute,
			styles.bottom,
			styles.left,
			styles.right,
			_stylesCreateGroup.footerCreateGroup,
		]}
	>
		<TouchableOpacity
			style={[
				styles.bgLightBlue,
				styles.row,
				styles.alignItems,
				styles.spaceCenter,
				styles.paddingHorizontal,
				styles.littlePaddingVertical,
				_stylesCreateGroup.footerCreateGroupButton,
			]}
		>
			<View style={styles.center}>
				<Text
					style={[
						styles.textBold,
						styles.textBlue,
						styles.marginRight,
						styles.textCenter,
						styles.center,
						_stylesCreateGroup.footerCreateGroupText,
					]}
				>
					{title}
				</Text>
			</View>
			{icon && (
				<View style={styles.center}>
					<Icon name='arrow-forward-outline' width={30} height={30} fill={colors.blue} />
				</View>
			)}
		</TouchableOpacity>
	</View>
)

export const CreateGroup2: React.FC<{}> = () => {
	const firstNotToggledPoint = 325
	const firstToggledPoint = firstNotToggledPoint

	const secondNotToggledPoint = -Screen.height + 200 + 90 + 70
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
							dragEnabled: false,
						},
					]}
				>
					<AddMembers height={Screen.height - 187 - 230} paddingBottom={110} />
					<NewGroup2 />
				</SDTSModalComponent>
			</SafeAreaView>
			<FooterCreateGroup title='CONTINUE' icon='arrow-forward-outline' />
		</Layout>
	)
}

const GroupInfo: React.FC<{}> = () => (
	<View>
		<View style={[styles.row, styles.spaceCenter, styles.alignItems]}>
			<View
				style={[
					styles.bgLightBlue,
					styles.spaceCenter,
					styles.alignItems,
					_stylesCreateGroup.groupInfoProfilePhoto,
				]}
			>
				<Icon name='camera-outline' height={30} width={30} fill={colors.blue} />
			</View>
			<View style={[styles.marginLeft, styles.flex]}>
				<Input placeholder='Name of the group' />
			</View>
		</View>
		<TouchableOpacity
			style={[
				styles.bgWhite,
				styles.borderRadius,
				styles.shadow,
				styles.padding,
				styles.bigMarginTop,
			]}
		>
			<View style={[styles.row, styles.alignItems, styles.spaceBetween]}>
				<View style={[styles.row, styles.alignItems]}>
					<Icon name='info-outline' height={30} width={30} fill={colors.blue} />
					<Text
						style={[
							styles.textBlack,
							styles.marginLeft,
							_stylesCreateGroup.groupInfoAboutGroupsText,
						]}
					>
						About groups
					</Text>
				</View>
				<Icon name='arrow-ios-upward' width={30} height={30} fill={colors.black} />
			</View>
			<View style={[styles.marginTop, _stylesCreateGroup.groupInfoAboutGroupsItems]}>
				<ButtonSettingItem
					value='Anyone in the grup can rename the group or invite new members'
					color='rgba(43,46,77,0.8)'
					iconColor={colors.blue}
				/>
				<ButtonSettingItem
					value='You can invite members by link'
					color='rgba(43,46,77,0.8)'
					iconColor={colors.blue}
				/>
				<ButtonSettingItem
					value='You can leave the group'
					color='rgba(43,46,77,0.8)'
					iconColor={colors.blue}
				/>
				<ButtonSettingItem
					value='You cannot delete the group'
					color='rgba(43,46,77,0.8)'
					icon='close-circle'
					iconColor={colors.red}
				/>
				<ButtonSettingItem
					value='You cannot remove a member from group'
					color='rgba(43,46,77,0.8)'
					icon='close-circle'
					iconColor={colors.red}
				/>
			</View>
		</TouchableOpacity>
	</View>
)

export const CreateGroup3: React.FC<{}> = () => {
	const firstToggledPoint = 265
	const firstNotToggledPoint = firstToggledPoint

	const secondToggledPoint = -215
	const secondNotToggledPoint = secondToggledPoint

	const thirdToggledPoint = -Screen.height + 200 + 90 + 70
	const thirdNotToggledPoint = thirdToggledPoint

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
						},
						{
							toggledPoint: thirdToggledPoint,
							notToggledPoint: thirdNotToggledPoint,
							title: 'New group',
							titleColor: colors.white,
							icon: 'people-outline',
							iconColor: colors.white,
							bgColor: colors.blue,
							dragEnabled: false,
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
