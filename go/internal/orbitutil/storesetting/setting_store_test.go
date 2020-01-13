package storesetting_test

import (
	"bytes"
	"context"
	"testing"

	"berty.tech/berty/go/internal/orbitutil"
	"berty.tech/berty/go/internal/orbitutil/orbittestutil"
)

func TestSettingStore(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	peers, invitation := orbittestutil.CreatePeersWithGroup(ctx, t, "/tmp/settings_test", 2, 1, true)
	defer orbittestutil.DropPeers(t, peers)

	orbittestutil.InviteAllPeersToGroup(ctx, t, peers, invitation)

	// Get empty store
	settings, err := peers[0].GetGroupContext().GetSettingStore().Get(peers[0].GetGroupContext().GetMemberPrivKey().GetPublic())
	if err != nil {
		t.Fatal(err)
	}

	if len(settings) != 0 {
		t.Fatalf("expected 0 settings to be retrieved")
	}

	// Get empty store, other member

	settings, err = peers[0].GetGroupContext().GetSettingStore().Get(peers[1].GetGroupContext().GetMemberPrivKey().GetPublic())
	if err != nil {
		t.Fatal(err)
	}

	if len(settings) != 0 {
		t.Fatalf("expected 0 settings to be retrieved")
	}

	// Write on store

	_, err = peers[0].GetGroupContext().GetSettingStore().Set(ctx, "foo", []byte("bar"))
	if err != nil {
		t.Fatal(err)
	}

	// Read on store, self value

	settings, err = peers[0].GetGroupContext().GetSettingStore().Get(peers[0].GetGroupContext().GetMemberPrivKey().GetPublic())
	if err != nil {
		t.Fatal(err)
	}

	if len(settings) != 1 {
		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
	}

	if bytes.Compare(settings["foo"], []byte("bar")) != 0 {
		t.Fatalf("expected foo=bar settings to be set for user 0")
	}

	// Read on store, replicated value

	orbitutil.WaitStoreReplication(ctx, peers[1].GetGroupContext().GetSettingStore())

	settings, err = peers[1].GetGroupContext().GetSettingStore().Get(peers[0].GetGroupContext().GetMemberPrivKey().GetPublic())
	if err != nil {
		t.Fatal(err)
	}

	if len(settings) != 1 {
		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
	}

	if bytes.Compare(settings["foo"], []byte("bar")) != 0 {
		t.Fatalf("expected foo=bar settings to be set for user 0")
	}

	// Authorized group write

	_, err = peers[0].GetGroupContext().GetSettingStore().SetForGroup(ctx, "group-foo", []byte("group-bar"))
	if err != nil {
		t.Fatal(err)
	}

	// Own group get

	settings, err = peers[0].GetGroupContext().GetSettingStore().GetForGroup()
	if err != nil {
		t.Fatal(err)
	}

	if len(settings) != 1 {
		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
	}

	if bytes.Compare(settings["group-foo"], []byte("group-bar")) != 0 {
		t.Fatalf("expected group-foo=group-bar settings to be set for group")
	}

	orbitutil.WaitStoreReplication(ctx, peers[1].GetGroupContext().GetSettingStore())

	// Replicated group get

	settings, err = peers[1].GetGroupContext().GetSettingStore().GetForGroup()
	if err != nil {
		t.Fatal(err)
	}

	if len(settings) != 1 {
		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
	}

	if bytes.Compare(settings["group-foo"], []byte("group-bar")) != 0 {
		t.Fatalf("expected group-foo=group-bar settings to be set for group")
	}

	// Unauthorized group write

	_, err = peers[1].GetGroupContext().GetSettingStore().SetForGroup(ctx, "group-foo2", []byte("group-bar2"))
	if err == nil {
		t.Fatalf("error should not be nil")
	}

	// Member setting overwrite

	_, err = peers[0].GetGroupContext().GetSettingStore().Set(ctx, "foo", []byte("bar2"))
	if err != nil {
		t.Fatal(err)
	}

	// Read on store, self overwritten value

	settings, err = peers[0].GetGroupContext().GetSettingStore().Get(peers[0].GetGroupContext().GetMemberPrivKey().GetPublic())
	if err != nil {
		t.Fatal(err)
	}

	if len(settings) != 1 {
		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
	}

	if bytes.Compare(settings["foo"], []byte("bar2")) != 0 {
		t.Fatalf("expected foo=bar2 settings to be set for user 0")
	}

	// Read on store, replicated overwritten value

	orbitutil.WaitStoreReplication(ctx, peers[1].GetGroupContext().GetSettingStore())

	settings, err = peers[1].GetGroupContext().GetSettingStore().Get(peers[0].GetGroupContext().GetMemberPrivKey().GetPublic())
	if err != nil {
		t.Fatal(err)
	}

	if len(settings) != 1 {
		t.Fatalf("expected 1 value to be retrieved, got %d", len(settings))
	}

	if bytes.Compare(settings["foo"], []byte("bar2")) != 0 {
		t.Fatalf("expected foo=bar2 settings to be set for user 0")
	}
}
