# FP-MCP-324 Local Bearer Token Support

## Observed Result

The MCP bridge local clients were patched to support a local bearer token variable suitable for OIDC mode.

Bridge commit:

72284ff Support local bearer token

## Reason

The MCP service is running with FORGEPILOT_AUTH_MODE=oidc. The previous local client behavior used the legacy MCP token variable and received Unauthorized from the MCP endpoint.

## Boundary

No token value was printed or committed.

## Verification

Both local client scripts passed syntax checks before commit.
