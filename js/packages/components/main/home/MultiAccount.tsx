import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { useStyles } from '@berty-tech/styles'
import { useMsgrContext } from '@berty-tech/store/context'

const AccountButton: React.FC<{ account: any; selected: boolean }> = ({ account, selected }) => {
	const [{ text, background, padding, border }] = useStyles()
	const { switchAccount, selectedAccount } = useMsgrContext()
	return (
		<TouchableOpacity
			style={[border.radius.medium, background.white, padding.medium, border.shadow.medium]}
			onPress={async () => {
				if (selectedAccount !== account.accountId) {
					await switchAccount(account.accountId)
				}
			}}
		>
			<View style={{ justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
				<Text style={[text.color.black]}>{account?.name}</Text>
				{selected ? <Text>V</Text> : null}
			</View>
		</TouchableOpacity>
	)
}

export const MultiAccount: React.FC<{ onPress: any }> = ({ onPress }) => {
	const [{ text, background, padding, border, margin }] = useStyles()
	const { accounts, createNewAccount, selectedAccount } = useMsgrContext()

	return (
		<TouchableOpacity
			style={[
				{ position: 'absolute', top: 110, bottom: 0, right: 0, left: 0 },
				padding.horizontal.medium,
			]}
			onPress={onPress}
		>
			<View style={[{ width: '100%' }]}>
				{accounts.map((accountService, key) => (
					<AccountButton
						key={key}
						account={accountService}
						selected={selectedAccount === accountService.accountId}
					/>
				))}
				<TouchableOpacity
					style={[
						border.radius.medium,
						background.white,
						padding.medium,
						border.shadow.big,
						margin.top.scale(2),
					]}
					onPress={async () => {
						await createNewAccount()
					}}
				>
					<Text style={[text.color.black]}>Create new account</Text>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	)
}
