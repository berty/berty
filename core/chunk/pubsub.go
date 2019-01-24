package chunk

import "berty.tech/core/pkg/errorcodes"

func send(data []byte) {
	subscribersMutex.Lock()
	for i := range subscribers {
		subscribers[i] <- data
	}
	subscribersMutex.Unlock()
}

func sendAll() {
	slices, err := findAllSlices()
	if err != nil {
		return
	}
	for _, slice := range slices {
		data, err := Reconstruct(slice)
		if err == nil {
			send(data)
		}
	}
}

func Subscribe() chan []byte {
	sub := make(chan []byte, 1)
	subscribersMutex.Lock()
	subscribers = append(subscribers, sub)
	subscribersMutex.Unlock()
	go sendAll()
	return sub
}

func Unsubscribe(sub chan []byte) {
	subscribersMutex.Lock()
	for i := range subscribers {
		if sub == subscribers[i] {
			subscribers = append(subscribers[:i], subscribers[i+1:]...)
		}
	}
	subscribersMutex.Unlock()
	close(sub)
}

func Publish(chunk *Chunk) error {
	err := save(chunk)
	if err != nil {
		return errorcodes.ErrChunkPublish.Wrap(err)
	}
	// try to retrieve slice
	go func() {
		slice, err := findSliceByID(chunk.SliceID)
		if err != nil {
			return
		}
		data, err := Reconstruct(slice)
		if err != nil {
			return
		}
		send(data)
	}()
	return nil
}
