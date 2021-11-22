package rendezvous

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/binary"
	"time"
)

const DefaultRotationInterval = time.Hour * 24

func RoundTimePeriod(date time.Time, interval time.Duration) time.Time {
	if interval < 0 {
		interval = -interval
	}

	intervalSeconds := int64(interval.Seconds())

	periodsElapsed := date.Unix() / intervalSeconds
	totalTime := periodsElapsed * intervalSeconds

	return time.Unix(totalTime, 0).In(date.Location())
}

func NextTimePeriod(date time.Time, interval time.Duration) time.Time {
	if interval < 0 {
		interval = -interval
	}

	return RoundTimePeriod(date, interval).Add(interval)
}

func GenerateRendezvousPointForPeriod(topic, seed []byte, date time.Time) []byte {
	buf := make([]byte, 8)
	mac := hmac.New(sha256.New, append(topic, seed...))
	binary.BigEndian.PutUint64(buf, uint64(date.Unix()))

	_, err := mac.Write(buf)
	if err != nil {
		panic(err)
	}
	sum := mac.Sum(nil)

	return sum
}
