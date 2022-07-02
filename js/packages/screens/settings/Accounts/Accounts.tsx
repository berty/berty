import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View, Platform } from 'react-native'
import { withInAppNotification } from 'react-native-in-app-notification'
import { useSelector } from 'react-redux'

import beapi from '@berty/api'
import { AccountsDropdown } from '@berty/components'
import { DividerItem, MenuItem, ItemSection } from '@berty/components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import {
	useOnBoardingAfterClosing,
	useImportingAccountAfterClosing,
	useSwitchAccountAfterClosing,
	useThemeColor,
} from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { selectAccounts, selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
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
		const { t } = useTranslation()
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
						<ItemSection>
							<MenuItem
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
							>
								{t('settings.accounts.backup-button')}
							</MenuItem>
						</ItemSection>
					)}
					<ItemSection>
						<AccountsDropdown
							placeholder={t('settings.accounts.accounts-button')}
							items={[...accounts].sort(
								(a, b) => pbDateToNum(a.creationDate) - pbDateToNum(b.creationDate),
							)}
							defaultValue={selectedAccount}
							onChangeItem={handlePress}
						/>
					</ItemSection>
					<ItemSection>
						<MenuItem onPress={onBoardingAfterClosing}>
							{t('settings.accounts.create-button')}
						</MenuItem>

						{Platform.OS !== 'web' && (
							<>
								<DividerItem />
								<MenuItem
									onPress={async () => {
										const filePath = await importAccountFromDocumentPicker()
										if (!filePath) {
											console.warn("imported file doesn't exist")
											return
										}
										importingAccountAfterClosing(filePath)
									}}
								>
									{t('settings.accounts.import-button')}
								</MenuItem>
							</>
						)}
						{/* <ButtonSettingV2 text={t('settings.accounts.link-button')} disabled last /> */}
					</ItemSection>
					<ItemSection>
						<MenuItem onPress={() => navigate('Settings.DeleteAccount')}>
							{t('settings.accounts.delete-button')}
						</MenuItem>
					</ItemSection>
				</ScrollView>
			</View>
		)
	},
)
