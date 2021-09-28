package bertyprotocol

import (
	"errors"
	"fmt"
	"strconv"

	ipfscid "github.com/ipfs/go-cid"
	ipfsfiles "github.com/ipfs/go-ipfs-files"
	ipfsoptions "github.com/ipfs/interface-go-ipfs-core/options"
	ipfspath "github.com/ipfs/interface-go-ipfs-core/path"

	"berty.tech/berty/v2/go/internal/cryptoutil"
	"berty.tech/berty/v2/go/internal/streamutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
	"berty.tech/berty/v2/go/pkg/tyber"
)

func (s *service) AttachmentPrepare(stream protocoltypes.ProtocolService_AttachmentPrepareServer) (err error) {
	tyberCtx, _, endSection := tyber.Section(stream.Context(), s.logger, "Preparing attachment")
	defer func() { endSection(err, "") }()

	// read header
	headerMsg, err := stream.Recv()
	if err != nil {
		return errcode.ErrStreamHeaderRead.Wrap(err)
	}
	if len(headerMsg.GetBlock()) > 0 {
		return errcode.ErrInvalidInput.Wrap(errors.New("unexpected non-empty block"))
	}
	if headerMsg.GetDisableEncryption() {
		return errcode.ErrNotImplemented.Wrap(errors.New("disable_encryption not implemented"))
	}
	tyber.LogStep(tyberCtx, s.logger, "AttachmentPrepare header received", tyber.WithJSONDetail("Header", headerMsg))

	// open requests reader
	plaintext := streamutil.FuncReader(func() ([]byte, error) {
		msg, err := stream.Recv()
		return msg.GetBlock(), err
	}, s.logger)
	defer plaintext.Close()

	// open stream cipher
	sk, ciphertext, err := cryptoutil.AttachmentSealer(plaintext, s.logger)
	if err != nil {
		return errcode.ErrCryptoCipherInit.Wrap(err)
	}
	defer ciphertext.Close()

	// sink ciphertext to ipfs
	ipfsFile := ipfsfiles.NewReaderFile(ciphertext)
	defer ipfsFile.Close()
	ipfsPath, err := s.ipfsCoreAPI.Unixfs().Add(stream.Context(), ipfsFile, attachmentForcePin)
	if err != nil {
		return errcode.ErrIPFSAdd.Wrap(err)
	}
	cid := ipfsPath.Cid()

	// log file info
	{
		sz, err := ipfsFile.Size()
		if err != nil {
			sz = -1
		}
		tyber.LogStep(tyberCtx, s.logger, "Sinked ciphertext to ipfs",
			tyber.WithDetail("CID", cid.String()),
			tyber.WithDetail("IPFSPath", ipfsPath.String()),
			tyber.WithDetail("CiphertextSize", strconv.FormatInt(sz, 10)),
		)
	}

	// store associated private key
	cidBytes := cid.Bytes()
	if err = s.deviceKeystore.AttachmentPrivKeyPut(cidBytes, sk); err != nil {
		return errcode.ErrKeystorePut.Wrap(err)
	}

	// return cid to client
	if err = stream.SendAndClose(&protocoltypes.AttachmentPrepare_Reply{AttachmentCID: cidBytes}); err != nil {
		return errcode.ErrStreamSendAndClose.Wrap(err)
	}

	// success
	return nil
}

func (s *service) AttachmentRetrieve(req *protocoltypes.AttachmentRetrieve_Request, stream protocoltypes.ProtocolService_AttachmentRetrieveServer) (err error) {
	tyberCtx, _, endSection := tyber.Section(stream.Context(), s.logger, "Retrieving attachment")
	defer func() {
		if err != nil {
			endSection(err, "")
		}
	}()

	// deserialize cid. We could do it later but it's better to fail fast
	cid, err := ipfscid.Cast(req.GetAttachmentCID())
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	// get associated private key
	sk, err := s.deviceKeystore.AttachmentPrivKey(req.GetAttachmentCID())
	if err != nil {
		return errcode.ErrKeystoreGet.Wrap(err)
	}

	// open ciphertext reader
	ipfsNode, err := s.ipfsCoreAPI.Unixfs().Get(stream.Context(), ipfspath.IpfsPath(cid))
	if err != nil {
		return errcode.ErrIPFSGet.Wrap(err)
	}
	defer ipfsNode.Close()
	if sz, err := ipfsNode.Size(); err == nil {
		tyber.LogStep(tyberCtx, s.logger, fmt.Sprintf("Found attachment's ciphertext of %.2f MB", float64(sz)/1000/1000))
	}
	ciphertext := ipfsfiles.ToFile(ipfsNode)
	defer ciphertext.Close()

	// open stream cipher
	plaintext, err := cryptoutil.AttachmentOpener(ciphertext, sk, s.logger)
	if err != nil {
		return errcode.ErrCryptoCipherInit.Wrap(err)
	}
	defer plaintext.Close()

	// sink plaintext to client
	plaintextSize := 0
	if err := streamutil.FuncSink(make([]byte, 64*1024), plaintext, func(block []byte) error {
		plaintextSize += len(block)
		return stream.Send(&protocoltypes.AttachmentRetrieve_Reply{Block: block})
	}); err != nil {
		return errcode.ErrStreamSink.Wrap(err)
	}

	// success
	endSection(nil, fmt.Sprintf("Decrypted attachment of %.2f MB", float64(plaintextSize)/1000/1000))
	return nil
}

func attachmentForcePin(settings *ipfsoptions.UnixfsAddSettings) error {
	if settings == nil {
		return errcode.ErrInvalidInput.Wrap(errors.New("nil ipfs settings"))
	}
	settings.Pin = true
	return nil
}
