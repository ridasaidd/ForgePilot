# FP-MCP-149 OpenCode Process Inventory

Captured at: `2026-07-01T18:39:46.080900+00:00`

## Process Summary

- pid: `367970`
  - cmdline: `opencode serve --hostname 0.0.0.0 --port 4096`
  - exe: `/home/ridasaidd/.nvm/versions/node/v24.4.1/lib/node_modules/opencode-ai/bin/opencode.exe`
  - cwd: `/home/ridasaidd`
- pid: `728342`
  - cmdline: `/home/ridasaidd/.nvm/versions/node/v24.4.1/bin/node /home/ridasaidd/forgepilot-chatgpt-mcp/dist/server.js`
  - exe: `/home/ridasaidd/.nvm/versions/node/v24.4.1/bin/node`
  - cwd: `/home/ridasaidd/forgepilot-chatgpt-mcp`

## Listener Summary

```text
LISTEN 0      511                     127.0.0.1:8791       0.0.0.0:*    users:(("MainThread",pid=710619,fd=21))    
```
```text
LISTEN 0      511                       0.0.0.0:8787       0.0.0.0:*    users:(("MainThread",pid=728342,fd=21))    
```
```text
LISTEN 0      512                       0.0.0.0:4096       0.0.0.0:*    users:(("opencode",pid=367970,fd=18))      
```
```text
LISTEN 0      4096                 100.80.45.13:53744      0.0.0.0:*                                               
```
```text
LISTEN 0      4096                      0.0.0.0:6969       0.0.0.0:*                                               
```
```text
LISTEN 0      4096   [fd7a:115c:a1e0::701:2d92]:39842         [::]:*                                               
```
```text
LISTEN 0      4096                         [::]:6969          [::]:*                                               
```

## Observation

- Long-running OpenCode server remains running.
- MCP bridge remains running.
- No OpenCode worker run process was observed in the final process scan.
