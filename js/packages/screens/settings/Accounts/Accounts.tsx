import React from 'react'
import { ScrollView, View, TouchableOpacity, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'

import beapi from '@berty/api'
import { useStyles } from '@berty/contexts/styles'
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	useThemeColor,
	pbDateToNum,
	closeAccountWithProgress,
	exportAccountToFile,
	refreshAccountList,
} from '@berty/store'

import { ButtonSettingV2, Section } from '@berty/components/shared-components'
import {
	selectAccounts,
	selectEmbedded,
	selectSelectedAccount,
	setStateOnBoardingReady,
} from '@berty/redux/reducers/ui.reducer'
import { useDispatch, useSelector } from 'react-redux'
import { importAccountFromDocumentPicker } from '@berty/components/pickerUtils'
import { GenericAvatar } from '@berty/components/avatars'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { AccordionV2 } from '@berty/components/Accordion'
import { withInAppNotification } from 'react-native-in-app-notification'
import { useSwitchAccount } from '@berty/hooks'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

const AccountButton: React.FC<beapi.account.IAccountMetadata> = ({
	avatarCid,
	publicKey,
	name,
	accountId,
	error,
}) => {
	const colors = useThemeColor()
	const selectedAccount = useSelector(selectSelectedAccount)
	const selected = selectedAccount === accountId
	const { padding, margin } = useStyles()
	const { scaleSize } = useAppDimensions()
	const switchAccount = useSwitchAccount()

	const heightButton = 50

	const [isHandlingPress, setIsHandlingPress] = React.useState(false)
	const handlePress = React.useCallback(async () => {
		if (isHandlingPress) {
			return
		}
		setIsHandlingPress(true)
		if (selectedAccount !== accountId) {
			return switchAccount(accountId || '')
		}
		return
	}, [accountId, switchAccount, isHandlingPress, selectedAccount])

	return (
		<TouchableOpacity
			onPress={handlePress}
			style={[
				padding.left.scale(40),
				{
					height: heightButton * scaleSize,
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
					<UnifiedText>{name}</UnifiedText>
				</View>
			</View>
		</TouchableOpacity>
	)
}

export const Accounts: ScreenFC<'Settings.Accounts'> = withInAppNotification(
	({ showNotification }: any) => {
		const { scaleSize } = useAppDimensions()
		const colors = useThemeColor()
		const dispatch = useDispatch()
		const { navigate } = useNavigation()
		const { t }: { t: any } = useTranslation()
		const selectedAccount = useSelector(selectSelectedAccount)
		const accounts = useSelector(selectAccounts)
		const embedded = useSelector(selectEmbedded)

		React.useEffect(() => {
			refreshAccountList(embedded)
		}, [embedded])

		return (
			<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
				<ScrollView
					bounces={false}
					contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
					showsVerticalScrollIndicator={false}
				>
					{Platform.OS !== 'web' && (
						<Section>
							<ButtonSettingV2
								text={t('settings.accounts.backup-button')}
								last
								onPress={async () => {
									try {
										await exportAccountToFile(selectedAccount)
										showNotification({
											title: t('settings.accounts.backup-notif-title'),
											message: t('settings.accounts.backup-notif-desc'),
											additionalProps: { type: 'message' },
										})
									} catch (e) {
										console.warn('account backup failed:', e)
									}
								}}
							/>
						</Section>
					)}
					<Section>
						<AccordionV2 title={t('settings.accounts.accounts-button')}>
							{[...accounts]
								.sort((a, b) => pbDateToNum(a.creationDate) - pbDateToNum(b.creationDate))
								.map(account => {
									return <AccountButton key={account.accountId} {...account} />
								})}
						</AccordionV2>
					</Section>
					<Section>
						<ButtonSettingV2
							text={t('settings.accounts.create-button')}
							onPress={async () => {
								await closeAccountWithProgress(dispatch)
								dispatch(setStateOnBoardingReady())
							}}
							last={Platform.OS === 'web'}
						/>
						{Platform.OS !== 'web' && (
							<ButtonSettingV2
								text={t('settings.accounts.import-button')}
								onPress={async () => await importAccountFromDocumentPicker(embedded)}
								last
							/>
						)}
						{/* <ButtonSettingV2 text={t('settings.accounts.link-button')} disabled last /> */}
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
	},
)
