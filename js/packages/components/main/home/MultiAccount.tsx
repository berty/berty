import React from 'react'
import { Text, TouchableOpacity, View, GestureResponderEvent, ScrollView } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useMsgrContext, MessengerActions } from '@berty-tech/store/context'
import { closeAccountWithProgress } from '@berty-tech/store/effectableCallbacks'

import { GenericAvatar } from '../../avatars'
import { openDocumentPicker } from '../../helpers'

const AccountButton: React.FC<{
	name: string | null | undefined
	onPress: ((event: GestureResponderEvent) => void) | undefined
	avatar: any
	selected?: boolean
	incompatible?: string
}> = ({ name, onPress, avatar, selected = false, incompatible = null }) => {
	const [{ margin, text, padding, border, color }] = useStyles()
	return (
		<TouchableOpacity
			style={[
				border.radius.medium,
				padding.horizontal.medium,
				border.shadow.medium,
				margin.top.scale(2),
				{ backgroundColor: incompatible ? color.grey : selected ? color.light.green : color.white },
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
					<Text
						style={[
							text.color.black,
							padding.left.medium,
							text.bold.small,
							text.align.center,
							{ fontFamily: 'Open Sans' },
							text.size.scale(17),
						]}
					>
						{name}
					</Text>
				</View>
				<Icon name='arrow-ios-downward' width={30} height={30} fill={color.black} />
			</View>
		</TouchableOpacity>
	)
}

export const MultiAccount: React.FC<{ onPress: any }> = ({ onPress }) => {
	const ctx = useMsgrContext()
	const [{ padding, color }, { scaleSize }] = useStyles()
	const { dispatch } = useMsgrContext()
	const { t } = useTranslation()

	return (
		<TouchableOpacity
			style={[
				{ position: 'absolute', top: 120 * scaleSize, bottom: 0, right: 0, left: 0 },
				padding.horizontal.medium,
			]}
			onPress={onPress}
		>
			<ScrollView
				style={[{ width: '100%', maxHeight: '80%' }]}
				contentContainerStyle={{ paddingBottom: 10 }}
				showsVerticalScrollIndicator={false}
			>
				{ctx.accounts
					.sort((a, b) => a.creationDate - b.creationDate)
					.map((account, key) => {
						return (
							<AccountButton
								key={key}
								name={account?.error ? `Incompatible account ${account.name}` : account.name}
								onPress={async () => {
									if (ctx.selectedAccount !== account.accountId) {
										await ctx.switchAccount(account.accountId)
									} else if (ctx.selectedAccount === account.accountId && !account?.error) {
										onPress()
									}
								}}
								avatar={
									<GenericAvatar
										size={40}
										cid={account?.avatarCid}
										fallbackSeed={account?.publicKey}
									/>
								}
								selected={ctx.selectedAccount === account.accountId}
								incompatible={account?.error}
							/>
						)
					})}
				<AccountButton
					name={t('main.home.multi-account.create-button')}
					onPress={async () => {
						await closeAccountWithProgress(dispatch)
						dispatch({ type: MessengerActions.SetStateOnBoardingReady })
					}}
					avatar={
						<View
							style={{
								height: 40,
								width: 40,
								borderRadius: 20,
								backgroundColor: color.blue,
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Icon name='plus-outline' height={30} width={30} fill={color.white} />
						</View>
					}
				/>
				<AccountButton
					name={t('main.home.multi-account.import-button')}
					onPress={() => openDocumentPicker(ctx)}
					avatar={
						<View
							style={{
								height: 40,
								width: 40,
								borderRadius: 20,
								backgroundColor: color.blue,
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Icon name='download-outline' height={30} width={30} fill={color.white} />
						</View>
					}
				/>
			</ScrollView>
		</TouchableOpacity>
	)
}
