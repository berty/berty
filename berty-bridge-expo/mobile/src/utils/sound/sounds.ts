import { setAudioModeAsync, useAudioPlayer } from "expo-audio";

import { SoundKey, soundsMap } from "./sound.types";

export const playSound = async (name: SoundKey) => {
	const sound = soundsMap[name];

	if (!sound) {
		console.warn(`Tried to play unknown sound "${name}"`);
		return;
	}

	const player = useAudioPlayer(sound);

	await setAudioModeAsync({
		interruptionMode: "mixWithOthers",
	});

	player.play();
};
