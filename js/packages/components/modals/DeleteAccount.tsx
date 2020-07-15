import React, { useState, useEffect, useRef } from 'react'
import {
	View,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	ActivityIndicator,
	Vibration,
	Text as TextNative,
} from 'react-native'
import { Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { Routes } from '@berty-tech/navigation'
import { useNavigation } from '@react-navigation/native'
import { Messenger } from '@berty-tech/hooks'

const useStylesDeleteAccount = () => {
	const [{ width, height, border, text, padding, margin }] = useStyles()
	return {
		header: [width(120), height(120), border.radius.scale(60)],
		dismissButton: [
			border.color.light.grey,
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
			padding.left.small,
			padding.right.medium,
			padding.top.small,
			padding.bottom.small,
		],
		deleteButton: [
			border.color.light.red,
			border.scale(2),
			border.radius.small,
			margin.top.scale(15),
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
				<TextNative style={[text.color.red, text.bold.medium, text.size.huge, text.align.center]}>
					{title}
				</TextNative>
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

const DELETE_STR = 'delete'

const DeleteAccountContent: React.FC<{}> = () => {
	const _styles = useStylesDeleteAccount()
	const [{ row, margin, background, border, color, padding, text, column }] = useStyles()
	const navigation = useNavigation()
	const account = Messenger.useAccount()
	const prevAccount = usePrevious(account)
	const [startDelete, setStartDelete] = useState(false)
	const startedDelete = usePrevious(startDelete)
	const deleteAccount = Messenger.useAccountDelete()
	const [deleteConfirmation, setDeleteConfirmation] = useState<string>()
	const confirmed = deleteConfirmation === DELETE_STR
	useEffect(() => {
		if (prevAccount && !account) {
			navigation.reset({ routes: [{ name: Routes.Onboarding.GetStarted }] })
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
			<DeleteAccountError error={'Are you sure you want to delete your account?'} />
			<View style={[padding.horizontal.medium, padding.bottom.medium]}>
				<Text style={[text.color.red, text.align.center, text.bold.small]}>
					Please type <Text style={[text.bold.huge, text.color.red]}>delete</Text> to confirm
				</Text>
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
					autoCorrect={false}
					autoCapitalize='none'
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
						onPress={() => {
							Vibration.vibrate(500)
							setStartDelete(true)
						}}
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
					layout && { height: layout - 90 },
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
