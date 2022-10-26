import React, { useEffect, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NativeModules, View } from 'react-native'

import { CreateGroupFooterWithIcon, MenuToggle, ItemSection } from '@berty/components'
import { LoaderDots } from '@berty/components/LoaderDots'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { StatusBarPrimary } from '@berty/components/StatusBarPrimary'
import { useStyles } from '@berty/contexts/styles'
import { ScreenFC } from '@berty/navigation'
import {
	AsyncStorageKeys,
	NodeInfos,
	NodeInfosDefault,
	storeData,
	getData,
} from '@berty/utils/async-storage/async-storage'

import { LabelInput } from './components/LabelInput'

export const SelectNode: ScreenFC<'Account.SelectNode'> = ({ route }) => {
	// `action` is the action to do when the form is validated. This action can failed we must test the result.
	// `init` is true when the screen is showed at the start of the app. In DevTools, `init` is false.
	const { action, init } = route.params
	const { column, margin, padding, text, row } = useStyles()
	const { t } = useTranslation()
	const [nodeInfos, setNodeInfos] = useState(NodeInfosDefault)
	const [externalNode, setExternalNode] = useState(false)
	const [address, setAddress] = useState(NodeInfosDefault.address)
	const [accountPort, setAccountPort] = useState(NodeInfosDefault.accountPort)
	const [messengerPort, setMessengerPort] = useState(NodeInfosDefault.messengerPort)
	const [dontAsk, setDontAsk] = useState(false)
	const [forceAsk, setForceAsk] = useState(false) // forceAsk is used to bypass `dontAsk` state if `action` failed
	const debug = NativeModules.GoBridge?.getConstants().debug

	const validate = useCallback(
		async (externalNode, address, accountPort, messengerPort, dontAsk) => {
			const nodeInfos: NodeInfos = {
				external: externalNode,
				address: address,
				accountPort: accountPort,
				messengerPort: messengerPort,
				dontAsk: dontAsk,
			}

			await storeData(AsyncStorageKeys.SelectNode, nodeInfos)
			const res = await action(externalNode, address, accountPort)
			if (!res) {
				setForceAsk(true)
			}
		},
		[action],
	)

	useEffect(() => {
		const f = async () => {
			let selectNode: NodeInfos | null = await getData(AsyncStorageKeys.SelectNode)

			if (selectNode === null) {
				selectNode = NodeInfosDefault
			} else {
				setNodeInfos(selectNode)
				setExternalNode(selectNode.external)
				setAddress(selectNode.address)
				setAccountPort(selectNode.accountPort)
				setMessengerPort(selectNode.messengerPort)
				setDontAsk(selectNode.dontAsk)
			}
			// Auto-validate the form
			// The following condition is the same as the condition to render the form (before the return)
			if (!forceAsk && init && (!debug || selectNode.dontAsk)) {
				validate(
					selectNode.external,
					selectNode.address,
					selectNode.accountPort,
					selectNode.messengerPort,
					selectNode.dontAsk,
				)
			}
		}

		f().then()
	}, [debug, init, validate, forceAsk])

	// Render the form by default in debug mode
	// `dontAsk` doesn't work if `init` is false to render the form in DevTools
	// `forceAsk` force the form render because `action` failed
	if (!forceAsk && init && (!debug || nodeInfos.dontAsk)) {
		return (
			<>
				<StatusBarPrimary />
				<LoaderDots />
			</>
		)
	} else {
		return (
			<>
				<View style={[row.item.justify, column.justify, padding.medium]}>
					<UnifiedText style={[margin.left.medium, row.item.justify, text.size.big]}>
						{t('settings.devtools.select-node.title')}
					</UnifiedText>
				</View>
				<ItemSection>
					<MenuToggle
						accessibilityLabel={t('settings.devtools.select-node.node-type')}
						isToggleOn={externalNode}
						onPress={() => {
							setExternalNode(!externalNode)
						}}
					>
						{t('settings.devtools.select-node.node-type')}
					</MenuToggle>
					{externalNode && (
						<>
							<LabelInput
								label={t('settings.devtools.select-node.address')}
								value={address}
								onChangeText={setAddress}
								placeholder={NodeInfosDefault.address}
							/>
							<LabelInput
								label={t('settings.devtools.select-node.account-port')}
								value={accountPort}
								onChangeText={setAccountPort}
								placeholder={NodeInfosDefault.accountPort}
							/>
							<LabelInput
								label={t('settings.devtools.select-node.messenger-port')}
								value={messengerPort}
								onChangeText={setMessengerPort}
								placeholder={NodeInfosDefault.messengerPort}
							/>
						</>
					)}
				</ItemSection>
				<ItemSection>
					<MenuToggle
						accessibilityLabel={t('settings.devtools.select-node.dont-ask')}
						isToggleOn={dontAsk}
						onPress={() => {
							setDontAsk(!dontAsk)
						}}
					>
						{t('settings.devtools.select-node.dont-ask')}
					</MenuToggle>
				</ItemSection>
				<CreateGroupFooterWithIcon
					title={t('settings.devtools.select-node.button-continue')}
					icon='arrow-forward-outline'
					action={async () => {
						await validate(externalNode, address, accountPort, messengerPort, dontAsk)
					}}
				/>
			</>
		)
	}
}
