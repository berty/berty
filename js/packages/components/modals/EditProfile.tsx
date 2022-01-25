import React, { useReducer } from 'react'
import {
	ActivityIndicator,
	Image,
	Pressable,
	StyleSheet,
	TouchableOpacity,
	View,
	KeyboardAvoidingView,
} from 'react-native'
import { Icon, Input, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker'

import { defaultStylesDeclaration, useStyles } from '@berty-tech/styles'
import { useMessengerClient, useMessengerContext, useThemeColor } from '@berty-tech/store'
import { setChecklistItemDone } from '@berty-tech/redux/reducers/checklist.reducer'
import { useAppDispatch, useAccount } from '@berty-tech/react-redux'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import { StackActions } from '@react-navigation/native'

import { AccountAvatar } from '../avatars'
import { useSelector } from 'react-redux'
import { selectSelectedAccount } from '@berty-tech/redux/reducers/ui.reducer'

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
	const ctx = useMessengerContext()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const dispatch = useAppDispatch()
	const navigation = useNavigation()
	const client = useMessengerClient()
	const selectedAccount = useSelector(selectSelectedAccount)

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
				console.log('opening stream', state.pic)
				const stream = await client?.mediaPrepare({})
				if (!stream) {
					throw new Error('failed to open prepareAttachment stream')
				}

				console.log('sending header')
				await stream.emit({
					info: {
						mimeType: state.pic.mime,
						filename: state.pic.filename,
						displayName: state.pic.filename || 'picture',
					},
					uri: avatarURI,
				})

				console.log('closing send')
				const reply = await stream.stopAndRecv()
				console.log('got reply')
				if (!reply?.cid) {
					throw new Error('invalid PrepareAttachment reply, missing cid')
				}

				console.log('done', reply.cid)

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
				await ctx.updateAccount({
					accountId: selectedAccount,
					avatarCid: update.avatarCid,
				})

				if (update.avatarCid) {
					dispatch(setChecklistItemDone({ key: 'avatar' }))
				}
			}

			navigation.dispatch(StackActions.pop(1))
		} catch (err) {
			console.warn(err)
			localDispatch({ type: 'SET_ERROR', err })
		}
	}

	const [{ padding, margin, row, background, border, flex, text, color, column }] = useStyles()

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
		<View style={[margin.vertical.big]}>
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
					<Text
						style={[margin.left.medium, text.size.scale(11), { color: colors['secondary-text'] }]}
					>
						{t('settings.edit-profile.qr-will-update') as any}
					</Text>
				</View>
				<View style={[padding.top.small, row.left]}>
					<Icon name='close-outline' width={20} height={20} fill={colors['warning-asset']} />
					<Text
						style={[margin.left.medium, text.size.scale(11), { color: colors['secondary-text'] }]}
					>
						{t('settings.edit-profile.ocr-wont-update') as any}
					</Text>
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
					<Text style={{ color: colors['warning-asset'] }}>🚧 {state.err.toString()} 🚧</Text>
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
						<Text
							style={[
								text.align.center,
								text.bold.medium,
								text.size.scale(16),
								{
									textTransform: 'uppercase',
									color: colors['background-header'],
								},
							]}
						>
							{(state.name && state.name !== account.displayName) || state.pic
								? t('settings.edit-profile.save')
								: (t('settings.edit-profile.cancel') as any)}
						</Text>
					)}
				</View>
			</TouchableOpacity>
		</View>
	)
}

const Header: React.FC = () => {
	const colors = useThemeColor()
	const { t }: any = useTranslation()

	return (
		<>
			<View style={{ height: 30, alignItems: 'center', justifyContent: 'center' }}>
				<View
					style={{
						backgroundColor: `${colors['secondary-text']}90`,
						width: 50,
						height: 4,
						borderRadius: 2,
					}}
				/>
			</View>
			<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
				<Text
					style={{
						fontWeight: '700',
						fontSize: 22,
						lineHeight: 40,
						color: colors['main-text'],
					}}
				>
					{t('settings.edit-profile.title') as any}
				</Text>
				<Icon name='edit-outline' width={28} height={28} fill={colors['background-header']} />
			</View>
		</>
	)
}

export const EditProfile: ScreenFC<'Modals.EditProfile'> = () => {
	const [{ padding }] = useStyles()
	const colors = useThemeColor()
	const navigation = useNavigation()

	return (
		<Pressable
			onPress={() => navigation.dispatch(StackActions.pop(1))}
			style={[
				StyleSheet.absoluteFill,
				{
					justifyContent: 'flex-end',
					backgroundColor: `${defaultStylesDeclaration.colors.default.black}80`,
				},
			]}
		>
			<KeyboardAvoidingView behavior='padding'>
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
					<Header />
					<EditMyProfile />
				</View>
			</KeyboardAvoidingView>
		</Pressable>
	)
}
