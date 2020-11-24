package bertyprotocol

import (
	"errors"
	"io"

	ipfscid "github.com/ipfs/go-cid"
	ipfsfiles "github.com/ipfs/go-ipfs-files"
	ipfsoptions "github.com/ipfs/interface-go-ipfs-core/options"
	ipfspath "github.com/ipfs/interface-go-ipfs-core/path"

	"berty.tech/berty/v2/go/pkg/bertytypes"
	"berty.tech/berty/v2/go/pkg/errcode"
)

func (s *service) AttachmentPrepare(stream ProtocolService_AttachmentPrepareServer) error {
	headerMsg, err := stream.Recv()
	if err != nil {
		return errcode.ErrStreamRead.Wrap(err)
	}
	if len(headerMsg.GetBlock()) > 0 {
		return errcode.ErrInvalidInput.Wrap(errors.New("unexpected non-empty block"))
	}
	if headerMsg.GetDisableEncryption() {
		return errcode.ErrNotImplemented.Wrap(errors.New("disable_encryption not implemented"))
	}
	s.logger.Debug("AttachmentPrepare: header received")

	plaintext, ptout := io.Pipe()
	defer plaintext.Close()

	go func() {
		err := func() error {
			for {
				msg, err := stream.Recv()
				if err == io.EOF {
					return nil
				}
				if err != nil {
					return errcode.ErrStreamRead.Wrap(err)
				}

				if len(msg.GetBlock()) == 0 {
					// receiving an empty block is equivalent to EOF to help clients with difficult plumbing
					s.logger.Debug("AttachmentPrepare: empty block received, emulating EOF")
					return nil
				}

				if _, err := ptout.Write(msg.GetBlock()); err != nil {
					return errcode.ErrStreamWrite.Wrap(err)
				}
			}
		}()
		closePipeOut(ptout, err, "AttachmentPrepare: failed to properly close plaintext reader", s.logger)
	}()

	sk, ciphertext, err := attachmentSealer(plaintext, s.logger)
	if err != nil {
		return errcode.ErrCryptoCipherInit.Wrap(err)
	}
	defer ciphertext.Close()

	ipfsFile := ipfsfiles.NewReaderFile(ciphertext)
	defer ipfsFile.Close()
	ipfsPath, err := s.ipfsCoreAPI.Unixfs().Add(stream.Context(), ipfsFile, attachmentForcePin)
	if err != nil {
		return errcode.ErrIPFSAdd.Wrap(err)
	}
	cid := ipfsPath.Cid()

	err = s.deviceKeystore.AttachmentPrivKeyPut(cid.Bytes(), sk)
	if err != nil {
		return errcode.ErrKeystorePut.Wrap(err)
	}

	err = stream.SendAndClose(&bertytypes.AttachmentPrepare_Reply{
		AttachmentCID: cid.Bytes(),
	})
	if err != nil {
		return errcode.ErrStreamWrite.Wrap(err)
	}

	return nil
}

func (s *service) AttachmentRetrieve(req *bertytypes.AttachmentRetrieve_Request, stream ProtocolService_AttachmentRetrieveServer) error {
	cid, err := ipfscid.Cast(req.GetAttachmentCID())
	if err != nil {
		return errcode.ErrDeserialization.Wrap(err)
	}

	sk, err := s.deviceKeystore.AttachmentPrivKey(req.GetAttachmentCID())
	if err != nil {
		return errcode.ErrKeystoreGet.Wrap(err)
	}

	ipfsNode, err := s.ipfsCoreAPI.Unixfs().Get(stream.Context(), ipfspath.IpfsPath(cid))
	if err != nil {
		return errcode.ErrIPFSGet.Wrap(err)
	}
	defer ipfsNode.Close()

	ciphertext := ipfsfiles.ToFile(ipfsNode)
	defer ciphertext.Close()

	plaintext, err := attachmentOpener(ciphertext, sk, s.logger)
	if err != nil {
		return errcode.ErrCryptoCipherInit.Wrap(err)
	}
	defer plaintext.Close()

	buf := make([]byte, 64*1024)
	for {
		n, err := plaintext.Read(buf)
		if err == io.EOF {
			return nil
		}
		if err != nil {
			return errcode.ErrStreamRead.Wrap(err)
		}

		reply := &bertytypes.AttachmentRetrieve_Reply{Block: buf[:n]}
		if err := stream.Send(reply); err != nil {
			return errcode.ErrStreamWrite.Wrap(err)
		}
	}
}

func attachmentForcePin(settings *ipfsoptions.UnixfsAddSettings) error {
	settings.Pin = true
	return nil
}
