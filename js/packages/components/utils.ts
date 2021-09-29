import { Platform } from 'react-native'
import { Buffer } from 'buffer'
import beapi from '@berty-tech/api'
import emojiSource from 'emoji-datasource'

import { WelshProtocolServiceClient } from '@berty-tech/grpc-bridge/welsh-clients.gen'
import { checkNotifications, check, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { useEffect, useRef } from 'react'
import moment from 'moment'
import { Long } from 'protobufjs/light'
import { MsgrState } from '@berty-tech/store/context'

let cache: { cid: string; prom: Promise<string> }[] = []

export const base64ToURLBase64 = (str: string) =>
	str.replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '')

const fetchSource = async (
	protocolClient: WelshProtocolServiceClient,
	cid: string,
): Promise<string> => {
	const stream = await protocolClient.attachmentRetrieve({
		attachmentCid: Buffer.from(cid, 'base64'),
	})
	const data = await new Promise<Buffer>((resolve, reject) => {
		let buf = Buffer.from('')
		stream.onMessage((msg, err) => {
			if (err?.EOF) {
				resolve(buf)
				return
			}
			if (err) {
				reject(err)
				return
			}
			if (msg?.block) {
				buf = Buffer.concat([buf, msg.block])
			}
		})
		stream.start()
	})
	return data.toString('base64')
}

export const getSource = async (
	protocolClient: WelshProtocolServiceClient,
	cid: string,
): Promise<string> => {
	if (!cache.find(item => item.cid === cid)) {
		if (cache.length >= 20) {
			// evict
			cache = cache.slice(1)
		}
		cache.push({ cid, prom: fetchSource(protocolClient, cid) })
	}
	const cached = cache.find(item => item.cid === cid)
	if (!cached) {
		throw new Error('unexpected cache miss')
	}
	return cached.prom
}

export const getMediaTypeFromMedias = (
	medias: beapi.messenger.Interaction['medias'] | null | undefined,
): string => {
	let type = 'file'
	if (medias?.[0]?.mimeType?.startsWith('image')) {
		type = 'picture'
	} else if (medias?.[0]?.mimeType?.startsWith('audio')) {
		type = 'audio'
	}

	return type
}

export const toEmoji = (code: any) => {
	return String.fromCodePoint(...code.split('-').map((u: string) => '0x' + u))
}

export const getEmojiByName = (name: string) => {
	const requiredSource = emojiSource.find(
		(item: any) => item.short_name === name.replaceAll(':', ''),
	)
	return toEmoji(requiredSource?.unified)
}

export const useTimeout = (callback: () => void, delay: number | null) => {
	const savedCallback = useRef(callback)

	// Remember the latest callback if it changes.
	useEffect(() => {
		savedCallback.current = callback
	}, [callback])

	// Set up the timeout.
	useEffect(() => {
		// Don't schedule if no delay is specified.
		if (delay === null) {
			return
		}
		const id = setTimeout(() => savedCallback.current(), delay)
		return () => clearTimeout(id)
	}, [delay])
}

export const checkPermissions = async (
	permissionType: 'p2p' | 'audio' | 'notification' | 'camera',
	navigate: any,
	options?: { createNewAccount?: boolean; isToNavigate?: boolean; navigateNext?: string },
) => {
	let status
	if (permissionType === 'notification') {
		try {
			const res = await checkNotifications()
			status = res.status
		} catch (err) {
			console.log('request notification permission err:', err)
		}
	} else if (permissionType === 'p2p') {
		status = await check(
			Platform.OS === 'ios'
				? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
				: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
		)
	} else if (permissionType === 'camera') {
		status = await check(
			Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA,
		)
	} else if (permissionType === 'audio') {
		status = await check(
			Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
		)
	}

	console.log('RESULTS', status, options)
	if ((status === RESULTS.DENIED || status === RESULTS.BLOCKED) && options?.isToNavigate) {
		navigate('Main.Permissions', {
			permissionType,
			permissionStatus: status,
			navigateNext: options?.navigateNext,
			createNewAccount: options?.createNewAccount,
		})
	} else if (options?.navigateNext) {
		navigate(options?.navigateNext, {})
	}

	return status
}

const getValidDateMoment = (date: number | Date): moment.Moment => {
	const mDate = moment(date)
	return mDate.isValid() ? mDate : moment(0)
}

/**
 * When we show time or date, depending on recency
 * (e.g. conversation list)
 */
const fmtTimestamp1 = (date: number | Date): string => {
	const now = moment()
	const mDate = getValidDateMoment(date)
	if (now.isSame(mDate, 'day')) {
		return mDate.format('hh:mm a')
	} else if (now.subtract(1, 'day').isSame(mDate, 'day')) {
		return 'Yesterday'
	} else if (now.isSame(mDate, 'week')) {
		return mDate.format('dddd')
	} else {
		return mDate.format('DD/MM/YY')
	}
}

/**
 * When we just care about the day (e.g. 1-1 chat confirmed header)
 */
const fmtTimestamp2 = (date: number | Date): string => {
	const now = moment()
	const mDate = getValidDateMoment(date)
	if (now.isSame(mDate, 'day')) {
		return 'Today'
	} else if (now.subtract(1, 'day').isSame(mDate, 'day')) {
		return 'Yesterday'
	}
	return mDate.format('MMM D YYYY')
}

/**
 * Only show time
 * Use for messages in chatrooms
 * (We don't need to show the date; it is in the sticky header)
 */
const fmtTimestamp3 = (date: number | Date): string => {
	const mDate = getValidDateMoment(date)
	return mDate.format('hh:mm a')
}

export const timeFormat = { fmtTimestamp1, fmtTimestamp2, fmtTimestamp3 }

export const strToTimestamp = (dateStr?: string): number =>
	new Date(parseInt(dateStr || '0', 10)).getTime()

export const pbDateToNum = (pbTimestamp?: number | Long | string | null): number => {
	try {
		return !pbTimestamp ? 0 : parseInt(pbTimestamp as string, 10)
	} catch (e) {
		console.warn(`Error parsing date ${pbTimestamp}; returning zero`)
		return 0
	}
}

export const getRandomColor = () => {
	const letters = '0123456789ABCDEF'
	let color = '#'
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)]
	}
	return color
}

export const randomizeThemeColor = () => {
	return {
		'main-text': getRandomColor(),
		'main-background': getRandomColor(),
		'secondary-text': getRandomColor(),
		'background-header': getRandomColor(),
		'secondary-background-header': getRandomColor(),
		'alt-secondary-background-header': getRandomColor(),
		'reverted-main-text': getRandomColor(),
		'positive-asset': getRandomColor(),
		'negative-asset': getRandomColor(),
		'warning-asset': getRandomColor(),
		'input-background': getRandomColor(),
		shadow: getRandomColor(),
	}
}

export const showNeedRestartNotification = (showNotification: any, ctx: MsgrState, t: any) => {
	showNotification({
		title: t('notification.need-restart.title'),
		message: t('notification.need-restart.desc'),
		onPress: async () => {
			await ctx.restart()
		},
		additionalProps: { type: 'message' },
	})
}
