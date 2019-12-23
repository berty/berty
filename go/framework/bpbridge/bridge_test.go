package bpbridge

import (
	"bufio"
	"bytes"
	"crypto/tls"
	"encoding/base64"
	"encoding/binary"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/textproto"
	"testing"

	"berty.tech/berty/go/internal/ipfsutil"
	"berty.tech/berty/go/internal/testutil"
	"berty.tech/berty/go/pkg/bertyprotocol"
	"github.com/gogo/protobuf/proto"
	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
	"golang.org/x/net/context"
	"google.golang.org/grpc"
)

func TestBridge(t *testing.T) {
	var (
		err          error
		bridge       *Bridge
		bridgeClient *Client
		grpcClient   *grpc.ClientConn
		req, res     []byte
		//results      [][]byte
	)

	logger := testutil.Logger(t)
	bridge, err = newBridge(logger, Opts{
		coreAPI:         ipfsutil.TestingCoreAPI(context.Background(), t),
		GRPCListener:    "127.0.0.1:0",
		GRPCWebListener: "127.0.0.1:0",
	})
	checkErr(t, err)
	defer func() {
		err = bridge.Close()
		assert.NoErrorf(t, err, "bridge.Close")
	}()

	logger.Info(
		"listeners",
		zap.String("gRPC", bridge.GRPCListenerAddr()),
		zap.String("gRPC web", bridge.GRPCWebListenerAddr()),
	)

	// clients

	bridgeClient = bridge.GRPCClient()
	assert.NotNil(t, bridgeClient)

	grpcClient, err = grpc.Dial(bridge.GRPCListenerAddr(), grpc.WithInsecure())
	checkErr(t, err)

	// setup unary test
	msg := &bertyprotocol.InstanceGetConfiguration_Request{}

	req, err = proto.Marshal(msg)
	checkErr(t, err)

	// bridgeClient test
	res, err = bridgeClient.UnaryRequest("/berty.protocol.ProtocolService/InstanceGetConfiguration", req)
	checkErr(t, err)

	out := &bertyprotocol.InstanceGetConfiguration_Reply{}
	err = proto.Unmarshal(res, out)
	checkErr(t, err)

	// webclient test
	cc := bertyprotocol.NewProtocolServiceClient(grpcClient)
	_, err = cc.InstanceGetConfiguration(context.Background(), msg)
	checkErr(t, err)

	//results, err = makeGrpcRequest(
	//	bridge.GRPCWebListenerAddr(),
	//	"/berty.protocol.ProtocolService/ContactGet",
	//	[][]byte{req},
	//	false,
	//)
	//checkErr(t, err)
	//
	//for _, res = range results {
	//	out := &bertyprotocol.InstanceGetConfiguration{}
	//	err = proto.Unmarshal(res, out)
	//	checkErr(t, err)
	//}
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
