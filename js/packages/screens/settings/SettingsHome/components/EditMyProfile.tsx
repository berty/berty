import { Icon } from '@ui-kitten/components'
import React, { useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import ImagePicker, { ImageOrVideo } from 'react-native-image-crop-picker'
import { useSelector } from 'react-redux'

import { SecondaryButton, SmallInput } from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useStyles } from '@berty/contexts/styles'
import { useAccount, useMessengerClient, useThemeColor, useUpdateAccount } from '@berty/hooks'
import { selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'

import { ImagePic } from './ImagePic'
import { ImagePlaceholder } from './ImagePlaceholder'

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

interface EditProfileProps {
	hide: () => void
}

export const EditMyProfile: React.FC<EditProfileProps> = ({ hide }) => {
	const colors = useThemeColor()
	const { t } = useTranslation()
	const client = useMessengerClient()
	const selectedAccount = useSelector(selectSelectedAccount)
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

	const { padding, margin, row, flex, text } = useStyles()

	return (
		<View style={[padding.horizontal.big]}>
			<UnifiedText style={[margin.small, margin.bottom.medium, text.size.huge, text.bold]}>
				{t('settings.edit-profile.title')}
			</UnifiedText>
			<View style={[{ flexDirection: 'row', alignItems: 'center' }]}>
				<Pressable onPress={handlePicturePressed}>
					{state.pic ? <ImagePic avatarURI={avatarURI} /> : <ImagePlaceholder />}
				</Pressable>
				<View style={[flex.tiny, margin.left.medium]}>
					<SmallInput
						value={state.name}
						onChangeText={name => localDispatch({ type: 'SET_NAME', name })}
						placeholder={t('settings.edit-profile.name-input-placeholder')}
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
						{t('settings.edit-profile.qr-will-update')}
					</UnifiedText>
				</View>
				<View style={[padding.top.small, row.left]}>
					<Icon name='close-outline' width={20} height={20} fill={colors['warning-asset']} />
					<UnifiedText
						style={[margin.left.medium, text.size.scale(11), { color: colors['secondary-text'] }]}
					>
						{t('settings.edit-profile.ocr-wont-update')}
					</UnifiedText>
				</View>
			</View>
			{state.err && (
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
			)}
			<SecondaryButton loading={state.saving} onPress={handleSave}>
				{(state.name && state.name !== account.displayName) || state.pic
					? t('settings.edit-profile.save')
					: t('settings.edit-profile.cancel')}
			</SecondaryButton>
		</View>
	)
}
