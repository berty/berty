import React, { useState, useEffect, useRef } from 'react'
import {
	View,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	Vibration,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { Routes } from '@berty-tech/berty-navigation'
import { useNavigation } from '@react-navigation/native'
import { Chat } from '@berty-tech/hooks'

const useStylesDeleteAccount = () => {
	const [{ width, height, border, text, padding, margin }] = useStyles()
	return {
		header: [width(120), height(120), border.radius.scale(60)],
		dismissButton: [
			border.color.light.grey,
			border.scale(2),
			border.radius.small,
			margin.top.scale(30),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
		],
		deleteButton: [
			border.color.light.red,
			border.scale(2),
			border.radius.small,
			margin.top.scale(30),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
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
	const [{ background, margin, text, border, row, column, color }] = useStyles()

	return (
		<View>
			<View
				style={[
					background.white,
					border.shadow.medium,
					margin.bottom.medium,
					row.item.justify,
					column.justify,
					_styles.header,
				]}
			>
				<Icon
					name='alert-circle-outline'
					width={100}
					height={100}
					fill={color.red}
					style={[row.item.justify]}
				/>
			</View>
			<View>
				<Text style={[text.color.red, text.bold.medium, text.align.center]}>{title}</Text>
			</View>
		</View>
	)
}

const DeleteAccountError: React.FC<{ error: string }> = ({ error }) => {
	const [{ padding, margin, text }] = useStyles()

	return (
		<View style={[padding.medium, margin.top.large]}>
			<Text style={[text.color.red, text.align.center, text.bold.medium]}>{error}</Text>
		</View>
	)
}

function usePrevious<T>(value: T) {
	// https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
	const ref = useRef<T>()
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}

const DELETE_STR = 'Delete'

const DeleteAccountContent: React.FC<{}> = () => {
	const _styles = useStylesDeleteAccount()
	const [{ row, margin, background, border, color, padding, text, column, opacity }] = useStyles()
	const navigation = useNavigation()
	const account = Chat.useAccount()
	const prevAccount = usePrevious(account)
	const [startDelete, setStartDelete] = useState(false)
	const startedDelete = usePrevious(startDelete)
	const deleteAccount = Chat.useAccountDelete()
	const [deleteConfirmation, setDeleteConfirmation] = useState<string>()
	const confirmed = deleteConfirmation === DELETE_STR
	useEffect(() => {
		if (prevAccount && !account) {
			navigation.reset({ routes: [{ name: Routes.Onboarding.GetStarted }] })
			Vibration.vibrate([1000, 1000, 2000, 1000, 1000])
		}
	})
	useEffect(() => {
		if (!startedDelete && startDelete && account) {
			deleteAccount({ id: account.id })
		}
	})

	return startDelete ? (
		<View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 100 }}>
			<ActivityIndicator size='large' />
		</View>
	) : (
		<>
			<DeleteAccountError error={`Are you sure you want to delete your account?`} />
			<View style={[padding.horizontal.medium, padding.bottom.medium]}>
				<Text
					style={[text.color.red, text.align.center, text.bold.small]}
				>{`Please type 'Delete' to delete your account`}</Text>
			</View>
			<View style={[column.justify]}>
				<TextInput
					style={[
						padding.small,
						background.light.grey,
						text.size.large,
						border.radius.small,
						margin.medium,
						text.color.black,
					]}
					value={deleteConfirmation}
					onChangeText={setDeleteConfirmation}
				/>
				<View style={row.center}>
					<TouchableOpacity
						style={[row.fill, margin.bottom.medium, _styles.dismissButton]}
						onPress={() => navigation.goBack()}
					>
						<Icon name='close' width={30} height={30} fill={color.grey} style={row.item.justify} />
						<Text
							style={[text.color.grey, padding.left.small, row.item.justify, _styles.dismissText]}
						>
							CANCEL
						</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							row.fill,
							margin.bottom.medium,
							_styles.deleteButton,
							!confirmed && { opacity: 0.5 },
						]}
						onPress={() => setStartDelete(true)}
						disabled={!confirmed}
					>
						<Icon name='close' width={30} height={30} fill={color.red} style={row.item.justify} />
						<Text
							style={[text.color.red, padding.left.small, row.item.justify, _styles.dismissText]}
						>
							DELETE
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</>
	)
}

export const DeleteAccount: React.FC<{}> = () => {
	const [layout, setLayout] = useState(0)
	const [{ background, padding, border }] = useStyles()

	return (
		<View style={[padding.medium, background.red, { justifyContent: 'center', height: '100%' }]}>
			<View
				onLayout={(e) => !layout && setLayout(e.nativeEvent.layout.height)}
				style={[
					background.white,
					padding.medium,
					border.radius.medium,
					layout && { height: layout - 100 },
				]}
			>
				<View style={[_deleteAccountStyles.body]}>
					<DeleteAccountHeader title='Delete account!' />
					<DeleteAccountContent />
				</View>
			</View>
		</View>
	)
}

export default DeleteAccount
