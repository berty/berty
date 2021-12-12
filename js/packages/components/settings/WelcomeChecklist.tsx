import React, { useCallback, useMemo, useState } from 'react'
import { Text as TextNative, TouchableOpacity, View } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store'
import {
	ChecklistItemKey,
	selectChecklistItems,
	ChecklistItem,
	selectChecklistExpanded,
	toggleChecklist,
	selectChecklistSeen,
	checklistItems,
} from '@berty-tech/redux/reducers/checklist.reducer'
import { useAppDispatch, useAppSelector } from '@berty-tech/redux/react-redux'

import { UnreadCount } from '../main/home/UnreadCount'

const taskItemTitleKey = (key: string) => `settings.home.check-list.${key}.title`
const taskItemDescKey = (key: string) => `settings.home.check-list.${key}.desc`

const TaskItem: React.FC<{ itemKey: ChecklistItemKey; value?: ChecklistItem }> = ({
	itemKey,
	value,
}) => {
	const colors = useThemeColor()
	const [{ text, margin, padding }, { scaleSize }] = useStyles()
	const { t }: any = useTranslation()
	const [itemCollapsed, setItemCollapsed] = useState<boolean>(true)

	return (
		<View
			style={[
				padding.top.tiny,
				{
					flexDirection: 'row',
					alignItems: 'flex-start',
					justifyContent: 'space-between',
				},
			]}
		>
			<View style={{ flexDirection: 'row', alignItems: 'flex-start', flex: 10 }}>
				{value?.done ? (
					<Icon
						name='checkmark-circle-2'
						fill={colors['background-header']}
						width={25 * scaleSize}
						height={25 * scaleSize}
					/>
				) : (
					<View
						style={{
							width: 21 * scaleSize,
							height: 21 * scaleSize,
							borderRadius: 21 * scaleSize,
							borderWidth: 2,
							borderColor: colors['background-header'],
							margin: 2 * scaleSize,
						}}
					/>
				)}
				<View style={{ flexDirection: 'column' }}>
					<TextNative
						style={[
							text.size.medium,
							margin.left.small,
							{ fontFamily: 'Open Sans', color: colors['main-text'] },
						]}
					>
						{t(taskItemTitleKey(itemKey))}
					</TextNative>
					{!itemCollapsed ? (
						<TextNative
							style={[
								text.size.scale(13),
								margin.left.big,
								margin.vertical.small,
								{ fontFamily: 'Open Sans', color: colors['main-text'] },
							]}
						>
							{t(taskItemDescKey(itemKey))}
						</TextNative>
					) : null}
				</View>
			</View>
			<TouchableOpacity
				style={[{ alignItems: 'center', flex: 1 }]}
				onPress={() => setItemCollapsed(!itemCollapsed)}
			>
				<Icon
					name={itemCollapsed ? 'arrow-ios-downward' : 'arrow-ios-upward'}
					fill={colors['main-text']}
					height={20 * scaleSize}
					width={20 * scaleSize}
				/>
			</TouchableOpacity>
		</View>
	)
}

const CheckItems: React.FC<{
	openEditProfile: () => void
}> = ({ openEditProfile }) => {
	const tasks = useAppSelector(selectChecklistItems)
	const expanded = useAppSelector(selectChecklistExpanded)
	const { navigate } = useNavigation()

	const handleCheckListItemPress = useCallback(
		(key: ChecklistItemKey, value: ChecklistItem) => {
			switch (key) {
				case 'avatar':
					if (!value.done) {
						openEditProfile()
					}
					return
				case 'relay':
					if (!value.done) {
						navigate('Settings.ReplicationServices')
					}
					return
				case 'contact':
					if (!value.done) {
						navigate('Main.Scan')
					}
					return
				case 'group':
					if (!value.done) {
						navigate('Main.CreateGroupAddMembers')
					}
					return
				default:
					return
			}
		},
		[openEditProfile, navigate],
	)
	return (
		<View>
			{expanded && tasks
				? Object.entries(tasks).map(([key, value]) => {
						return (
							<TouchableOpacity
								key={key}
								onPress={() => handleCheckListItemPress(key as ChecklistItemKey, value)}
							>
								<TaskItem itemKey={key as ChecklistItemKey} value={value} />
							</TouchableOpacity>
						)
				  })
				: null}
		</View>
	)
}

export const WelcomeChecklist: React.FC<{
	openEditProfile: () => void
}> = ({ openEditProfile }) => {
	const colors = useThemeColor()
	const [{ text, padding, margin, border }, { scaleSize }] = useStyles()
	const { t }: any = useTranslation()
	const expanded = useAppSelector(selectChecklistExpanded)
	const checklistSeen = useAppSelector(selectChecklistSeen)
	const dispatch = useAppDispatch()

	const items = useAppSelector(selectChecklistItems)

	const tasks = items ? Object.entries(items) : undefined
	const tasksDone = useMemo(
		() => (tasks ? tasks.filter(([, value]) => value.done).length : 0),
		[tasks],
	)

	return (
		<View
			style={[
				margin.horizontal.medium,
				margin.top.medium,
				padding.medium,
				border.radius.medium,
				{ backgroundColor: colors['main-background'], flex: 1 },
			]}
		>
			<View>
				<View
					style={[
						expanded && margin.bottom.small,
						{ flexDirection: 'row', flex: 1, justifyContent: 'space-between' },
					]}
				>
					<View style={{ flexDirection: 'row', flex: 10 }}>
						<TextNative
							style={[
								text.size.scale(16),
								text.bold.medium,
								margin.right.scale(5),
								{ fontFamily: 'Open Sans', color: colors['main-text'] },
							]}
						>
							{t('settings.home.check-list.title', {
								tasksDone,
								totalTasks: tasks ? tasks.length : Object.keys(checklistItems).length,
							})}
						</TextNative>
						<Icon
							name='checkmark-circle-2'
							fill={colors['background-header']}
							width={20 * scaleSize}
							height={20 * scaleSize}
						/>
					</View>

					<TouchableOpacity
						style={[{ alignItems: 'center', flex: 1 }]}
						onPress={() => dispatch(toggleChecklist())}
					>
						<Icon
							name={expanded ? 'arrow-upward' : 'arrow-downward'}
							fill={colors['main-text']}
							height={25 * scaleSize}
							width={25 * scaleSize}
						/>
					</TouchableOpacity>
					{checklistSeen || (
						<View
							style={{ position: 'absolute', right: -(22 * scaleSize), top: -(22 * scaleSize) }}
						>
							<UnreadCount value={1} />
						</View>
					)}
				</View>
			</View>
			<CheckItems openEditProfile={openEditProfile} />
		</View>
	)
}
