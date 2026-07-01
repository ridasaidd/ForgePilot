# FP-MCP-146 — ChatGPT Tool Schema Refresh Observation

## Summary

After FP-MCP-146 bridge implementation, the MCP bridge service was restarted successfully.

The rebuilt runtime file `dist/server.js` contains the new FP-MCP-146 fields:

    targetWorkspaceId
    controlRepoCommit
    targetWorkspaceCommit
    opencodeWorkingDirectory
    taskBundlePath
    FP-MCP-146

The service was restarted:

    forgepilot-chatgpt-mcp.service

and was listening on:

    0.0.0.0:8787

## Observation

The current ChatGPT conversation still exposed the old MCP tool schema for:

    forgepilot_start_remote_runner_request

The visible schema still lacked:

    targetWorkspaceId

## Interpretation

The bridge implementation is present in the running service, but ChatGPT's tool discovery layer for the current conversation appears stale.

## Classification

Bridge implementation: VERIFIED  
Bridge service reload: VERIFIED  
ChatGPT schema refresh: STALE_IN_CURRENT_SESSION  
Required next step: start a new ChatGPT session or reconnect/reload the MCP app connection
