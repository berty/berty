import React from 'react'
import { ScrollView, View, TouchableOpacity, Text } from 'react-native'
import { useTranslation } from 'react-i18next'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import {
	useMessengerContext,
	useThemeColor,
	pbDateToNum,
	closeAccountWithProgress,
} from '@berty-tech/store'

import { ButtonSettingV2, Section } from '../shared-components'
import {
	selectSelectedAccount,
	setStateOnBoardingReady,
} from '@berty-tech/redux/reducers/ui.reducer'
import { useDispatch, useSelector } from 'react-redux'
import { importAccountFromDocumentPicker } from '../pickerUtils'
import { GenericAvatar } from '../avatars'

const AccountButton: React.FC<beapi.account.IAccountMetadata> = ({
	avatarCid,
	publicKey,
	name,
	accountId,
	error,
}) => {
	const ctx = useMessengerContext()
	const colors = useThemeColor()
	const selectedAccount = useSelector(selectSelectedAccount)
	const selected = selectedAccount === accountId
	const [{ padding, border, margin }, { scaleSize }] = useStyles()

	const heightButton = 50

	const [isHandlingPress, setIsHandlingPress] = React.useState(false)
	const handlePress = React.useCallback(async () => {
		if (isHandlingPress) {
			return
		}
		setIsHandlingPress(true)
		if (selectedAccount !== accountId) {
			return ctx.switchAccount(accountId || '')
		}
		return
	}, [accountId, ctx, isHandlingPress, selectedAccount])

	return (
		<TouchableOpacity
			onPress={handlePress}
			style={[
				padding.left.scale(40),
				border.radius.medium,
				{
					height: heightButton,
					backgroundColor: error
						? colors['secondary-text']
						: selected
						? colors['positive-asset']
						: colors['main-background'],
				},
			]}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<View style={[{ height: heightButton, flexDirection: 'row', alignItems: 'center' }]}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
						}}
					>
						<GenericAvatar
							size={30 * scaleSize}
							cid={avatarCid}
							colorSeed={publicKey}
							nameSeed={name}
						/>
					</View>
				</View>
				<View
					style={[
						margin.left.small,
						{ height: heightButton, flexDirection: 'row', alignItems: 'center' },
					]}
				>
					<Text>{name}</Text>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export const Accounts: ScreenFC<'Settings.Accounts'> = () => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const ctx = useMessengerContext()
	const reduxDispatch = useDispatch()
	const { navigate } = useNavigation()
	const { t }: { t: any } = useTranslation()

	const [accountsCollapse, setAccountsCollapse] = React.useState<boolean>(true)

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				{/* <Section>
					<ButtonSettingV2 text='Backup' last />
				</Section> */}
				<Section>
					<ButtonSettingV2
						text={t('settings.accounts.accounts-button')}
						arrowIcon={!accountsCollapse ? 'arrow-downward' : 'arrow-forward'}
						onPress={() => setAccountsCollapse(!accountsCollapse)}
						last
					/>
					{!accountsCollapse &&
						ctx.accounts
							.sort((a, b) => pbDateToNum(a.creationDate) - pbDateToNum(b.creationDate))
							.map(account => {
								return <AccountButton key={account.accountId} {...account} />
							})}
				</Section>
				<Section>
					<ButtonSettingV2
						text={t('settings.accounts.create-button')}
						onPress={async () => {
							await closeAccountWithProgress(ctx.dispatch, reduxDispatch)
							reduxDispatch(setStateOnBoardingReady())
						}}
					/>
					<ButtonSettingV2
						text={t('settings.accounts.import-button')}
						onPress={async () => await importAccountFromDocumentPicker(ctx)}
					/>
					<ButtonSettingV2 text={t('settings.accounts.link-button')} disabled last />
				</Section>
				<Section>
					<ButtonSettingV2
						text={t('settings.accounts.delete-button')}
						onPress={() => navigate('Settings.DeleteAccount')}
						last
					/>
				</Section>
			</ScrollView>
		</View>
	)
}
