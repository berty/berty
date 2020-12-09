package bertyprotocol

import (
	"errors"

	ipfscid "github.com/ipfs/go-cid"
	ipfsfiles "github.com/ipfs/go-ipfs-files"
	ipfsoptions "github.com/ipfs/interface-go-ipfs-core/options"
	ipfspath "github.com/ipfs/interface-go-ipfs-core/path"

	"berty.tech/berty/v2/go/internal/streamutil"
	"berty.tech/berty/v2/go/pkg/errcode"
	"berty.tech/berty/v2/go/pkg/protocoltypes"
)

func (s *service) AttachmentPrepare(stream protocoltypes.ProtocolService_AttachmentPrepareServer) error {
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
	s.logger.Debug("AttachmentPrepare: header received")

	// open requests reader
	plaintext := streamutil.FuncReader(func() ([]byte, error) {
		msg, err := stream.Recv()
		return msg.GetBlock(), err
	}, s.logger)
	defer plaintext.Close()

	// open stream cipher
	sk, ciphertext, err := attachmentSealer(plaintext, s.logger)
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
	cid := ipfsPath.Cid().Bytes()

	// store associated private key
	err = s.deviceKeystore.AttachmentPrivKeyPut(cid, sk)
	if err != nil {
		return errcode.ErrKeystorePut.Wrap(err)
	}

	// return cid to client
	if err = stream.SendAndClose(&protocoltypes.AttachmentPrepare_Reply{AttachmentCID: cid}); err != nil {
		return errcode.ErrStreamSendAndClose.Wrap(err)
	}

	// success
	return nil
}

func (s *service) AttachmentRetrieve(req *protocoltypes.AttachmentRetrieve_Request, stream protocoltypes.ProtocolService_AttachmentRetrieveServer) error {
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
	ciphertext := ipfsfiles.ToFile(ipfsNode)
	defer ciphertext.Close()

	// open stream cipher
	plaintext, err := attachmentOpener(ciphertext, sk, s.logger)
	if err != nil {
		return errcode.ErrCryptoCipherInit.Wrap(err)
	}
	defer plaintext.Close()

	// sink plaintext to client
	if err := streamutil.FuncSink(make([]byte, 64*1024), plaintext, func(block []byte) error {
		return stream.Send(&protocoltypes.AttachmentRetrieve_Reply{Block: block})
	}); err != nil {
		return errcode.ErrStreamSink.Wrap(err)
	}

	// success
	return nil
}

func attachmentForcePin(settings *ipfsoptions.UnixfsAddSettings) error {
	if settings == nil {
		return errcode.ErrInvalidInput.Wrap(errors.New("nil ipfs settings"))
	}
	settings.Pin = true
	return nil
}
