import React, { useState } from 'react'
import { View, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native'
import { Layout, Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty/contexts/styles'
import messengerMethodsHooks from '@berty/store/methods'
import { useThemeColor } from '@berty/store'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { selectInvitationListMembers } from '@berty/redux/reducers/groupCreationForm.reducer'
import { useAppDispatch, useAppSelector, usePlaySound } from '@berty/hooks'
import { FooterCreateGroup } from '@berty/components/create-group/CreateGroupFooter'
import { ButtonSettingItem } from '@berty/components/shared-components/SettingsButtons'
import { IOSOnlyKeyboardAvoidingView } from '@berty/rnutil/keyboardAvoiding'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { Header } from '@berty/components/create-group/CreateGroupHeader'
import { MemberList } from '@berty/components/create-group/CreateGroupMemberList'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const useStylesCreateGroup = () => {
	const { padding, height, width, absolute, border, column, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	return {
		newGroup: height(30),
		newGroup2ItemName: padding.top.tiny,
		addMembersItem: [padding.vertical.small, padding.horizontal.tiny],
		separateBar: [border.scale(0.5), { borderColor: `${colors['secondary-text']}70` }], // opacity
		addMembers: border.radius.medium,
		newGroup2ItemDelete: [
			height(25),
			width(25),
			absolute.scale({ top: 5, right: 10 }),
			border.radius.medium,
		],
		newGroup2: height(200),
		groupInfoProfilePhoto: [
			height(65 * scaleSize),
			width(65 * scaleSize),
			border.radius.scale(65 / 2),
		],
		groupInfoAboutGroupsText: text.size.medium,
		memberItemDelete: [
			height(25),
			width(25),
			absolute.scale({ top: 5, right: 10 }),
			border.shadow.medium,
			border.radius.medium,
			absolute.top,
			column.justify,
			{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
		],
	}
}

const _stylesCreateGroup = StyleSheet.create({
	groupInfoAboutGroupsItems: {
		opacity: 0.7,
	},
})

type GroupInfoProps = { onGroupNameChange: (name: string) => void }

const GroupInfo: React.FC<GroupInfoProps> = ({ onGroupNameChange }) => {
	const { row, column, margin, flex, border, padding, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	const _styles = useStylesCreateGroup()

	return (
		<View style={[padding.horizontal.large]}>
			<View style={[row.center]}>
				<View
					style={[
						row.item.justify,
						column.justify,
						_styles.groupInfoProfilePhoto,
						{ backgroundColor: colors['positive-asset'] },
					]}
				>
					<Icon
						name='camera-outline'
						height={30 * scaleSize}
						width={30 * scaleSize}
						fill={colors['background-header']}
						style={row.item.justify}
					/>
				</View>
				<View
					style={[
						margin.left.medium,
						flex.tiny,
						row.item.justify,
						padding.small,
						border.radius.small,
						{ backgroundColor: colors['input-background'] },
					]}
				>
					<TextInput
						style={[
							margin.left.small,
							text.light,
							text.size.medium,
							{
								fontFamily: 'Open Sans',
								color: colors['background-header'],
							},
						]}
						placeholder={t('main.home.create-group-finalize.placeholder')}
						placeholderTextColor={colors['secondary-text']}
						onChangeText={onGroupNameChange}
						autoCorrect={false}
					/>
				</View>
			</View>
			<TouchableOpacity
				activeOpacity={0.9}
				style={[
					border.radius.medium,
					border.shadow.medium,
					padding.medium,
					margin.top.medium,
					{ shadowColor: colors.shadow },
				]}
			>
				<View style={[row.fill]}>
					<View style={[row.center]}>
						<Icon
							name='info-outline'
							height={30 * scaleSize}
							width={30 * scaleSize}
							fill={colors['background-header']}
							style={row.item.justify}
						/>
						<UnifiedText
							style={[margin.left.medium, row.item.justify, _styles.groupInfoAboutGroupsText]}
						>
							{t('main.home.create-group-finalize.about')}
						</UnifiedText>
					</View>
				</View>
				<View style={[margin.top.medium, _stylesCreateGroup.groupInfoAboutGroupsItems]}>
					<ButtonSettingItem
						value={t('main.home.create-group-finalize.first-bullet-point')}
						color={colors['main-text']}
						iconColor={colors['background-header']}
					/>
					<ButtonSettingItem
						value={t('main.home.create-group-finalize.second-bullet-point')}
						color={colors['main-text']}
						iconColor={colors['background-header']}
					/>
					<ButtonSettingItem
						value={t('main.home.create-group-finalize.third-bullet-point')}
						color={colors['main-text']}
						iconColor={colors['background-header']}
					/>
					<ButtonSettingItem
						value={t('main.home.create-group-finalize.fourth-bullet-point')}
						color={colors['main-text']}
						icon='close-circle'
						iconColor={colors['warning-asset']}
					/>
					<ButtonSettingItem
						value={t('main.home.create-group-finalize.fifth-bullet-point')}
						color={colors['main-text']}
						icon='close-circle'
						iconColor={colors['warning-asset']}
					/>
				</View>
			</TouchableOpacity>
		</View>
	)
}

export const CreateGroupFinalize: ScreenFC<'Chat.CreateGroupFinalize'> = () => {
	const { goBack, reset } = useNavigation()
	const [groupName, setGroupName] = useState('New group')
	const { call, error, done, reply, loading } = messengerMethodsHooks.useConversationCreate()
	const members = useAppSelector(selectInvitationListMembers)
	const dispatch = useAppDispatch()

	const createGroup = React.useCallback(
		() => call({ displayName: groupName, contactsToInvite: members.map(m => m.publicKey) as any }),
		[groupName, members, call],
	)
	const { flex, padding } = useStyles()
	const colors = useThemeColor()
	const playSound = usePlaySound()
	const { t }: { t: any } = useTranslation()

	React.useEffect(() => {
		if (done) {
			if (error) {
				console.warn('Failed to create group:', error)
			} else if (reply?.publicKey) {
				reset({
					index: 0,
					routes: [
						{
							name: 'Chat.Home',
						},
						{
							name: 'Chat.Group',
							params: {
								convId: reply.publicKey,
							},
						},
					],
				})
			}
		}
	}, [done, error, reset, reply, dispatch])
	return (
		<Layout style={[flex.tiny]}>
			<IOSOnlyKeyboardAvoidingView behavior='position'>
				<ScrollView>
					<View style={{ backgroundColor: colors['background-header'] }}>
						<View>
							<MemberList />
							<Header
								title={t('main.home.create-group.add-members')}
								onPress={() => goBack()}
								style={[padding.bottom.small]}
								first
							/>
						</View>
						<Header title={t('main.home.create-group.group-info')}>
							<GroupInfo onGroupNameChange={setGroupName} />
							<FooterCreateGroup
								title={t('main.home.create-group.create-group')}
								titleStyle={{ textTransform: 'uppercase' }}
								action={() => {
									createGroup()
									playSound('groupCreated')
								}}
								loading={loading}
							/>
						</Header>
					</View>
				</ScrollView>
			</IOSOnlyKeyboardAvoidingView>
		</Layout>
	)
}
