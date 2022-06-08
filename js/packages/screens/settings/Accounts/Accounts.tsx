import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View, Platform } from 'react-native'
import { withInAppNotification } from 'react-native-in-app-notification'
import { useSelector } from 'react-redux'

import beapi from '@berty/api'
import { AccountsDropdown } from '@berty/components'
import { ButtonSettingV2, Section } from '@berty/components/shared-components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import {
	useOnBoardingAfterClosing,
	useImportingAccountAfterClosing,
	useSwitchAccountAfterClosing,
} from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { selectAccounts, selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { useThemeColor } from '@berty/store'
import {
	exportAccountToFile,
	importAccountFromDocumentPicker,
	refreshAccountList,
} from '@berty/utils/accounts'
import { pbDateToNum } from '@berty/utils/convert/time'

export const Accounts: ScreenFC<'Settings.Accounts'> = withInAppNotification(
	({ showNotification }: any) => {
		const { scaleSize } = useAppDimensions()
		const colors = useThemeColor()
		const { navigate } = useNavigation()
		const { t }: { t: any } = useTranslation()
		const selectedAccount = useSelector(selectSelectedAccount)
		const accounts = useSelector(selectAccounts)
		const onBoardingAfterClosing = useOnBoardingAfterClosing()
		const importingAccountAfterClosing = useImportingAccountAfterClosing()
		const switchAccount = useSwitchAccountAfterClosing()

		const [isHandlingPress, setIsHandlingPress] = React.useState(false)

		React.useEffect(() => {
			refreshAccountList()
		}, [])

		const handlePress = React.useCallback(
			async (item: beapi.account.IAccountMetadata) => {
				if (isHandlingPress || !item.accountId) {
					return
				}
				setIsHandlingPress(true)
				if (selectedAccount !== item.accountId) {
					switchAccount(item.accountId)
				}
				return
			},
			[isHandlingPress, selectedAccount, switchAccount],
		)

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
						<AccountsDropdown
							placeholder={t('settings.accounts.accounts-button')}
							items={[...accounts].sort(
								(a, b) => pbDateToNum(a.creationDate) - pbDateToNum(b.creationDate),
							)}
							defaultValue={selectedAccount}
							onChangeItem={handlePress}
						/>
					</Section>
					<Section>
						<ButtonSettingV2
							text={t('settings.accounts.create-button')}
							onPress={async () => onBoardingAfterClosing()}
							last={Platform.OS === 'web'}
						/>
						{Platform.OS !== 'web' && (
							<ButtonSettingV2
								text={t('settings.accounts.import-button')}
								onPress={async () => {
									const filePath = await importAccountFromDocumentPicker()
									if (!filePath) {
										console.warn("imported file doesn't exist")
										return
									}
									importingAccountAfterClosing(filePath)
								}}
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
