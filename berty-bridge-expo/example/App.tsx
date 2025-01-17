import BertyBridgeExpo from "berty-bridge-expo";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import beapi from "./api";
import { createServiceClient } from "./grpc-bridge";
import { logger } from "./grpc-bridge/middleware";
import { bridge as rpcBridge } from "./grpc-bridge/rpc";

export default function App() {
	const [greeting, setGreeting] = useState("");
	let progress = "";

	const accountClient = createServiceClient(
		beapi.account.AccountService,
		rpcBridge,
		logger.create("ACCOUNT")
	);

	// const messengerClient = createServiceClient(
	// 	beapi.messenger.MessengerService,
	// 	rpcBridge,
	// 	logger.create("MESSENGER")
	// );

	const protocolClient = createServiceClient(
		beapi.protocol.ProtocolService,
		rpcBridge,
		logger.create("PROTOCOL")
	);

	useEffect(() => {
		(async () => {
			try {
				await BertyBridgeExpo.initBridge();

				progress = `Getting number of accounts...\n`;
				setGreeting(progress);

				const accounts = await accountClient.listAccounts({});
				console.log(JSON.stringify(accounts));
				progress += `Number of accounts: ${accounts.accounts.length}\n`;
				setGreeting(progress);

				progress += `Creating a new account...\n`;
				setGreeting(progress);
				const newAccount = await accountClient.createAccount({
					accountId: accounts.accounts.length.toString(),
					accountName: `Berty-${accounts.accounts.length}`,
					networkConfig: {},
				});
				progress += `New account name: ${newAccount.accountMetadata?.name}\n`;
				setGreeting(progress);

				progress += `Opening this account...\n`;
				setGreeting(progress);
				const account = await accountClient.openAccount({
					accountId: newAccount.accountMetadata?.accountId,
				});
				progress += `Account opened\n`;
				setGreeting(progress);

				progress += `Getting system info...\n`;
				setGreeting(progress);
				const conf = await protocolClient.serviceGetConfiguration({});
				console.log(JSON.stringify(conf));
				progress += `IPFS Peer ID: ${conf.peerId}\n`;
				setGreeting(progress);

				progress += `Closing account\n`;
				setGreeting(progress);
				accountClient.closeAccount({
					accountId: account.accountMetadata?.accountId,
				});
				progress += `Account closed\n`;
				setGreeting(progress);

				progress += `Deleting account\n`;
				setGreeting(progress);
				accountClient.deleteAccount({
					accountId: account.accountMetadata?.accountId,
				});
				progress += `Account deleted\n`;
				setGreeting(progress);
			} catch (error) {
				console.log(error);
			}
		})();
	}, []);

	return (
		<View style={styles.container}>
			<Text>Berty Expo Module Example App</Text>
			<Text>{greeting}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
