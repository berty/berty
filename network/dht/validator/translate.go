package validator

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"io"

	dht "github.com/libp2p/go-libp2p-kad-dht"
	pstore "github.com/libp2p/go-libp2p-peerstore"
	record "github.com/libp2p/go-libp2p-record"
	routing "github.com/libp2p/go-libp2p-routing"
	"github.com/pkg/errors"
	"go.uber.org/zap"
)

// default quorum value
const defaultGetValueQuorum = 16

type TranslateValidator struct{}

func (TranslateValidator) Validate(key string, value []byte) error {
	namespace, key, err := record.SplitKey(key)
	if err != nil {
		return err
	}

	if namespace != "bertyTranslate" {
		return errors.New("wrong namespace")
	}

	if len(value) > 2048 {
		return errors.New("value bigger than 2048 bytes")
	}

	if len(key) != 64 {
		return errors.New("key is not a valid SHA256 checksum: len != 64")
	}

	if _, err = hex.DecodeString(key); err != nil {
		return errors.Wrap(err, "key is not a valid SHA256 checksum")
	}

	return nil
}

func (TranslateValidator) Select(key string, vals [][]byte) (int, error) {
	return 0, nil
}

func getValueFromPeerInfo(rcontactID string, peerInfo pstore.PeerInfo) ([]byte, error) {
	key := md5.Sum([]byte(rcontactID))

	plainText, err := peerInfo.MarshalJSON()
	if err != nil {
		return []byte{}, errors.Wrap(err, "peerInfo marshaling failed")
	}

	blockCipher, err := aes.NewCipher(key[:])
	if err != nil {
		return []byte{}, errors.Wrap(err, "AES encryption failed during cipher creation")
	}

	cipherText := make([]byte, aes.BlockSize+len(plainText))
	iv := cipherText[:aes.BlockSize]
	if _, err = io.ReadFull(rand.Reader, iv); err != nil {
		return []byte{}, errors.Wrap(err, "AES encryption failed during IV creation")
	}

	stream := cipher.NewCFBEncrypter(blockCipher, iv)
	stream.XORKeyStream(cipherText[aes.BlockSize:], plainText)

	return cipherText, nil
}

func getPeerInfoFromValue(rcontactID string, value []byte) (pstore.PeerInfo, error) {
	var peerInfo pstore.PeerInfo
	key := md5.Sum([]byte(rcontactID))

	blockCipher, err := aes.NewCipher(key[:])
	if err != nil {
		return pstore.PeerInfo{}, errors.Wrap(err, "AES decryption failed during cipher creation")
	}

	if len(value) < aes.BlockSize {
		return pstore.PeerInfo{}, errors.New("AES decryption failed: cipherText length < AES blocksize")
	}

	iv := value[:aes.BlockSize]
	cipherText := value[aes.BlockSize:]

	plainText := cipherText
	stream := cipher.NewCFBDecrypter(blockCipher, iv)
	stream.XORKeyStream(plainText, cipherText)

	err = peerInfo.UnmarshalJSON(plainText)
	if err != nil {
		return peerInfo, errors.Wrap(err, "peerInfo unmarshaling failed")
	}

	return peerInfo, nil
}

func convertToTranslateRecord(rcontactID string, peerInfo pstore.PeerInfo) (key string, value []byte, err error) {
	hash := sha256.Sum256([]byte(rcontactID))
	key = "/bertyTranslate/" + hex.EncodeToString(hash[:])

	value, err = getValueFromPeerInfo(rcontactID, peerInfo)
	if err != nil {
		return "", []byte{}, errors.Wrap(err, "record creation failed")
	}

	return key, value, nil
}

func convertFromTranslateRecord(rcontactID string, value []byte) (peerInfo pstore.PeerInfo, err error) {
	peerInfo, err = getPeerInfoFromValue(rcontactID, value)
	if err != nil {
		return pstore.PeerInfo{}, errors.Wrap(err, "record conversion failed")
	}

	return peerInfo, nil
}

func RemoteContactIDToPeerInfo(ctx context.Context, r routing.IpfsRouting, rcontactID string) (pstore.PeerInfo, error) {
	logger().Debug("looking for peerInfo", zap.String("rcontactID", rcontactID))

	value, err := GetTranslateRecord(ctx, r, rcontactID)
	if err != nil {
		return pstore.PeerInfo{}, err
	}

	peerInfo, err := convertFromTranslateRecord(rcontactID, value)
	if err != nil {
		return pstore.PeerInfo{}, err
	}
	logger().Debug("found peerInfo", zap.String("peerID", peerInfo.ID.Pretty()))

	return peerInfo, nil
}

func GetTranslateRecord(ctx context.Context, r routing.IpfsRouting, rcontactID string) (value []byte, err error) {
	hash := sha256.Sum256([]byte(rcontactID))
	key := "/bertyTranslate/" + hex.EncodeToString(hash[:])

	value, err = r.GetValue(ctx, key, dht.Quorum(defaultGetValueQuorum))
	if err != nil {
		return []byte{}, err
	}

	return value, nil
}

func PutTranslateRecord(ctx context.Context, r routing.IpfsRouting, rcontactID string, peerInfo pstore.PeerInfo) error {
	key, value, err := convertToTranslateRecord(rcontactID, peerInfo)
	if err != nil {
		return err
	}

	return r.PutValue(ctx, key, value)
}
