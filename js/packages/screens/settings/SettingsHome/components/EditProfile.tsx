import React, { FC, useReducer } from 'react'
import {
	ActivityIndicator,
	Image,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native'
import { Icon, Input } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty/contexts/styles'
import { useMessengerClient, useThemeColor } from '@berty/store'
import { useAccount, useUpdateAccount } from '@berty/hooks'
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker'

import { AccountAvatar } from '@berty/components/avatars'
import { useSelector } from 'react-redux'
import { selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { useModal } from '@berty/components/providers/modal.provider'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'

//
// Edit Profile
//

// Style
const _stylesEditProfile = StyleSheet.create({
	profileButton: { width: '80%', height: 50 },
	profileInfo: { width: '100%', height: 60 },
})

type State = {
	saving: boolean
	name?: string
	err?: any
	pic?: ImageOrVideo
}

type Action =
	| {
			type: 'SAVE'
	  }
	| {
			type: 'SET_PICTURE'
			pic: ImageOrVideo
	  }
	| {
			type: 'SET_NAME'
			name: string
	  }
	| {
			type: 'SET_ERROR'
			err: any
	  }

const reducer = (prevState: State, action: Action): State => {
	const state = { ...prevState }
	switch (action.type) {
		case 'SAVE':
			state.saving = true
			delete state.err
			return state
		case 'SET_PICTURE':
			state.pic = action.pic
			return state
		case 'SET_NAME':
			state.name = action.name
			return state
		case 'SET_ERROR':
			state.err = action.err
			state.saving = false
			return state
		default:
			return prevState
	}
}

const initialState: State = {
	saving: false,
}

const EditMyProfile: React.FC = () => {
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const client = useMessengerClient()
	const selectedAccount = useSelector(selectSelectedAccount)
	const { hide } = useModal()
	const updateAccount = useUpdateAccount()

	const account = useAccount()

	const [state, localDispatch] = useReducer(reducer, {
		...initialState,
		name: account.displayName || undefined,
	})

	const handlePicturePressed = async () => {
		try {
			const pic = await ImagePicker.openPicker({
				width: 400,
				height: 400,
				cropping: true,
				cropperCircleOverlay: true,
				mediaType: 'photo',
			})
			if (pic) {
				localDispatch({ type: 'SET_PICTURE', pic })
			}
		} catch (err: any) {
			if (err?.code !== 'E_PICKER_CANCELLED') {
				localDispatch({ type: 'SET_ERROR', err })
			}
		}
	}

	const avatarURI = state.pic?.path

	const handleSave = async () => {
		try {
			localDispatch({ type: 'SAVE' })

			const update: any = {}
			let updated = false

			if (state.pic) {
				const stream = await client?.mediaPrepare({})
				if (!stream) {
					throw new Error('failed to open prepareAttachment stream')
				}
				await stream.emit({
					info: {
						mimeType: state.pic.mime,
						filename: state.pic.filename,
						displayName: state.pic.filename || 'picture',
					},
					uri: avatarURI,
				})
				const reply = await stream.stopAndRecv()
				if (!reply?.cid) {
					throw new Error('invalid PrepareAttachment reply, missing cid')
				}
				update.avatarCid = reply.cid
				updated = true
			}

			if (state.name && state.name !== account.displayName) {
				update.displayName = state.name
				updated = true
			}

			if (updated) {
				// update account in bertymessenger
				await client?.accountUpdate(update)
				// update account in bertyaccount
				await updateAccount({
					accountId: selectedAccount,
					avatarCid: update.avatarCid,
				})
			}
			hide()
		} catch (err) {
			console.warn(err)
			localDispatch({ type: 'SET_ERROR', err })
		}
	}

	const { padding, margin, row, background, border, flex, text, color, column } = useStyles()

	let image: JSX.Element
	if (state.pic) {
		const size = 90
		const padding = Math.round(size / 14)
		let innerSize = Math.round(size - 2 * padding)
		if (innerSize % 2) {
			innerSize--
		}
		image = (
			<>
				<View
					style={[
						border.shadow.medium,
						{
							backgroundColor: colors['main-background'],
							padding: padding,
							borderRadius: 120,
							shadowColor: colors.shadow,
						},
					]}
				>
					<View>
						<Image
							source={{ uri: avatarURI }}
							style={[
								background.light.blue,
								border.shadow.medium,
								{
									width: innerSize,
									height: innerSize,
									borderRadius: innerSize / 2,
									shadowColor: colors.shadow,
								},
							]}
						/>
						<View
							style={[
								{
									width: innerSize,
									height: innerSize,
									position: 'absolute',
									backgroundColor: color.light.blue,
									opacity: 0.6,
								},
								border.radius.scale(innerSize / 2),
							]}
						/>
					</View>
				</View>
				<Icon
					style={{ top: -61, right: -30 }}
					name='camera-outline'
					pack='custom'
					width={30}
					height={30}
					fill={colors['background-header']}
				/>
			</>
		)
	} else {
		image = (
			<>
				<AccountAvatar size={90} isEditable />
				<View style={{ top: -61, right: -30, elevation: 6 }}>
					<Icon
						name='camera-outline'
						pack='custom'
						width={30}
						height={30}
						fill={colors['background-header']}
					/>
				</View>
			</>
		)
	}

	return (
		<View>
			<UnifiedText style={[margin.medium, margin.bottom.huge, text.align.center]}>
				{t('settings.edit-profile.title')}
			</UnifiedText>
			<View style={[row.left]}>
				<Pressable onPress={handlePicturePressed}>{image}</Pressable>
				<View style={[flex.tiny, margin.left.big]}>
					<Input
						label={t('settings.edit-profile.name-input-label') as any}
						placeholder={t('settings.edit-profile.name-input-placeholder')}
						value={state.name}
						onChangeText={name => localDispatch({ type: 'SET_NAME', name })}
						style={{ backgroundColor: colors['input-background'] }}
					/>
				</View>
			</View>
			<View style={[padding.horizontal.medium, { marginBottom: 35 }]}>
				<View style={[padding.top.small, row.left]}>
					<Icon
						name='checkmark-outline'
						width={20}
						height={20}
						fill={colors['background-header']}
					/>
					<UnifiedText
						style={[margin.left.medium, text.size.scale(11), { color: colors['secondary-text'] }]}
					>
						{t('settings.edit-profile.qr-will-update') as any}
					</UnifiedText>
				</View>
				<View style={[padding.top.small, row.left]}>
					<Icon name='close-outline' width={20} height={20} fill={colors['warning-asset']} />
					<UnifiedText
						style={[margin.left.medium, text.size.scale(11), { color: colors['secondary-text'] }]}
					>
						{t('settings.edit-profile.ocr-wont-update') as any}
					</UnifiedText>
				</View>
			</View>
			{state.err ? (
				<View
					style={{
						alignItems: 'center',
						justifyContent: 'center',
						marginTop: -25,
						marginBottom: 18,
					}}
				>
					<UnifiedText style={{ color: colors['warning-asset'] }}>
						🚧 {state.err.toString()} 🚧
					</UnifiedText>
				</View>
			) : undefined}
			<TouchableOpacity disabled={state.saving} onPress={handleSave}>
				<View
					style={[
						row.item.justify,
						column.justify,
						border.radius.small,
						_stylesEditProfile.profileButton,
						{ backgroundColor: colors['positive-asset'] },
					]}
				>
					{state.saving ? (
						<ActivityIndicator color={colors['secondary-text']} />
					) : (
						<UnifiedText
							style={[
								text.align.center,
								text.bold,
								{
									textTransform: 'uppercase',
									color: colors['background-header'],
								},
							]}
						>
							{(state.name && state.name !== account.displayName) || state.pic
								? t('settings.edit-profile.save')
								: (t('settings.edit-profile.cancel') as any)}
						</UnifiedText>
					)}
				</View>
			</TouchableOpacity>
		</View>
	)
}

export const EditProfile: FC = () => {
	const { padding } = useStyles()
	const colors = useThemeColor()

	return (
		<View
			style={[
				{
					backgroundColor: colors['main-background'],
					borderTopLeftRadius: 30,
					borderTopRightRadius: 30,
				},
				padding.horizontal.big,
			]}
		>
			<EditMyProfile />
		</View>
	)
}
