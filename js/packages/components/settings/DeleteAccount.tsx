import React, { useState } from 'react'
import {
	View,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Vibration,
	StatusBar,
	Text as TextNative,
} from 'react-native'
import { Text, Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { useNavigation as useReactNavigation } from '@react-navigation/core'

import { useStyles } from '@berty-tech/styles'
import { useMessengerContext, useThemeColor } from '@berty-tech/store'
import { ScreenFC } from '@berty-tech/navigation'

const useStylesDeleteAccount = () => {
	const [{ width, height, border, text, padding, margin }] = useStyles()
	const colors = useThemeColor()

	return {
		header: [width(120), height(120), border.radius.scale(60)],
		dismissButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			{ borderColor: colors['secondary-text'] },
		],
		deleteButton: [
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
			{ borderColor: colors['secondary-background-header'] },
		],
		dismissText: [text.size.scale(17)],
	}
}

const _deleteAccountStyles = StyleSheet.create({
	body: {
		bottom: 78,
	},
})

const DeleteAccountHeader: React.FC<{ title: string }> = ({ title }) => {
	const _styles = useStylesDeleteAccount()
	const [{ margin, text, border, row, column }] = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<View
				style={[
					border.shadow.medium,
					margin.bottom.medium,
					row.item.justify,
					column.justify,
					_styles.header,
					{ backgroundColor: colors['main-background'], shadowColor: colors.shadow },
				]}
			>
				<Icon
					name='alert-circle-outline'
					width={100}
					height={100}
					fill={colors['secondary-background-header']}
					style={[row.item.justify]}
				/>
			</View>
			<View>
				<TextNative
					style={[
						text.bold.medium,
						text.size.huge,
						text.align.center,
						{ color: colors['secondary-background-header'] },
					]}
				>
					{title}
				</TextNative>
			</View>
		</View>
	)
}

const DeleteAccountError: React.FC<{ error: string }> = ({ error }) => {
	const [{ padding, margin, text }] = useStyles()
	const colors = useThemeColor()

	return (
		<View style={[padding.medium, margin.top.large]}>
			<Text
				style={[
					text.align.center,
					text.bold.medium,
					{ color: colors['secondary-background-header'] },
				]}
			>
				{error}
			</Text>
		</View>
	)
}

const DELETE_STR = 'delete'

const DeleteAccountContent: React.FC<{}> = () => {
	const { deleteAccount } = useMessengerContext()
	const _styles = useStylesDeleteAccount()
	const [{ row, margin, border, padding, text, column }] = useStyles()
	const colors = useThemeColor()
	const navigation = useReactNavigation()
	const { t }: any = useTranslation()
	const [deleteConfirmation, setDeleteConfirmation] = useState<string>()
	const confirmed = deleteConfirmation === DELETE_STR

	return (
		<>
			<DeleteAccountError error={t('settings.delete-account.first-desc')} />
			<View style={[padding.horizontal.medium, padding.bottom.medium]}>
				<Text
					style={[
						text.align.center,
						text.bold.small,
						{ color: colors['secondary-background-header'] },
					]}
				>
					{t('settings.delete-account.desc')}
				</Text>
			</View>
			<View style={[column.justify]}>
				<TextInput
					style={[
						padding.small,
						text.size.large,
						border.radius.small,
						margin.medium,
						{ backgroundColor: colors['input-background'], color: colors['main-text'] },
					]}
					value={deleteConfirmation}
					onChangeText={setDeleteConfirmation}
					autoCorrect={false}
					autoCapitalize='none'
				/>
				<View style={row.center}>
					<TouchableOpacity
						style={[row.fill, margin.bottom.medium, _styles.dismissButton]}
						onPress={() => navigation.goBack()}
					>
						<Icon
							name='arrow-back-outline'
							width={30}
							height={30}
							fill={colors['secondary-text']}
							style={row.item.justify}
						/>
						<Text
							style={[
								padding.left.small,
								row.item.justify,
								_styles.dismissText,
								{ color: colors['secondary-text'], textTransform: 'uppercase' },
							]}
						>
							{t('generic.cancel')}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							row.fill,
							margin.bottom.medium,
							_styles.deleteButton,
							!confirmed && { opacity: 0.5 },
						]}
						onPress={async () => {
							Vibration.vibrate(500)
							await deleteAccount()
						}}
						disabled={!confirmed}
					>
						<Icon
							name='close'
							width={30}
							height={30}
							fill={colors['secondary-background-header']}
							style={row.item.justify}
						/>
						<Text
							style={[
								padding.left.small,
								row.item.justify,
								_styles.dismissText,
								{ color: colors['secondary-background-header'] },
							]}
						>
							{t('settings.delete-account.delete-button')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	)
}

export const DeleteAccount: ScreenFC<'Settings.DeleteAccount'> = () => {
	const [layout, setLayout] = useState(0)
	const [{ padding, border }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()

	return (
		<View
			style={[
				padding.medium,
				{
					justifyContent: 'center',
					height: '100%',
					backgroundColor: colors['secondary-background-header'],
				},
			]}
		>
			<StatusBar backgroundColor={colors['secondary-background-header']} barStyle='light-content' />
			<View
				onLayout={e => !layout && setLayout(e.nativeEvent.layout.height)}
				style={[
					padding.medium,
					border.radius.medium,
					{ backgroundColor: colors['main-background'] },
					layout && { height: layout - 90 },
				]}
			>
				<View style={[_deleteAccountStyles.body]}>
					<DeleteAccountHeader title={t('settings.delete-account.title')} />
					<DeleteAccountContent />
				</View>
			</View>
		</View>
	)
}
