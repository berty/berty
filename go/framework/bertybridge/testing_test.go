package bertybridge

import (
	"bufio"
	"bytes"
	"context"
	"crypto/tls"
	"encoding/base64"
	"encoding/binary"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/textproto"

	ipfs_interface "github.com/ipfs/interface-go-ipfs-core"
)

func (pc *ProtocolConfig) ipfsCoreAPI(api ipfs_interface.CoreAPI) {
	pc.coreAPI = api
}

func makeRequest(host string, method string, headers http.Header, body io.Reader, isText bool) (*http.Response, error) {
	contentType := "application/grpc-web"
	if isText {
		// base64 encode the body
		encodedBody := &bytes.Buffer{}
		encoder := base64.NewEncoder(base64.StdEncoding, encodedBody)
		_, err := io.Copy(encoder, body)
		if err != nil {
			return nil, err
		}
		err = encoder.Close()
		if err != nil {
			return nil, err
		}
		body = encodedBody
		contentType = "application/grpc-web-text"
	}

	url := fmt.Sprintf("http://%s%s", host, method)
	req, err := http.NewRequest("POST", url, body)
	req = req.WithContext(context.Background())
	req.Header = headers

	req.Header.Set("Content-Type", contentType)
	bridgeClient := &http.Client{
		Transport: &http.Transport{TLSClientConfig: &tls.Config{InsecureSkipVerify: true}},
	}
	resp, err := bridgeClient.Do(req)
	return resp, err
}

func decodeMultipleBase64Chunks(b []byte) ([]byte, error) {
	// grpc-web allows multiple base64 chunks: the implementation may send base64-encoded
	// "chunks" with potential padding whenever the runtime needs to flush a byte buffer.
	// https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md
	output := make([]byte, base64.StdEncoding.DecodedLen(len(b)))
	outputEnd := 0

	for inputEnd := 0; inputEnd < len(b); {
		chunk := b[inputEnd:]
		paddingIndex := bytes.IndexByte(chunk, '=')
		if paddingIndex != -1 {
			// find the consecutive =
			for {
				paddingIndex++
				if paddingIndex >= len(chunk) || chunk[paddingIndex] != '=' {
					break
				}
			}
			chunk = chunk[:paddingIndex]
		}
		inputEnd += len(chunk)

		n, err := base64.StdEncoding.Decode(output[outputEnd:], chunk)
		if err != nil {
			return nil, err
		}
		outputEnd += n
	}
	return output[:outputEnd], nil
}

func makeGrpcRequest(host string, method string, requestMessages [][]byte, isText bool) (responseMessages [][]byte, err error) {
	writer := new(bytes.Buffer)
	for _, msgBytes := range requestMessages {
		grpcPreamble := []byte{0, 0, 0, 0, 0}
		binary.BigEndian.PutUint32(grpcPreamble[1:], uint32(len(msgBytes)))
		writer.Write(grpcPreamble)
		writer.Write(msgBytes)
	}
	resp, err := makeRequest(host, method, http.Header{}, writer, isText)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	if isText {
		contents, err = decodeMultipleBase64Chunks(contents)
		if err != nil {
			return nil, err
		}
	}

	reader := bytes.NewReader(contents)
	for {
		grpcPreamble := []byte{0, 0, 0, 0, 0}
		readCount, err := reader.Read(grpcPreamble)
		if err == io.EOF {
			break
		}
		if readCount != 5 || err != nil {
			return nil, fmt.Errorf("Unexpected end of body in preamble: %v", err)
		}
		payloadLength := binary.BigEndian.Uint32(grpcPreamble[1:])
		payloadBytes := make([]byte, payloadLength)

		readCount, err = reader.Read(payloadBytes)
		if uint32(readCount) != payloadLength || err != nil {
			if err == io.EOF {
				return responseMessages, nil
			}

			return nil, fmt.Errorf("Unexpected end of msg: %v", err)
		}
		if grpcPreamble[0]&(1<<7) == (1 << 7) { // MSB signifies the trailer parser
			bufferReader := bytes.NewBuffer(payloadBytes)
			tp := textproto.NewReader(bufio.NewReader(bufferReader))

			// First, read bytes as MIME headers.
			// However, it normalizes header names by textproto.CanonicalMIMEHeaderKey.
			// In the next step, replace header names by raw one.
			_, err := tp.ReadMIMEHeader()
			if err != nil {
				bufferReader = bytes.NewBuffer(payloadBytes)
				_ = textproto.NewReader(bufio.NewReader(bufferReader))
			}

		} else {
			responseMessages = append(responseMessages, payloadBytes)
		}
	}

	return responseMessages, nil
}
