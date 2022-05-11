import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { GestureResponderEvent, ScrollView, TouchableOpacity, View } from 'react-native'

import beapi from '@berty/api'
import { GenericAvatar } from '@berty/components/avatars'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useAppDispatch, useAppSelector } from '@berty/hooks'
import { useNavigation } from '@berty/navigation'
import { selectAccounts, selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { useThemeColor, Maybe } from '@berty/store'
import {
	importAccountFromDocumentPicker,
	importAccountAfterClosing,
	switchAccountAfterClosing,
	onBoardingAfterClosing,
	refreshAccountList,
} from '@berty/utils/accounts'
import { pbDateToNum } from '@berty/utils/convert/time'

const AccountButton: React.FC<{
	name: string | null | undefined
	onPress: ((event: GestureResponderEvent) => void) | undefined
	avatar: JSX.Element
	selected?: boolean
	incompatible?: Maybe<string>
}> = ({ name, onPress, avatar, selected = false, incompatible = null }) => {
	const { margin, text, padding, border } = useStyles()
	const colors = useThemeColor()

	return (
		<TouchableOpacity
			style={[
				{ shadowColor: colors.shadow },
				border.radius.medium,
				padding.horizontal.medium,
				border.shadow.medium,
				margin.top.scale(2),
				{
					backgroundColor: incompatible
						? colors['secondary-text']
						: selected
						? colors['positive-asset']
						: colors['main-background'],
				},
			]}
			onPress={onPress}
			disabled={incompatible ? true : false}
		>
			<View
				style={{
					justifyContent: 'space-between',
					flexDirection: 'row',
					alignItems: 'center',
					height: 60,
				}}
			>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					{avatar}
					<UnifiedText style={[padding.left.medium, text.align.center, text.size.scale(17)]}>
						{name}
					</UnifiedText>
				</View>
				<Icon name='arrow-ios-downward' width={30} height={30} fill={colors['main-text']} />
			</View>
		</TouchableOpacity>
	)
}

export const MultiAccount: React.FC<{ onPress: () => void }> = ({ onPress }) => {
	const { padding } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const selectedAccount = useAppSelector(selectSelectedAccount)
	const accounts = useAppSelector(selectAccounts)
	const { navigate } = useNavigation()
	const dispatch = useAppDispatch()
	const { dispatch: navDispatch } = useNativeNavigation()

	const [isHandlingPress, setIsHandlingPress] = React.useState(false)

	const handlePress = async (account: beapi.account.IAccountMetadata) => {
		if (isHandlingPress || !account.accountId) {
			return
		}
		setIsHandlingPress(true)
		if (selectedAccount !== account.accountId) {
			navigate('Account.Closing', {
				callback: () => {
					switchAccountAfterClosing(dispatch, selectedAccount)
				},
			})
		} else if (selectedAccount === account.accountId && !account.error) {
			return onPress()
		}
	}

	React.useEffect(() => {
		refreshAccountList()
	}, [])

	return accounts.length ? (
		<TouchableOpacity
			style={[
				padding.horizontal.medium,
				{ position: 'absolute', top: 70 * scaleSize, bottom: 0, right: 0, left: 0 },
			]}
			onPress={onPress}
		>
			<ScrollView
				style={[{ width: '100%', maxHeight: '80%' }]}
				contentContainerStyle={{ paddingBottom: 10 }}
				showsVerticalScrollIndicator={false}
			>
				{[...accounts]
					.sort((a, b) => pbDateToNum(a.creationDate) - pbDateToNum(b.creationDate))
					.map(account => {
						return (
							<AccountButton
								key={account.accountId}
								name={
									account?.error
										? `Incompatible account ${account.name}\n${account.error}`
										: account.name
								}
								onPress={() => handlePress(account)}
								avatar={
									<GenericAvatar
										size={40}
										cid={account?.avatarCid}
										colorSeed={account?.publicKey}
										nameSeed={account?.name}
									/>
								}
								selected={selectedAccount === account.accountId}
								incompatible={account?.error}
							/>
						)
					})}
				<AccountButton
					name={t('main.home.multi-account.create-button')}
					onPress={async () => {
						navigate('Account.Closing', {
							callback: () => {
								onBoardingAfterClosing(navDispatch)
							},
						})
					}}
					avatar={
						<View
							style={{
								height: 40,
								width: 40,
								borderRadius: 20,
								backgroundColor: colors['background-header'],
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Icon
								name='plus-outline'
								height={30}
								width={30}
								fill={colors['reverted-main-text']}
							/>
						</View>
					}
				/>
				<AccountButton
					name={t('main.home.multi-account.import-button')}
					onPress={async () => {
						const filePath = await importAccountFromDocumentPicker()
						if (!filePath) {
							console.warn("imported file doesn't exist")
							return
						}
						navigate('Account.Closing', {
							callback: () => {
								importAccountAfterClosing(navigate, filePath)
							},
						})
					}}
					avatar={
						<View
							style={{
								height: 40,
								width: 40,
								borderRadius: 20,
								backgroundColor: colors['background-header'],
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Icon
								name='download-outline'
								height={30}
								width={30}
								fill={colors['reverted-main-text']}
							/>
						</View>
					}
				/>
			</ScrollView>
		</TouchableOpacity>
	) : null
}
