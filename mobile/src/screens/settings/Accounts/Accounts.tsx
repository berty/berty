import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View, Platform } from 'react-native'
import { withInAppNotification } from 'react-native-in-app-notification'
import { useSelector } from 'react-redux'

import { MenuItem, ItemSection } from '@berty/components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { exportAccountToFile, refreshAccountList } from '@berty/utils/accounts'

export const Accounts: ScreenFC<'Settings.Accounts'> = withInAppNotification(
	({ showNotification }: any) => {
		const { scaleSize } = useAppDimensions()
		const colors = useThemeColor()
		const { navigate } = useNavigation()
		const { t } = useTranslation()
		const selectedAccount = useSelector(selectSelectedAccount)

		React.useEffect(() => {
			refreshAccountList()
		}, [])

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
						<MenuItem onPress={() => navigate('Settings.DeleteAccount')}>
							{t('settings.accounts.delete-button')}
						</MenuItem>
					</ItemSection>
				</ScrollView>
			</View>
		)
	},
)
