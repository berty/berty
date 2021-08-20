import React from 'react'
import {
	View,
	ScrollView,
	TouchableOpacity,
	Text as TextNative,
	TouchableWithoutFeedback,
	StatusBar,
} from 'react-native'
import { Layout, Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import { useContactList, useThemeColor } from '@berty-tech/store/hooks'
import { ContactPicker } from '@berty-tech/components/shared-components'

import { FooterCreateGroup } from './CreateGroupFooter'
import { ContactAvatar } from '../avatars'

export const Header: React.FC<{
	title: string
	icon?: string
	iconPack?: string
	first?: boolean
	disabled?: boolean
	onPress?: any
	style?: any
}> = ({
	children,
	title,
	icon,
	iconPack,
	first = false,
	disabled = false,
	onPress = null,
	style = null,
}) => {
	const [{ height, border, margin, row, padding, text, column, opacity }, { scaleHeight }] =
		useStyles()
	const colors = useThemeColor()

	return (
		<View style={[!first && { backgroundColor: colors['main-background'] }]}>
			<TouchableWithoutFeedback onPress={onPress}>
				<View
					style={[
						border.radius.top.scale(30),
						!first && border.shadow.big,
						disabled && opacity(0.5),
						{ backgroundColor: colors['main-background'] },
						style,
					]}
				>
					<View style={[height(90)]}>
						<View
							style={[
								margin.top.medium,
								row.item.justify,
								border.radius.scale(4),
								{
									backgroundColor: `${colors['secondary-text']}70`,
									height: 5 * scaleHeight,
									width: 60 * scaleHeight,
								},
							]}
						/>
						<View style={[margin.top.small]}>
							<View style={[row.fill, padding.horizontal.medium, padding.top.small]}>
								<TextNative
									style={[
										text.bold.medium,
										text.size.scale(25),
										column.item.center,
										{ color: colors['main-text'] },
									]}
								>
									{title}
								</TextNative>
								{icon && (
									<Icon
										name={icon}
										pack={iconPack}
										width={30}
										height={30}
										fill={colors['main-text']}
									/>
								)}
							</View>
						</View>
					</View>
					{children && <View>{children}</View>}
				</View>
			</TouchableWithoutFeedback>
		</View>
	)
}

const MemberItem: React.FC<{
	member: any
	onRemove: () => void
	canRemove: boolean | undefined
}> = ({ member, onRemove, canRemove }) => {
	const [{ padding, column, text, row, maxWidth, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[padding.horizontal.medium, maxWidth(100)]}>
			<View style={[column.top, padding.top.small]}>
				<ContactAvatar size={70 * scaleSize} publicKey={member.publicKey} />
				<TextNative
					numberOfLines={1}
					style={[
						column.item.center,
						padding.top.tiny,
						text.bold.medium,
						text.align.center,
						{ color: colors['reverted-main-text'] },
					]}
				>
					{member.displayName}
				</TextNative>
			</View>
			{canRemove === undefined ||
				(canRemove === true && (
					<TouchableOpacity
						style={[
							border.shadow.medium,
							border.radius.medium,
							column.justify,
							{
								height: 25 * scaleSize,
								width: 25 * scaleSize,
								position: 'absolute',
								top: 5 * scaleSize,
								right: 9 * scaleSize,
								backgroundColor: colors['main-background'],
							},
						]}
						onPress={onRemove}
					>
						<Icon
							name='close-outline'
							width={20 * scaleSize}
							height={20 * scaleSize}
							fill={colors['warning-asset']}
							style={row.item.justify}
						/>
					</TouchableOpacity>
				))}
		</View>
	)
}

export const MemberList: React.FC<{
	members: any[]
	onRemoveMember: (id: string) => void
	initialMembers?: any[]
}> = ({ members, onRemoveMember, initialMembers = [] }) => {
	const [{ padding }] = useStyles()

	return (
		<View style={{ height: 135 }}>
			<ScrollView
				horizontal={true}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[padding.left.medium]}
			>
				{members.map(member => (
					<MemberItem
						key={member.publicKey}
						member={member}
						onRemove={() => onRemoveMember(member.publicKey)}
						canRemove={
							initialMembers
								? !initialMembers.find(
										initialMember => initialMember.publicKey === member.publicKey,
								  )
								: undefined
						}
					/>
				))}
			</ScrollView>
		</View>
	)
}

export const CreateGroupAddMembers: React.FC<{
	onSetMember: (contact: any) => void
	onRemoveMember: (id: string) => void
	members: any[]
}> = ({ onSetMember, onRemoveMember, members }) => {
	const [{ flex, margin }, { scaleHeight }] = useStyles()
	const colors = useThemeColor()
	const navigation = useNavigation()
	const { t }: { t: any } = useTranslation()
	const accountContacts = useContactList()

	return (
		<Layout style={[flex.tiny]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<View style={{ backgroundColor: colors['background-header'] }}>
				<MemberList members={members} onRemoveMember={onRemoveMember} />
			</View>
			<View style={{ flex: 1, backgroundColor: colors['main-background'] }}>
				<View style={{ top: -30 * scaleHeight, flex: 1 }}>
					<Header
						title={t('main.home.create-group.add-members')}
						first
						style={[margin.bottom.scale(-1)]}
					/>
					<ContactPicker
						members={members}
						onSetMember={onSetMember}
						onRemoveMember={onRemoveMember}
						accountContacts={accountContacts}
					/>
				</View>
			</View>
			<FooterCreateGroup
				title={t('main.home.create-group.continue')}
				icon='arrow-forward-outline'
				action={navigation.navigate.main.createGroup.createGroupFinalize}
			/>
		</Layout>
	)
}
