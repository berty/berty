package storesetting_test

// func setUpStores(t *testing.T, ctx context.Context, members int, pathBase string) []*TestContext {
// 	testContexts := make([]*TestContext, members)
// 	peers := make([]orbittestutil.MockedPeer, members)
// 	for i := 0; i < members; i++ {
// 		testContexts[i] = &TestContext{}
// 		peers[i] = testContexts[i]
// 	}
//
// 	orbittestutil.CreateMonoDeviceMembers(ctx, t, peers, pathBase)
// 	orbittestutil.ConnectPeers(ctx, t, peers)
//
// 	g, invitation, err := group.New()
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	for i, peer := range testContexts {
// 		if peer.GroupContext, err = peer.GetDB().InitStoresForGroup(ctx, g, nil, nil, nil); err != nil {
// 			t.Fatal(err)
// 		}
//
// 		if i > 0 {
// 			orbitutil.WaitStoreReplication(ctx, time.Second*2, peer.GetMemberStore())
// 		}
//
// 		if _, err = peer.GetMemberStore().RedeemInvitation(ctx, peer.GetMemberDevices().MemberPrivKey, peer.GetMemberDevices().DevicesPrivKey[0], invitation); err != nil {
// 			t.Fatal(err)
// 		}
//
// 		invitation, err = group.NewInvitation(peer.GetMemberDevices().Member, g)
// 		if err != nil {
// 			t.Fatal(err)
// 		}
// 	for i, peer := range testContexts {
// 		ownMemberDevice := &group.OwnMemberDevice{
// 			Member: peer.GetMemberDevices().MemberPrivKey,
// 			Device: peer.GetMemberDevices().DevicesPrivKey[0],
// 			Secret: peer.GetMemberDevices().DevicesSecret[0],
// 		}
//
// 		peer.GroupContext = orbitutil.NewGroupContext(g, ownMemberDevice)
//
// 		if err = peer.GetDB().InitStoresForGroup(ctx, peer.GroupContext, nil); err != nil {
// 			t.Fatal(err)
// 		}
//
// 		if i > 0 {
// 			orbitutil.WaitStoreReplication(ctx, time.Second*2, peer.GetMemberStore())
// 		}
//
// 		if _, err = peer.GetMemberStore().RedeemInvitation(ctx, invitation); err != nil {
// 			t.Fatal(err)
// 		}
//
// 		invitation, err = group.NewInvitation(peer.GetMemberDevices().Member, g)
// 		if err != nil {
// 			t.Fatal(err)
// 		}
// 	}
//
// 	return testContexts
// }
//
// func TestSettingStore(t *testing.T) {
// 	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
// 	defer cancel()
//
// 	pathBase := "./orbitdb-test/tests/setting-store-test/"
// 	defer os.RemoveAll("./orbitdb-test/")
// 	contexts := setUpStores(t, ctx, 2, pathBase)
//
// 	// Get empty store
//
// 	settings, err := contexts[0].GetSettingStore().Get(contexts[0].GetMemberDevices().MemberPrivKey.GetPublic())
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	if len(settings) != 0 {
// 		t.Fatalf("expected 0 settings to be retrieved")
// 	}
//
// 	// Get empty store, other member
//
// 	settings, err = contexts[0].GetSettingStore().Get(contexts[1].GetMemberDevices().MemberPrivKey.GetPublic())
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	if len(settings) != 0 {
// 		t.Fatalf("expected 0 settings to be retrieved")
// 	}
//
// 	// Write on store
//
// 	_, err = contexts[0].GetSettingStore().Set(ctx, "foo", []byte("bar"))
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	// Read on store, self value
//
// 	settings, err = contexts[0].GetSettingStore().Get(contexts[0].GetMemberDevices().MemberPrivKey.GetPublic())
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	if len(settings) != 1 {
// 		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
// 	}
//
// 	if bytes.Compare(settings["foo"], []byte("bar")) != 0 {
// 		t.Fatalf("expected foo=bar settings to be set for user 0")
// 	}
//
// 	// Read on store, replicated value
//
// 	orbitutil.WaitStoreReplication(ctx, 5*time.Second, contexts[1].GetSettingStore())
//
// 	settings, err = contexts[1].GetSettingStore().Get(contexts[0].GetMemberDevices().MemberPrivKey.GetPublic())
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	if len(settings) != 1 {
// 		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
// 	}
//
// 	if bytes.Compare(settings["foo"], []byte("bar")) != 0 {
// 		t.Fatalf("expected foo=bar settings to be set for user 0")
// 	}
//
// 	// Authorized group write
//
// 	_, err = contexts[0].GetSettingStore().SetForGroup(ctx, "group-foo", []byte("group-bar"))
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	// Own group get
//
// 	settings, err = contexts[0].GetSettingStore().GetForGroup()
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	if len(settings) != 1 {
// 		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
// 	}
//
// 	if bytes.Compare(settings["group-foo"], []byte("group-bar")) != 0 {
// 		t.Fatalf("expected group-foo=group-bar settings to be set for group")
// 	}
//
// 	orbitutil.WaitStoreReplication(ctx, 5*time.Second, contexts[1].GetSettingStore())
//
// 	// Replicated group get
//
// 	settings, err = contexts[1].GetSettingStore().GetForGroup()
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	if len(settings) != 1 {
// 		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
// 	}
//
// 	if bytes.Compare(settings["group-foo"], []byte("group-bar")) != 0 {
// 		t.Fatalf("expected group-foo=group-bar settings to be set for group")
// 	}
//
// 	// Unauthorized group write
//
// 	_, err = contexts[1].GetSettingStore().SetForGroup(ctx, "group-foo2", []byte("group-bar2"))
// 	if err == nil {
// 		t.Fatalf("error should not be nil")
// 	}
//
// 	// Member setting overwrite
//
// 	_, err = contexts[0].GetSettingStore().Set(ctx, "foo", []byte("bar2"))
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	// Read on store, self overwritten value
//
// 	settings, err = contexts[0].GetSettingStore().Get(contexts[0].GetMemberDevices().MemberPrivKey.GetPublic())
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	if len(settings) != 1 {
// 		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
// 	}
//
// 	if bytes.Compare(settings["foo"], []byte("bar2")) != 0 {
// 		t.Fatalf("expected foo=bar2 settings to be set for user 0")
// 	}
//
// 	// Read on store, replicated overwritten value
//
// 	orbitutil.WaitStoreReplication(ctx, 5*time.Second, contexts[1].GetSettingStore())
//
// 	settings, err = contexts[1].GetSettingStore().Get(contexts[0].GetMemberDevices().MemberPrivKey.GetPublic())
// 	if err != nil {
// 		t.Fatal(err)
// 	}
//
// 	if len(settings) != 1 {
// 		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
// 	}
//
// 	if bytes.Compare(settings["foo"], []byte("bar2")) != 0 {
// 		t.Fatalf("expected foo=bar2 settings to be set for user 0")
// 	}
// }
