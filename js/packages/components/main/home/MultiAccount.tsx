import React from 'react'
import {
	GestureResponderEvent,
	Platform,
	ScrollView,
	Text,
	TouchableOpacity,
	View,
} from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import DocumentPicker from 'react-native-document-picker'
import getPath from '@flyerhq/react-native-android-uri-path'

import { useStyles } from '@berty-tech/styles'
import { MessengerActions, MsgrState, useMsgrContext } from '@berty-tech/store/context'
import { closeAccountWithProgress } from '@berty-tech/store/effectableCallbacks'
import { useThemeColor } from '@berty-tech/store/hooks'

import { GenericAvatar } from '../../avatars'

const openDocumentPicker = async (ctx: MsgrState) => {
	try {
		const res = await DocumentPicker.pick({
			// @ts-ignore
			type: Platform.OS === 'android' ? ['application/x-tar'] : ['public.tar-archive'],
		})
		const replaced =
			Platform.OS === 'android' ? getPath(res.uri) : res.uri.replace(/^file:\/\//, '')
		await ctx.importAccount(replaced)
	} catch (err) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.error(err)
		}
	}
}

const AccountButton: React.FC<{
	name: string | null | undefined
	onPress: ((event: GestureResponderEvent) => void) | undefined
	avatar: any
	selected?: boolean
	incompatible?: string
}> = ({ name, onPress, avatar, selected = false, incompatible = null }) => {
	const [{ margin, text, padding, border }] = useStyles()
	const colors = useThemeColor()

	return (
		<TouchableOpacity
			style={[
				border.radius.medium,
				padding.horizontal.medium,
				border.shadow.medium,
				margin.top.scale(2),
				{
					backgroundColor: incompatible
						? colors['secondary-text']
						: selected
						? colors['positive-asset']
						: colors['reverted-main-text'],
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
					<Text
						style={[
							padding.left.medium,
							text.bold.small,
							text.align.center,
							text.size.scale(17),
							{ fontFamily: 'Open Sans', color: colors['main-text'] },
						]}
					>
						{name}
					</Text>
				</View>
				<Icon name='arrow-ios-downward' width={30} height={30} fill={colors['main-text']} />
			</View>
		</TouchableOpacity>
	)
}

export const MultiAccount: React.FC<{ onPress: any }> = ({ onPress }) => {
	const ctx = useMsgrContext()
	const [{ padding }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { dispatch } = useMsgrContext()
	const { t } = useTranslation()

	return (
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
						await dispatch({ type: MessengerActions.SetStateOnBoardingReady })
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
					onPress={() => openDocumentPicker(ctx)}
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
	)
}
