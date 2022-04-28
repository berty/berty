import React, { useEffect } from "react";
import {
	SafeAreaView,
	ScrollView,
	StatusBar,
	Platform,
	useColorScheme,
	View,
	Switch,
	Text,
	TouchableOpacity,
	Image,
	ActivityIndicator,
} from "react-native";

import { Colors, Header } from "react-native/Libraries/NewAppScreen";
import { MiniGame } from "mini-game/MiniGame";
import { SafeAreaProvider } from "react-native-safe-area-context";
import RNFS from "react-native-fs";
import Gzip from "rn-gzip";

const pkgDir = RNFS.MainBundlePath + "/games";
const gzFile = "game.html.gz";
const manifestFile = "manifest.json";
const iconFile = "icon.png";

type GameType = {
	icon: string;
	name: string;
	html: string;
	debug: boolean;
};

const GameList: React.FC<{
	games: GameType[] | [];
	selectGame: (arg0: number) => void;
	setGames: React.Dispatch<React.SetStateAction<GameType[] | []>>;
}> = ({ games, selectGame, setGames }) => {
	return (
		<ScrollView
			contentContainerStyle={{ padding: 10 }}
			showsVerticalScrollIndicator={false}
		>
			{games.length
				? games.map((game, index) => {
						return (
							<TouchableOpacity
								style={{
									flexDirection: "row",
									height: 60,
									alignItems: "center",
									justifyContent: "space-between",
									borderRadius: 20,
									backgroundColor: "white",
									padding: 10,
									marginTop: 10,
								}}
								onPress={() => selectGame(index)}
								key={index}
							>
								<View style={{ alignItems: "center", flexDirection: "row" }}>
									<Image
										style={{ height: 50, width: 50 }}
										source={{ uri: game.icon }}
									/>
									<Text style={{ marginLeft: 20, color: "black" }}>
										{game.name}
									</Text>
								</View>

								<View style={{ alignItems: "center", flexDirection: "row" }}>
									<Text style={{ marginRight: 10 }}>Debug mode</Text>
									<Switch
										value={games[index].debug}
										onValueChange={() => {
											const value = games[index].debug ? false : true;
											setGames(
												games.map((game, _index) => {
													if (index === _index) {
														game.debug = value;
													}
													return game;
												})
											);
										}}
									/>
								</View>
							</TouchableOpacity>
						);
				  })
				: null}
		</ScrollView>
	);
};

const App = () => {
	const isDarkMode = useColorScheme() === "dark";
	const [isGame, setIsGame] = React.useState<boolean>(false);
	const [games, setGames] = React.useState<GameType[] | []>([]);
	const [selectGame, setSelectGame] = React.useState<number>(0);

	const backgroundStyle = {
		backgroundColor: isDarkMode ? Colors.darker : "#EDEDED",
	};
	const colorStyle = {
		color: isDarkMode ? Colors.lighter : Colors.darker,
	};

	useEffect(() => {
		const f = async () => {
			// read directories at bundle assets directory
			const directories =
				Platform.OS === "ios"
					? await RNFS.readDir(pkgDir)
					: await RNFS.readDirAssets("");
			let gamesGet: GameType[] = [];
			for (const dir of directories) {
				// the specifics checks are all directories directly bundled in Android assets directory, that we don't want to check
				if (
					dir.isDirectory() &&
					dir.name !== "fallback-locales" &&
					dir.name !== "images" &&
					dir.name !== "locales#lang_en" &&
					dir.name !== "locales#lang_fr" &&
					dir.name !== "stored-locales" &&
					dir.name !== "webkit"
				) {
					// read html or html.gz file
					const zipContents =
						Platform.OS === "ios"
							? await RNFS.readFile(
									pkgDir + `/${dir.name}` + `/${gzFile}`,
									"base64"
							  )
							: await RNFS.readFileAssets(`${dir.name}/game.html`, "utf8");

					// read manifest file
					const manifestContent = JSON.parse(
						Platform.OS === "ios"
							? await RNFS.readFile(
									pkgDir + `/${dir.name}` + `/${manifestFile}`,
									"utf8"
							  )
							: await RNFS.readFileAssets(`${dir.name}/${manifestFile}`, "utf8")
					);

					// unzip for iOS
					const unzipContents =
						Platform.OS === "ios" ? Gzip.unzip(zipContents) : zipContents;

					// read icon file for Android
					const androidIcon =
						Platform.OS === "android" &&
						(await RNFS.readFileAssets(`${dir.name}/${iconFile}`, "base64"));

					gamesGet.push({
						icon:
							Platform.OS === "ios"
								? `${pkgDir}/${dir.name}/${iconFile}`
								: `data:image/png;base64,${androidIcon}`,
						name: manifestContent.name,
						html: unzipContents,
						debug: true,
					});
				}
			}
			setGames(gamesGet);
		};

		f();
	}, []);

	return (
		<SafeAreaProvider>
			{isGame && games.length ? (
				<MiniGame
					debug={games[selectGame].debug}
					exit={() => setIsGame(false)}
					htmlString={games[selectGame].html}
				/>
			) : (
				<SafeAreaView style={{ ...backgroundStyle, flex: 1 }}>
					<StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
					<View style={{ margin: 30, ...backgroundStyle }}>
						<Text
							style={{
								...colorStyle,
								textAlign: "center",
								fontWeight: "800",
								fontSize: 30,
							}}
						>
							BERTY MINI GAMES
						</Text>
					</View>

					<View style={backgroundStyle}>
						{games.length ? (
							<GameList
								games={games}
								selectGame={(index: number) => {
									setSelectGame(index);
									setIsGame(true);
								}}
								setGames={setGames}
							/>
						) : (
							<ActivityIndicator size="large" />
						)}
					</View>
				</SafeAreaView>
			)}
		</SafeAreaProvider>
	);
};

export default App;
