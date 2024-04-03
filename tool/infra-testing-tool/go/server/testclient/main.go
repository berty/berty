package main

import (
	"bytes"
	"context"
	"encoding/gob"
	"fmt"
	"infratesting/logging"
	"infratesting/server/grpc/server"
	"time"

	"berty.tech/berty/v2/go/pkg/messengertypes"
	"google.golang.org/grpc"
)

func main() {
	ctx := context.Background()

	// conn, err := grpc.Dial("15.236.100.80:9090", grpc.WithInsecure())
	conn, err := grpc.Dial("192.168.1.177:9090", grpc.WithInsecure())
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	p := server.NewProxyClient(conn)

	////conn, err := grpc.Dial("15.236.100.80:9090", grpc.WithInsecure())
	//conn, err = grpc.Dial("192.168.1.177:9090", grpc.WithInsecure())
	//if err != nil {
	//	panic(err)
	//}
	//defer conn.Close()
	//

	_, err = p.ConnectToPeer(ctx, &server.ConnectToPeer_Request{
		Host: "127.0.0.1",
		Port: "9091",
	})
	if err != nil {
		panic(err)
	}

	//
	//resp, err := p.UploadLogs(ctx, &server.UploadLogs_Request{
	//	Folder: "thing",
	//	Name:   "brah",
	//})
	//if err != nil {
	//	log.Println(err)
	//}

	// log.Println(resp.UploadCount)

	groupName := "peepoo"

	request, err := p.CreateInvite(ctx, &server.CreateInvite_Request{GroupName: groupName})
	if err != nil {
		panic(err)
	}

	n := bytes.NewBuffer(request.Invite)
	dec := gob.NewDecoder(n)
	var invite messengertypes.ShareableBertyGroup_Reply
	err = dec.Decode(&invite)
	if err != nil {
		_ = logging.LogErr(err)
	}

	logging.Log(invite.Link)
	logging.Log(invite.WebURL)

	_, err = p.StartReceiveMessage(ctx, &server.StartReceiveMessage_Request{GroupName: groupName})
	if err != nil {
		_ = logging.LogErr(err)
	}

	time.Sleep(time.Second * 30)

	//conn2, err := grpc.Dial("192.168.1.177:7091", grpc.WithInsecure())
	//if err != nil {
	//	panic(err)
	//}
	//defer conn2.Close()
	//
	//g2 := server.NewGroupClient(conn2)
	////p := server.NewPeerClient(conn)
	////t := server.NewTestClient(conn)
	//
	//
	//
	//_, err = g2.ReplicationJoinGroup(ctx, &server.ReplicationJoinGroup_Request{
	//	GroupName: groupName,
	//	Invite: invite.Invite,
	//})
	//if err != nil {
	//	log.Println(err)
	//}
	//
	//for {
	////	resp, err := client.TestConnection(ctx, &server.TestConnection_Request{Message: uuid.NewString()})
	////	if err != nil {
	////		panic(err)
	////	}
	////
	////	log.Printf("successful: %v", resp.Success)
	////}
	//
	//_, err = p.ConnectToPeer(ctx, &server.ConnectToPeer_Request{
	//	Host: "127.0.0.1",
	//	Port: "9091",
	//})
	//if err != nil {
	//	panic(err)
	//}
	//
	//groupName := uuid.NewString()
	//
	//_, err = g.CreateInvite(ctx, &server.CreateInvite_Request{GroupName: groupName})
	//if err != nil {
	//	panic(err)
	//}

	////r2, err := g.JoinGroup(ctx, &server.JoinGroup_Request{
	////	GroupName: groupName,
	////	Invite:    resp.Invite,
	////})
	////if err != nil {
	////	panic(err)
	////}
	////
	////fmt.Printf(r2.String())
	//
	////_, err = t.IsTestRunning(ctx, &server.IsTestRunning_Request{
	////	GroupName: groupName,
	////	TestName:  "beebop",
	////})
	////if err != nil {
	////	log.Println(err)
	////}
	//
	//tests := []string{"a", "b", "c"}
	//

	_, err = p.NewTest(ctx, &server.NewTest_Request{
		GroupName: groupName,
		TestN:     0,
		Type:      "text",
		Size:      200,
		Interval:  1,
		Amount:    10,
	})
	if err != nil {
		logging.LogErr(err)
	}

	//_, err = p.NewTest(ctx, &server.NewTest_Request{
	//	GroupName: groupName,
	//	TestN:  1,
	//	Type:      "media",
	//	Size:      2000,
	//	Interval:  1,
	//	Amount: 10,
	//})
	//if err != nil {
	//	logging.LogErr(err)
	//}

	fmt.Println("starting")
	_, err = p.StartTest(ctx, &server.StartTest_Request{
		GroupName: groupName,
		TestN:     0,
	})
	if err != nil {
		logging.LogErr(err)
	}
	//
	//_, err = p.StartTest(ctx, &server.StartTest_Request{
	//	GroupName: groupName,
	//	TestN:  1,
	//})
	//if err != nil {
	//	logging.LogErr(err)
	//}

	time.Sleep(time.Second * 3)

	r, err := p.IsTestRunning(ctx, &server.IsTestRunning_Request{
		GroupName: groupName,
		TestN:     0,
	})
	if err != nil {
		logging.LogErr(err)
	} else {
		logging.Log(r.TestIsRunning)
	}

	time.Sleep(time.Second * 10)

	_, err = p.UploadLogs(ctx, &server.UploadLogs_Request{
		Folder: "test",
		Name:   "test-node-1",
	})
	if err != nil {
		logging.LogErr(err)
	}

	//
	//_, err = g.StartReceiveMessage(ctx, &server.StartReceiveMessage_Request{GroupName: groupName})
	//if err != nil {
	//	log.Println(err)
	//}
	//
	//
	//var wg sync.WaitGroup
	//
	//for _, test := range tests {
	//	fmt.Println(test)
	//	wg.Add(1)
	//	go func(wg *sync.WaitGroup) {
	//		te := test
	//		defer wg.Done()
	//		for {
	//			r, err := t.IsTestRunning(ctx, &server.IsTestRunning_Request{
	//				GroupName: groupName,
	//				TestName:  te,
	//			})
	//			if err != nil {
	//				log.Println(err)
	//			} else {
	//				if r.GetTestIsRunning() == false {
	//					fmt.Println("test successful!")
	//					break
	//				}
	//			}
	//
	//			time.Sleep(time.Second * 1)
	//		}
	//	}(&wg)
	//}
	//
	//wg.Wait()
	//
	//_, err = g.StopReceiveMessage(ctx, &server.StopReceiveMessage_Request{GroupName: groupName})
	//if err != nil {
	//	log.Println(err)
	//}
	//
	//log.Println("done")
}
