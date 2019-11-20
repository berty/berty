import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'
import { HeaderInfoSettings, HeaderSettings } from './shared-components/Header'
import { ButtonSetting, FactionButtonSetting } from '../shared-components/SettingsButtons'

//
// Notifications
//

// Types
type NotificationsPorps = {
	isAuthorize: boolean
}

// Styles
const _notificationsStyles = StyleSheet.create({
	headerInfosTitleText: {
		paddingLeft: 10,
	},
	headerInfosText: {
		fontSize: 11,
	},
	headerInfosButtonText: {
		fontSize: 15,
	},
	bodyNotAuthorize: {
		opacity: 0.3,
	},
	buttonSettingText: {
		fontSize: 10,
		paddingLeft: 39,
		paddingRight: 100,
	},
})

const HeaderNotifications: React.FC<NotificationsPorps> = ({ isAuthorize }) => (
	<View>
		{!isAuthorize && (
			<View>
				<HeaderInfoSettings>
					<TouchableOpacity style={[styles.end]}>
						<Icon name='close-outline' width={20} height={20} fill={colors.lightBlue} />
					</TouchableOpacity>
					<View style={[styles.center, styles.row, styles.flex, styles.alignVertical]}>
						<Icon name='alert-circle' width={25} height={25} fill={colors.red} />
						<Text
							category='h6'
							style={[styles.textWhite, styles.textBold, _notificationsStyles.headerInfosTitleText]}
						>
							Authorize notifications
						</Text>
					</View>
					<View style={[styles.center, styles.marginTop, styles.marginLeft, styles.marginRight]}>
						<Text
							style={[
								styles.textBold,
								styles.textCenter,
								styles.textWhite,
								styles.center,
								_notificationsStyles.headerInfosText,
							]}
						>
							You need to authorize notifications for the Berty app in order to receive
							notifications for new messages and contact requests
						</Text>
					</View>
					<TouchableOpacity
						style={[
							styles.bgBlue,
							styles.borderRadius,
							styles.marginTop,
							styles.marginLeft,
							styles.marginRight,
						]}
					>
						<View
							style={[
								styles.marginTop,
								styles.marginBottom,
								styles.row,
								styles.spaceCenter,
								styles.alignItems,
							]}
						>
							<Icon name='bell-outline' width={20} height={20} fill={colors.white} />
							<Text
								style={[
									styles.textBold,
									styles.textWhite,
									styles.littlePaddingLeft,
									_notificationsStyles.headerInfosButtonText,
								]}
							>
								Authorize notifications
							</Text>
						</View>
					</TouchableOpacity>
				</HeaderInfoSettings>
			</View>
		)}
	</View>
)

const BodyNotifications: React.FC<NotificationsPorps> = ({ isAuthorize }) => (
	<View
		style={[
			styles.flex,
			styles.padding,
			styles.marginBottom,
			!isAuthorize ? _notificationsStyles.bodyNotAuthorize : null,
		]}
	>
		<ButtonSetting
			name='Activate notifications'
			icon='bell-outline'
			iconSize={30}
			iconColor={colors.blue}
			toggled={true}
		/>
		<ButtonSetting
			name='ContactRequests'
			toggled={true}
			icon='person-add-outline'
			iconSize={30}
			iconColor={colors.blue}
		>
			<Text style={[_notificationsStyles.buttonSettingText]}>
				Receive a notification everytime someones sends you a contact request
			</Text>
		</ButtonSetting>
		<FactionButtonSetting
			name='Messages notifications'
			icon='paper-plane-outline'
			iconSize={30}
			iconColor={colors.blue}
			style={[styles.marginTop]}
		>
			<ButtonSetting name='Display noitifications' toggled={true} alone={false} />
			<ButtonSetting name='Messages preview' toggled={true} alone={false} />
			<ButtonSetting
				name='Sound'
				actionIcon='arrow-ios-forward'
				previewValue='Note'
				alone={false}
			/>
			<ButtonSetting
				name='Exceptions'
				actionIcon='arrow-ios-forward'
				previewValue='Add'
				alone={false}
			/>
		</FactionButtonSetting>
		<FactionButtonSetting
			name='Groups notifications'
			icon='people-outline'
			iconSize={30}
			iconColor={colors.blue}
			style={[styles.marginTop]}
		>
			<ButtonSetting name='Display noitifications' toggled={true} alone={false} />
			<ButtonSetting name='Messages preview' toggled={true} alone={false} />
			<ButtonSetting
				name='Sound'
				actionIcon='arrow-ios-forward'
				previewValue='Bambou'
				alone={false}
			/>
			<ButtonSetting
				name='Exceptions'
				actionIcon='arrow-ios-forward'
				state={{
					value: '3 exceptions',
					color: colors.blue,
					bgColor: colors.lightBlue,
				}}
				alone={false}
			/>
		</FactionButtonSetting>
	</View>
)

export const Notifications: React.FC<{}> = () => {
	const [isAuthorize, setIsAuthorize] = useState(false)

	return (
		<Layout style={[styles.flex, styles.bgWhite]}>
			<ScrollView>
				<HeaderSettings
					title='Notifications'
					action={setIsAuthorize}
					actionValue={isAuthorize}
					desc='You have not yet activated notifications for this app'
				>
					<HeaderNotifications isAuthorize={isAuthorize} />
				</HeaderSettings>
				<BodyNotifications isAuthorize={isAuthorize} />
			</ScrollView>
		</Layout>
	)
}
