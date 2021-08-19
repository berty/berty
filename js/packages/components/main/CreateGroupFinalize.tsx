import React, { useState } from 'react'
import { View, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useStyles } from '@berty-tech/styles'
import { Routes } from '@berty-tech/navigation'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useMsgrContext } from '@berty-tech/store/context'
import { useThemeColor } from '@berty-tech/store/hooks'

import { FooterCreateGroup } from './CreateGroupFooter'
import { CreateGroupHeader } from './CreateGroupAddMembers'
import { Header } from './CreateGroupAddMembers'
import { ButtonSettingItem } from '../shared-components/SettingsButtons'
import { MemberList } from './CreateGroupAddMembers'

const useStylesCreateGroup = () => {
	const [{ padding, height, width, absolute, border, column, text }, { scaleSize }] = useStyles()
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
			{ backgroundColor: colors['main-background'] },
		],
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
		{ row, column, margin, flex, height, border, padding, text },
		{ scaleSize, windowHeight },
	] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	const _styles = useStylesCreateGroup()
	const insets = useSafeAreaInsets()
	const restScreen = windowHeight - layout - 380 * scaleSize - insets.bottom // Rest of screen // 400 = size of the component (300) + header (90) + padding (10)
	return (
		<View style={[height(300 + restScreen), padding.horizontal.large]}>
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
							text.bold.small,
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
				style={[border.radius.medium, border.shadow.medium, padding.medium, margin.top.medium]}
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
						<Text
							style={[
								margin.left.medium,
								row.item.justify,
								_styles.groupInfoAboutGroupsText,
								{ color: colors['main-text'] },
							]}
						>
							{t('main.home.create-group-finalize.about')}
						</Text>
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

export const CreateGroupFinalize: React.FC<{
	members: any[]
	onRemoveMember: (id: string) => void
}> = ({ members, onRemoveMember }) => {
	const { goBack, reset } = useNativeNavigation()
	const [groupName, setGroupName] = useState('New group')
	const { call, error, done, reply } = (messengerMethodsHooks as any).useConversationCreate()

	const createGroup = React.useCallback(
		() => call({ displayName: groupName, contactsToInvite: members.map(m => m.publicKey) }),
		[groupName, members, call],
	)
	const [layout, setLayout] = useState<number>(0)
	const [{ flex, padding }] = useStyles()
	const colors = useThemeColor()
	const ctx = useMsgrContext()
	const insets = useSafeAreaInsets()
	const { t }: { t: any } = useTranslation()

	React.useEffect(() => {
		// TODO: better handle error
		if (done) {
			if (error) {
				console.error('Failed to create group:', error)
			} else if (reply?.publicKey) {
				reset({
					index: 0,
					routes: [
						{
							name: Routes.Main.Home,
						},
						{
							name: Routes.Chat.Group,
							params: {
								convId: reply.publicKey,
							},
						},
					],
				})
			}
		}
	}, [done, error, reset, reply])
	return (
		<Layout style={[flex.tiny]}>
			<SafeAreaView style={{ backgroundColor: colors['background-header'] }}>
				<View onLayout={e => setLayout(e.nativeEvent.layout.height)}>
					<CreateGroupHeader />
					<MemberList members={members} onRemoveMember={onRemoveMember} />
					<Header
						title={t('main.home.create-group.add-members')}
						onPress={() => goBack()}
						style={[padding.bottom.small]}
						first
					/>
				</View>
				<View style={[{ top: -5, paddingBottom: insets.bottom }]}>
					<Header title={t('main.home.create-group.group-info')}>
						<GroupInfo onGroupNameChange={setGroupName} layout={layout} />
					</Header>
				</View>
			</SafeAreaView>
			<FooterCreateGroup
				title={t('main.home.create-group.create-group')}
				action={() => {
					createGroup()
					ctx.playSound('groupCreated')
				}}
			/>
		</Layout>
	)
}
