import BertyBridgeExpo from "berty-bridge-expo";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import beapi from "./api";
import { GRPCError, createServiceClient } from "./grpc-bridge";
import { logger } from "./grpc-bridge/middleware";
import { bridge as rpcBridge } from "./grpc-bridge/rpc";

export default function App() {
	const [greeting, setGreeting] = useState("");

	const protocolClient = createServiceClient(
		beapi.protocol.ProtocolService,
		rpcBridge,
		logger.create("PROTOCOL")
	);

	useEffect(() => {
		(async () => {
			try {
				await BertyBridgeExpo.initBridge();
				protocolClient.serviceGetConfiguration({});
				setGreeting("hello from berty");
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
