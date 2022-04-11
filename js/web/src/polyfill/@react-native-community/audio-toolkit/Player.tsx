import EventEmitter from 'eventemitter3'

declare enum MediaStates {
	DESTROYED = -2,
	ERROR = -1,
	IDLE = 0,
	PREPARING = 1,
	PREPARED = 2,
	SEEKING = 3,
	PLAYING = 4,
	RECORDING = 4,
	PAUSED = 5,
}

interface BaseError<T> {
	err: 'invalidpath' | 'preparefail' | 'startfail' | 'notfound' | 'stopfail' | T
	message: string
	stackTrace: string[] | string
}

export type PlayerError = BaseError<'seekfail'>

const makeErr = (message: string): PlayerError => {
	return {
		err: 'seekfail',
		message: message,
		stackTrace: [],
	}
}

const applyDefaultsOptions = (opts: any | null | undefined): any => {
	if (!opts) {
		opts = {}
	}

	return {
		autoDestroy:
			opts.autoDestroy !== undefined && opts.autoDestroy !== null ? opts.autoDestroy : true,
		mixWithOthers:
			opts.mixWithOthers !== undefined && opts.mixWithOthers !== null ? opts.mixWithOthers : false,
	}
}

export class Player extends EventEmitter {
	path: string
	options: any

	/**
	 * Initialize the player for playback of song in path.
	 *
	 * @param path Path can be either filename, network URL or a file URL to resource.
	 * @param options
	 */
	constructor(path: string, options?: any) {
		super()
		this.path = path
		this.options = applyDefaultsOptions(options)
	}

	/**
	 * Prepare playback of the file provided during initialization. This method is optional to call but might be
	 * useful to preload the file so that the file starts playing immediately when calling `play()`.
	 * Otherwise the file is prepared when calling `play()` which may result in a small delay.
	 *
	 * @param callback Callback is called with empty first parameter when file is ready for playback with `play()`.
	 */
	prepare(callback?: (err: PlayerError | null) => void): this {
		if (callback) {
			callback(makeErr('unsupported'))
		}

		return this
	}

	/**
	 * Start playback.
	 *
	 * @param callback If callback is given, it is called when playback has started.
	 */
	play(callback?: (err: PlayerError | null) => void): this {
		if (callback) {
			callback(makeErr('unsupported'))
		}

		return this
	}

	/**
	 * Pauses playback. Playback can be resumed by calling `play()` with no parameters.
	 *
	 * @param callback Callback is called after the operation has finished.
	 */
	pause(callback?: (err: PlayerError | null) => void): this {
		if (callback) {
			callback(makeErr('unsupported'))
		}

		return this
	}

	/**
	 * Helper method for toggling pause.
	 *
	 * @param callback Callback is called after the operation has finished. Callback receives Object error as first
	 * argument, Boolean paused as second argument indicating if the player ended up playing (`false`)
	 * or paused (`true`).
	 */
	playPause(callback?: (err: PlayerError | null, paused: boolean) => void): this {
		if (callback) {
			callback(makeErr('unsupported'), true)
		}

		return this
	}

	/**
	 * Stop playback. If autoDestroy option was set during initialization, clears all media resources from memory.
	 * In this case the player should no longer be used.
	 *
	 * @param callback
	 */
	stop(callback?: (err: PlayerError | null) => void): this {
		if (callback) {
			callback(makeErr('unsupported'))
		}

		return this
	}

	/**
	 * Stops playback and destroys the player. The player should no longer be used.
	 *
	 * @param callback Callback is called after the operation has finished.
	 */
	destroy(callback?: (err: PlayerError | null) => void): void {
		if (callback) {
			callback(makeErr('unsupported'))
		}
	}

	/**
	 * Seek in currently playing media.
	 *
	 * @param position Position is the offset from the start.
	 * @param callback If callback is given, it is called when the seek operation completes. If another seek
	 * operation is performed before the previous has finished, the previous operation gets an error in its
	 * callback with the err field set to oldcallback. The previous operation should likely do nothing in this case.
	 */
	seek(position?: number, callback?: (err: PlayerError | null) => void): void {
		if (callback) {
			callback(makeErr('unsupported'))
		}
	}

	/**
	 * Get/set playback volume. The scale is from 0.0 (silence) to 1.0 (full volume). Default is 1.0.
	 */
	get volume(): number {
		return 0
	}

	set volume(_: number) {
		// TODO
	}

	/**
	 * Get/set current playback position in milliseconds. It's recommended to do seeking via `seek()`,
	 * as it is not possible to pass a callback when setting the `currentTime` property.
	 */
	get currentTime(): number {
		return 0
	}

	set currentTime(_: number) {
		// TODO
	}

	/**
	 * Get/set wakeLock on player, keeping it alive in the background. Default is `false`. Android only.
	 */
	get wakeLock(): boolean {
		return false
	}

	set wakeLock(_: boolean) {
		// unsupported
	}

	/**
	 * Get/set looping status of the current file. If `true`, file will loop when playback reaches end of file.
	 * Default is `false`.
	 */
	get looping(): boolean {
		return false
	}

	set looping(_: boolean) {
		// TODO
	}

	/**
	 * Get/set the playback speed for audio.
	 * Default is `1.0`.
	 *
	 * NOTE: On Android, this is only supported on Android 6.0+.
	 */
	get speed(): number {
		return 1.0
	}

	set speed(_: number) {
		// TODO
	}

	/**
	 * Get duration of prepared/playing media in milliseconds.
	 * If no duration is available (for example live streams), `-1` is returned.
	 */
	get duration(): number {
		return -1
	}

	/**
	 * Get the playback state.
	 */
	get state(): MediaStates {
		return MediaStates.ERROR
	}

	/**
	 * `true` if player can begin playback.
	 */
	get canPlay(): boolean {
		return false
	}

	/**
	 * `true` if player can stop playback.
	 */
	get canStop(): boolean {
		return false
	}

	/**
	 * `true` if player can prepare for playback.
	 */
	get canPrepare(): boolean {
		return false
	}

	/**
	 * `true` if player is playing.
	 */
	get isPlaying(): boolean {
		return false
	}

	/**
	 * `true` if player is stopped.
	 */
	get isStopped(): boolean {
		return true
	}

	/**
	 * `true` if player is paused.
	 */
	get isPaused(): boolean {
		return true
	}

	/**
	 * `true` if player is prepared.
	 */
	get isPrepared(): boolean {
		return false
	}
}
