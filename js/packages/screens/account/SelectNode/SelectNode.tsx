import React, { useEffect, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NativeModules, View } from 'react-native'

import { CreateGroupFooterWithIcon, MenuToggle, ItemSection, SmallInput } from '@berty/components'
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
} from '@berty/utils/global-persistent-options/async-storage'

export const SelectNode: ScreenFC<'Account.SelectNode'> = ({ route }) => {
	const { action, init } = route.params
	const { column, flex, margin, padding, text, row } = useStyles()
	const { t } = useTranslation()
	const [nodeInfos, setNodeInfos] = useState(NodeInfosDefault)
	const [externalNode, setExternalNode] = useState(false)
	const [address, setAddress] = useState(NodeInfosDefault.address)
	const [accountPort, setAccountPort] = useState(NodeInfosDefault.accountPort)
	const [messengerPort, setMessengerPort] = useState(NodeInfosDefault.messengerPort)
	const [dontAsk, setDontAsk] = useState(false)
	const [forceAsk, setForceAsk] = useState(false)
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
							<View style={[row.center]}>
								<View style={[row.item.justify, column.justify]}>
									<UnifiedText style={[margin.left.medium, row.item.justify]}>
										{t('settings.devtools.select-node.address')}
									</UnifiedText>
								</View>
								<View style={[margin.left.medium, flex.tiny, row.item.justify]}>
									<SmallInput
										value={address}
										onChangeText={setAddress}
										placeholder={NodeInfosDefault.address}
										autoCorrect={false}
										textAlign={'right'}
									/>
								</View>
							</View>
							<View style={[row.center]}>
								<View style={[row.item.justify, column.justify]}>
									<UnifiedText style={[margin.left.medium, row.item.justify]}>
										{t('settings.devtools.select-node.account-port')}
									</UnifiedText>
								</View>
								<View style={[margin.left.medium, flex.tiny, row.item.justify]}>
									<SmallInput
										value={accountPort}
										onChangeText={setAccountPort}
										placeholder={NodeInfosDefault.accountPort}
										autoCorrect={false}
										textAlign={'right'}
									/>
								</View>
							</View>
							<View style={[row.center]}>
								<View style={[row.item.justify, column.justify]}>
									<UnifiedText style={[margin.left.medium, row.item.justify]}>
										{t('settings.devtools.select-node.messenger-port')}
									</UnifiedText>
								</View>
								<View style={[margin.left.medium, flex.tiny, row.item.justify]}>
									<SmallInput
										value={messengerPort}
										onChangeText={setMessengerPort}
										placeholder={NodeInfosDefault.messengerPort}
										autoCorrect={false}
										textAlign={'right'}
									/>
								</View>
							</View>
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
