package main

import (
	"context"
	"fmt"
	"github.com/google/uuid"
	"google.golang.org/grpc"
	"infratesting/daemon/grpc/daemon"
	"infratesting/logging"
	"time"
)

func main() {
	ctx := context.Background()

	conn, err := grpc.Dial("13.36.214.193:7091", grpc.WithInsecure())
	if err != nil {
		panic(err)
	}
	defer conn.Close()

	p := daemon.NewProxyClient(conn)

	_, err = p.ConnectToPeer(ctx, &daemon.ConnectToPeer_Request{
		Host: "127.0.0.1",
		Port: "9091",
	})
	if err != nil {
		panic(err)
	}

	//
	//resp, err := p.UploadLogs(ctx, &daemon.UploadLogs_Request{
	//	Folder: "thing",
	//	Name:   "brah",
	//})
	//if err != nil {
	//	log.Println(err)
	//}

	//log.Println(resp.UploadCount)


	groupName := uuid.NewString()

	_, err = p.CreateInvite(ctx, &daemon.CreateInvite_Request{GroupName: groupName})
	if err != nil {
		panic(err)
	}

	//conn2, err := grpc.Dial("192.168.1.177:7091", grpc.WithInsecure())
	//if err != nil {
	//	panic(err)
	//}
	//defer conn2.Close()
	//
	//g2 := daemon.NewGroupClient(conn2)
	////p := daemon.NewPeerClient(conn)
	////t := daemon.NewTestClient(conn)
	//
	//
	//
	//_, err = g2.ReplicationJoinGroup(ctx, &daemon.ReplicationJoinGroup_Request{
	//	GroupName: groupName,
	//	Invite: invite.Invite,
	//})
	//if err != nil {
	//	log.Println(err)
	//}
	//
	//for {
	////	resp, err := client.TestConnection(ctx, &daemon.TestConnection_Request{Message: uuid.NewString()})
	////	if err != nil {
	////		panic(err)
	////	}
	////
	////	log.Printf("successfull: %v", resp.Success)
	////}
	//
	//_, err = p.ConnectToPeer(ctx, &daemon.ConnectToPeer_Request{
	//	Host: "127.0.0.1",
	//	Port: "9091",
	//})
	//if err != nil {
	//	panic(err)
	//}
	//
	//groupName := uuid.NewString()
	//
	//_, err = g.CreateInvite(ctx, &daemon.CreateInvite_Request{GroupName: groupName})
	//if err != nil {
	//	panic(err)
	//}

	////r2, err := g.JoinGroup(ctx, &daemon.JoinGroup_Request{
	////	GroupName: groupName,
	////	Invite:    resp.Invite,
	////})
	////if err != nil {
	////	panic(err)
	////}
	////
	////fmt.Printf(r2.String())
	//
	////_, err = t.IsTestRunning(ctx, &daemon.IsTestRunning_Request{
	////	GroupName: groupName,
	////	TestName:  "beebop",
	////})
	////if err != nil {
	////	log.Println(err)
	////}
	//
	//tests := []string{"a", "b", "c"}
	//

	_, err = p.NewTest(ctx, &daemon.NewTest_Request{
		GroupName: groupName,
		TestN:  0,
		Type:      "text",
		Size:      2000,
		Interval:  1,
		Amount: 5,
	})
	if err != nil {
		logging.LogErr(err)
	}

	_, err = p.NewTest(ctx, &daemon.NewTest_Request{
		GroupName: groupName,
		TestN:  1,
		Type:      "media",
		Size:      2000,
		Interval:  1,
		Amount: 5,
	})
	if err != nil {
		logging.LogErr(err)
	}



	fmt.Println("starting")
	_, err = p.StartTest(ctx, &daemon.StartTest_Request{
		GroupName: groupName,
		TestN:  0,
	})
	if err != nil {
		logging.LogErr(err)
	}

	_, err = p.StartTest(ctx, &daemon.StartTest_Request{
		GroupName: groupName,
		TestN:  1,
	})
	if err != nil {
		logging.LogErr(err)
	}


	time.Sleep(time.Second * 3)


	r, err := p.IsTestRunning(ctx, &daemon.IsTestRunning_Request{
		GroupName: groupName,
		TestN:  0,
	})
	if err != nil {
		logging.LogErr(err)
	} else {
		logging.Log(r.TestIsRunning)
	}

	time.Sleep(time.Second * 10)


	_, err = p.UploadLogs(ctx, &daemon.UploadLogs_Request{
		Folder: "test",
		Name:   "test-node-1",
	})
	if err != nil {
		logging.LogErr(err)
	}


	//
	//_, err = g.StartReceiveMessage(ctx, &daemon.StartReceiveMessage_Request{GroupName: groupName})
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
	//			r, err := t.IsTestRunning(ctx, &daemon.IsTestRunning_Request{
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
	//_, err = g.StopReceiveMessage(ctx, &daemon.StopReceiveMessage_Request{GroupName: groupName})
	//if err != nil {
	//	log.Println(err)
	//}
	//
	//log.Println("done")
}
