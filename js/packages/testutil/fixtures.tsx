import beapi from '@berty-tech/api'

const empty: beapi.messenger.IMedia = {
	metadataBytes: beapi.messenger.MediaMetadata.encode({}).finish(),
}

const media = {
	empty,
}

export default {
	media,
}
