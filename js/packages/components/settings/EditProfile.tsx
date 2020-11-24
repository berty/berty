import React, { useReducer } from 'react'
import {
	View,
	TouchableOpacity,
	StyleSheet,
	Image,
	ActivityIndicator,
	Pressable,
	KeyboardAvoidingView,
} from 'react-native'
import { Icon, Input, Text } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import ImagePicker from 'react-native-image-crop-picker'
import { Buffer } from 'buffer'

import { useStyles } from '@berty-tech/styles'
import { ScreenProps } from '@berty-tech/navigation'
import { useNavigation } from '@berty-tech/navigation'
import { useAccount, useMsgrContext } from '@berty-tech/store/hooks'

import { AccountAvatar } from '../avatars'
import BlurView from '../shared-components/BlurView'

async function pickPicture() {
	const image = await ImagePicker.openPicker({
		width: 400,
		height: 400,
		cropping: true,
		includeBase64: true,
		cropperCircleOverlay: true,
	})

	return `data:${image.mime};base64,${(image as { data: string }).data}`
}

//
// Edit Profile
//

// Style
const useStylesEditProfile = () => {
	const [{ width, height, border }] = useStyles()
	return {
		profileCircleAvatar: [width(90), height(90), border.radius.scale(45)],
	}
}
const _stylesEditProfile = StyleSheet.create({
	profileButton: { width: '80%', height: 50 },
	profileInfo: { width: '100%', height: 60 },
})

type State = {
	saving: boolean
	avatarURI?: string
	name?: string
	err?: any
}

type Action =
	| {
			type: 'SAVE'
	  }
	| {
			type: 'SET_PICTURE'
			uri: string
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
			state.avatarURI = action.uri
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
	const ctx = useMsgrContext()
	const _styles = useStylesEditProfile()
	const { goBack } = useNavigation()

	const account = useAccount()

	const [state, dispatch] = useReducer(reducer, {
		...initialState,
		name: account?.displayName || undefined,
	})

	const handlePicturePressed = async () => {
		try {
			const b64Pic = await pickPicture()
			if (b64Pic) {
				dispatch({ type: 'SET_PICTURE', uri: b64Pic })
			}
		} catch (err) {
			if (err?.code !== 'E_PICKER_CANCELLED') {
				dispatch({ type: 'SET_ERROR', err })
			}
		}
	}

	const handleSave = async () => {
		try {
			dispatch({ type: 'SAVE' })

			const update: any = {}
			let updated = false

			if (state.avatarURI) {
				console.log('opening stream', state.avatarURI.length)
				const stream = await ctx.protocolClient?.attachmentPrepare({})
				if (!stream) {
					throw new Error('failed to open prepareAttachment stream')
				}

				console.log('sending header')
				const hret = await stream.emit({})

				console.log('sending blocks', hret)
				const data = Buffer.from(state.avatarURI.split(',')[1], 'base64')
				const max = data.length
				const blockSize = 1024 * 64
				for (let i = 0; i < max; ) {
					const next = i + blockSize
					await stream.emit({ block: data.slice(i, Math.min(next, max)) })
					i = next
				}

				console.log('closing send')
				const reply = await stream.stopAndRecv()
				console.log('got reply')
				if (!reply?.attachmentCid) {
					throw new Error('invalid PrepareAttachment reply, missing cid')
				}

				const base64ToURLBase64 = (str: string) =>
					str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '')

				const cid = base64ToURLBase64(Buffer.from(reply?.attachmentCid).toString('base64'))

				console.log('done', cid)

				update.avatarCid = cid
				updated = true
			}

			if (state.name && state.name != account?.displayName) {
				update.displayName = state.name
				updated = true
			}

			if (updated) {
				console.log('updating acc', update)
				await ctx.client?.accountUpdate(update)
			}

			// all good, go back
			goBack()
		} catch (err) {
			console.warn(err)
			dispatch({ type: 'SET_ERROR', err })
		}
	}

	const [{ padding, margin, row, background, border, flex, text, color, column }] = useStyles()

	let image: JSX.Element
	if (state.avatarURI) {
		image = (
			<Image
				source={{ uri: state.avatarURI }}
				style={[_styles.profileCircleAvatar, background.light.blue, border.shadow.medium]}
			/>
		)
	} else if (account?.avatarCid) {
		image = <AccountAvatar size={90} />
	} else {
		image = (
			<View style={[_styles.profileCircleAvatar, background.light.blue, border.shadow.medium]} />
		)
	}

	return (
		<Translation>
			{(t) => (
				<View style={[margin.vertical.big]}>
					<View style={[row.left, margin.bottom.medium]}>
						<TouchableOpacity onPress={handlePicturePressed}>{image}</TouchableOpacity>
						<View style={[flex.tiny, margin.left.big]}>
							<Input
								label={t('settings.edit-profile.name-input-label')}
								placeholder={t('settings.edit-profile.name-input-placeholder')}
								value={state.name}
								onChangeText={(name) => dispatch({ type: 'SET_NAME', name })}
							/>
						</View>
					</View>
					<View style={[padding.horizontal.medium, { marginBottom: 35 }]}>
						<View style={[padding.top.small, row.left]}>
							<Icon name='checkmark-outline' width={20} height={20} fill={color.green} />
							<Text style={[text.color.grey, margin.left.medium, text.size.scale(11)]}>
								{t('settings.edit-profile.qr-will-update')}
							</Text>
						</View>
						<View style={[padding.top.small, row.left]}>
							<Icon name='close-outline' width={20} height={20} fill={color.red} />
							<Text style={[text.color.grey, margin.left.medium, text.size.scale(11)]}>
								{t('settings.edit-profile.ocr-wont-update')}
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
							<Text style={{ color: 'red' }}>🚧 {state.err.toString()} 🚧</Text>
						</View>
					) : undefined}
					<TouchableOpacity disabled={state.saving} onPress={handleSave}>
						<View
							style={[
								row.item.justify,
								column.justify,
								border.radius.small,
								background.light.blue,
								_stylesEditProfile.profileButton,
							]}
						>
							{state.saving ? (
								<ActivityIndicator color='grey' />
							) : (
								<Text
									style={[
										text.align.center,
										text.color.blue,
										text.bold.medium,
										text.size.scale(16),
										{
											textTransform: 'uppercase',
										},
									]}
								>
									{(state.name && state.name !== account?.displayName) || state.avatarURI
										? t('settings.edit-profile.save')
										: t('settings.edit-profile.cancel')}
								</Text>
							)}
						</View>
					</TouchableOpacity>
				</View>
			)}
		</Translation>
	)
}

