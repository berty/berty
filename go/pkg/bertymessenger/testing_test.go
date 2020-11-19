package bertymessenger

import (
	"context"
	"testing"

	"berty.tech/berty/v2/go/internal/testutil"
)

func testingNode(ctx context.Context, t *testing.T) (*TestingAccount, func()) {
	t.Helper()

	logger, loggerCleanup := testutil.Logger(t)
	ctx, ctxCancel := context.WithCancel(ctx)
	clients, protocols, infraCleanup := TestingInfra(ctx, t, 1, logger)
	node := NewTestingAccount(ctx, t, clients[0], protocols[0].Client, logger)
	cleanup := func() {
		node.Close()
		infraCleanup()
		ctxCancel()
		loggerCleanup()
	}
	return node, cleanup
}

const (
	// validContactBlob and validContactInternalBlob were generated thanks to `$ berty share-id`
	validContactBlob         = "oZBLF7M4A2Ff639sNSZB1qhygbEH89T1b9YcNBs81u8KQLMHTQp3Avx1dm9D2eW4omWQYN8D2kwcX8SWAoD3D7Eo8teNzjf"
	validContactInternalBlob = "NRRA6DJQB9USRIK1:IUUML2-IFBSG7CN6V7XM.UJD70:OI9S/1ZOT67.I443FR8TNRBODZSDLI4N5GSZNN5:V$R$JYYB-J9E854Y.H95CZQ/DVUTPDUJK9M0ARA*"

	// validGroupBlob and validGroupInternalBlob were generated thanks to `$ berty groupinit`
	validGroupBlob         = "5QdUv6Fn3uvfPy8tqZSw7SDVFvv7cnNHhpMHtGNVHBHMBJscFiWxBDd9wnphtqMMdmcmNQin64m44XkBVFWoSRKPboXszWi1dvjJz7Z3WmfJMJMHRHuyub553R9h2JFxCBZBvqZyvxtVrqu9gMRG5TRk1DduS9suYCXB3finDx7uxvx1fkuWtDzeqPMBw9g6Zx"
	validGroupInternalBlob = "EHJBK/TI1ETK.QPUU.E0ONINK9ZDPW2:.NB4DH/7C.HSXI..XUIS82*J7M1GJVWX/:O7X1C36NC5YAHW-D-M7A8NBAW3NPQP-Z8H.VPJOFVH1*0*FN202136-91H/UTNJXSNVFY7E$NV$A/O1BYIR:*H.N3JELJJE5V*U5Y319YNA9S1R.3TNO4-*0HW4W9*W/T3LOD3LW2JA/0:LZ31LH.4VKNWGN*LF-:89MXMYEN*R7*LSYR"
)
