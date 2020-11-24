import React from 'react'
import { ScrollView, View } from 'react-native'
import { Icon, Text } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStyles } from '@berty-tech/styles'
import { colors } from 'react-native-elements'
import Logo from '../../components/main/1_berty_picto.svg'
import { MessengerAppState, useMsgrContext } from '@berty-tech/store/context'
import { useSwitchToAccount, useNotificationsInhibitor } from '@berty-tech/store/hooks'
import DocumentPicker from 'react-native-document-picker'

const ListEntry = ({
	title,
	onPress,
	icon,
}: {
	title: string
	onPress: () => {}
	icon: string
}) => {
	const [{ text, padding, margin, flex }] = useStyles()

	return (
		<View style={[{ flexDirection: 'row' }]}>
			<View
				style={[
					flex.tiny,
					{
						flexDirection: 'row',
						alignItems: 'center',
						alignContent: 'center',
						justifyContent: 'flex-end',
					},
				]}
			>
				<Icon name={icon} width={30} height={30} fill={colors.primary} />
			</View>
			<View style={[flex.big, { flexDirection: 'row', alignContent: 'center' }]}>
				<Text
					style={[
						padding.horizontal.big,
						margin.top.small,
						padding.medium,
						text.align.left,
						text.align.top,
					]}
					onPress={onPress}
				>
					{title}
				</Text>
			</View>
		</View>
	)
}

const ImportExistingButton = () => {
	const { importAccount } = useMsgrContext()

	return (
		<Translation>
			{(t) => (
				<ListEntry
					title={t('onboarding.getstarted.import-button')}
					onPress={async () => {
						try {
							const res = await DocumentPicker.pick({
								// @ts-ignore
								type: ['public.tar-archive', '*/*'],
							})

							await importAccount(res.uri.replace(/^file:\/\//, ''))
						} catch (err) {
							if (DocumentPicker.isCancel(err)) {
								// ignore
							} else {
								console.error(err)
							}
						}
					}}
					icon={'upload-outline'}
				/>
			)}
		</Translation>
	)
}

const CreateButton = () => {
	const { createNewAccount } = useMsgrContext()

	return (
		<Translation>
			{(t) => (
				<ListEntry
					title={t('onboarding.getstarted.account-selector-create-button')}
					onPress={async () => {
						createNewAccount()
					}}
					icon={'plus-circle-outline'}
				/>
			)}
		</Translation>
	)
}

const OpenRegisteredButton = ({ id, account }: { id: string; account: any }) => {
	const switchToAccount = useSwitchToAccount()

	return (
		<ListEntry
			title={(account && account.name) || `Account ${id}`}
			onPress={async () => {
				switchToAccount(id)
			}}
			icon={'person-outline'}
		/>
	)
}

export const AccountSelector = () => {
	useNotificationsInhibitor(() => true)

	const [{ absolute, background, column, flex, padding }] = useStyles()
	const { accounts, embedded, appState } = useMsgrContext()

	if (appState !== MessengerAppState.Closed) {
		return <></>
	}

	return (
		<SafeAreaView style={[absolute.fill, background.white, column.justify, padding.medium]}>
			<View
				style={[flex.small, padding.top.medium, { flexDirection: 'row', justifyContent: 'center' }]}
			>
				<Logo height='50%' />
			</View>
			<View style={[flex.big]}>
				<ScrollView>
					{accounts.map((account) => {
						return (
							<OpenRegisteredButton
								account={account}
								key={account.accountId}
								id={account.accountId || ''}
							/>
						)
					})}
					{embedded && <CreateButton />}
					{embedded && <ImportExistingButton />}
				</ScrollView>
			</View>
		</SafeAreaView>
	)
}