const Header: React.FC = () => {
	return (
		<Translation>
			{(t) => (
				<>
					<View style={{ height: 30, alignItems: 'center', justifyContent: 'center' }}>
						<View style={{ backgroundColor: 'lightgrey', width: 50, height: 4, borderRadius: 2 }} />
					</View>
					<View
						style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
					>
						<Text style={{ fontWeight: '700', fontSize: 22, lineHeight: 40, color: '#383B62' }}>
							{t('settings.edit-profile.title')}
						</Text>
						<Icon name='edit-outline' width={28} height={28} fill={'#3F49EA'} />
					</View>
				</>
			)}
		</Translation>
	)
}

export const EditProfile: React.FC<ScreenProps.Settings.EditProfile> = () => {
	const [{ padding }] = useStyles()
	const { goBack } = useNavigation()
	return (
		<Pressable onPress={goBack}>
			<BlurView style={{ justifyContent: 'flex-end', height: '100%' }}>
				<KeyboardAvoidingView behavior='padding'>
					<Pressable>
						<View
							style={[
								{ backgroundColor: 'white', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
								padding.horizontal.big,
							]}
						>
							<Header />
							<EditMyProfile />
						</View>
					</Pressable>
				</KeyboardAvoidingView>
			</BlurView>
		</Pressable>
	)
}

/*const ResetMyQrCode: React.FC<{}> = () => {
	const [{padding, margin, row, background, border, text, color}] = useStyles()
	return (
		<View style={[margin.vertical.big]}>
						<TouchableOpacity
							style={[
								row.fill,
								padding.horizontal.medium,
								background.white,
								border.shadow.medium,
								border.radius.small,
								margin.bottom.medium,
								{ alignItems: 'center' },
								_stylesEditProfile.profileInfo,
							]}
						>
							<Icon name='info-outline' width={30} height={30} />
							<Text style={[padding.right.big]}>Why reset my QR Code ?</Text>
							<Icon name='arrow-ios-downward-outline' width={30} height={30} />
						</TouchableOpacity>
						<View style={[padding.horizontal.medium, padding.top.medium]}>
							<View style={[padding.top.small, row.left, { alignItems: 'center' }]}>
								<Icon name='checkmark-outline' width={20} height={20} fill={color.green} />
								<Text style={[text.color.grey, margin.left.medium, text.size.scale(11)]}>
									Your name and avatar will be updated on all your conversations
					</Text>
							</View>
						</View>
						<TouchableOpacity
							style={[
								_stylesEditProfile.profileButton,
								row.center,
								border.radius.small,
								background.light.red,
								margin.top.big,
								row.item.justify,
							]}
						>
							<Text style={[text.align.center, text.color.red, text.bold.medium, text.size.scale(16)]}>
								RESET MY QR CODE
				</Text>
						</TouchableOpacity>
						<Text style={[text.align.center, text.color.red, padding.top.small, text.size.small]}>
							This action can't be undone
			</Text>
					</View>
	)
}*/
