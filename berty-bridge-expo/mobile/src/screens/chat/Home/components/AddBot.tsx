import { BlurView } from '@react-native-community/blur'
import { Buffer } from 'buffer'
import React, { useEffect } from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

import { ActionModal } from '@berty/components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { bertyMethodsHooks, useAppDispatch } from '@berty/hooks'
import {
	PersistentOptionsKeys,
	selectPersistentOptions,
	setPersistentOption,
} from '@berty/redux/reducers/persistentOptions.reducer'
import { base64ToURLBase64 } from '@berty/utils/convert/base64'

const AddBotBody: React.FC<{
	displayName: string
	link: string
	closeModal: () => void
}> = ({ displayName, link, closeModal }) => {
	const persistentOptions = useSelector(selectPersistentOptions)
	const dispatch = useAppDispatch()
	const { call: requestContact, done, error } = bertyMethodsHooks.useContactRequest()
	const {
		reply: pdlReply,
		error: pdlError,
		call,
		done: pdlDone,
	} = bertyMethodsHooks.useParseDeepLink()

	useEffect(() => {
		call({ link })
	}, [call, link])

	useEffect(() => {
		if (done && !error) {
			closeModal()
		}
	}, [done, error, closeModal])

	const onClose = () => {
		dispatch(
			setPersistentOption({
				type: PersistentOptionsKeys.Suggestions,
				payload: {
					...persistentOptions.suggestions,
					[displayName]: {
						...persistentOptions.suggestions[displayName],
						state: 'skipped',
					},
				},
			}),
		)
		closeModal()
	}

	const onAdd = () => {
		if (pdlDone && !pdlError && pdlReply && pdlReply.link?.bertyId?.accountPk) {
			dispatch(
				setPersistentOption({
					type: PersistentOptionsKeys.Suggestions,
					payload: {
						...persistentOptions.suggestions,
						[displayName]: {
							...persistentOptions.suggestions[displayName],
							state: 'added',
							pk: base64ToURLBase64(
								Buffer.from(pdlReply.link.bertyId.accountPk).toString('base64'),
							),
						},
					},
				}),
			)
			requestContact({
				link,
			})
		}
	}

	return pdlReply?.link?.bertyId?.accountPk ? (
		<ActionModal
			title={`👋 ADD ${displayName}?`}
			description={`You don't have any contacts yet would you like to add the ${displayName} to discover and test conversations?`}
			cancelText='SKIP'
			confirmText='ADD !'
			onClose={onClose}
			onConfirm={onAdd}
		/>
	) : null
}

export const AddBot: React.FC<{ displayName: string; link: string; closeModal: () => void }> = ({
	link,
	displayName,
	closeModal,
}) => {
	const { windowHeight } = useAppDimensions()

	return (
		<View style={[StyleSheet.absoluteFill, { elevation: 6, zIndex: 6 }]}>
			<TouchableOpacity
				activeOpacity={0}
				style={[
					StyleSheet.absoluteFill,
					{
						position: 'absolute',
						top: 0,
						bottom: 0,
						left: 0,
						right: 0,
						height: windowHeight,
					},
				]}
				onPress={closeModal}
			>
				<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			</TouchableOpacity>
			<AddBotBody displayName={displayName} link={link} closeModal={closeModal} />
		</View>
	)
}
