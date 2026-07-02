# FP-021 Source Evidence

Bridge commit inspected: `3a16d68`

## src/tool-registrations/recent-tools.ts:300-345

```ts
300:       },
301:       outputSchema: ForgePilotReadOpenCodeWorkerTelemetryOutputSchema,
302:       annotations: {
303:         readOnlyHint: true,
304:         destructiveHint: false,
305:         idempotentHint: true,
306:         openWorldHint: false
307:       }
308:     },
309:     async ({ packetId, workerId }) =>
310:       runLoggedTool("forgepilot_read_opencode_worker_telemetry", async () => {
311:         const result = await readOpenCodeWorkerTelemetry(packetId, workerId);
312:         return structuredJsonResult(result as unknown as Record<string, unknown>);
313:       })
314:   );
315: 
316:   mcpServer.registerTool(
317:     "forgepilot_start_opencode_worker",
318:     {
319:       description: "Start a fresh bounded OpenCode worker run and record worker lifecycle evidence under runs/<packetId>/opencode-workers/<workerId>/.",
320:       inputSchema: {
321:         packetId: z.string().describe("Known ForgePilot packet id, for example FP-MCP-153."),
322:         requestId: z.string().optional().describe("Optional request artifact id associated with this worker."),
323:         targetWorkspaceId: z.string().describe("Allowed workspace id: forgepilot or forgepilot-chatgpt-mcp."),
324:         promptFile: z.string().describe("Prompt file path inside ForgePilot or the MCP bridge workspace."),
325:         title: z.string().optional().describe("Optional OpenCode run title."),
326:         modelId: z.string().optional().describe("Optional OpenCode model id."),
327:         timeoutSeconds: z.number().optional().describe("Optional intended worker timeout metadata. V1 records it but does not enforce cancellation."),
328:         approval: z.string().describe("Must exactly equal START_OPENCODE_WORKER.")
329:       },
330:       outputSchema: ForgePilotStartOpenCodeWorkerOutputSchema,
331:       annotations: {
332:         readOnlyHint: false,
333:         destructiveHint: false,
334:         idempotentHint: false,
335:         openWorldHint: true
336:       }
337:     },
338:     async ({ packetId, requestId, targetWorkspaceId, promptFile, title, modelId, timeoutSeconds, approval }) =>
339:       runLoggedTool("forgepilot_start_opencode_worker", async () => {
340:         const result = await startOpenCodeWorker({ packetId, requestId, targetWorkspaceId, promptFile, title, modelId, timeoutSeconds, approval });
341:         return structuredJsonResult(result as unknown as Record<string, unknown>);
342:       })
343:   );
344: 
345:   mcpServer.registerTool(
```

## src/opencode-worker.ts:180-300

```ts
180: export async function startOpenCodeWorker(input: StartOpenCodeWorkerInput): Promise<WorkerStatus> {
181:   if (input.approval !== "START_OPENCODE_WORKER") {
182:     throw new Error(`Approval must be "START_OPENCODE_WORKER", got "${input.approval}"`);
183:   }
184:   if (!input.packetId || input.packetId.trim().length === 0) {
185:     throw new Error("packetId is required.");
186:   }
187: 
188:   const workspacePath = resolveWorkspace(input.targetWorkspaceId);
189:   const promptPath = resolvePromptPath(input.promptFile);
190:   const promptText = await assertPromptFile(promptPath);
191: 
192:   const activeWorker = await findActiveWorkerForPacket(input.packetId);
193:   if (activeWorker !== null) {
194:     throw new Error(`Active worker already exists for ${input.packetId}: ${activeWorker.workerId}`);
195:   }
196: 
197:   const workerId = createWorkerId(input.packetId);
198:   const dir = workerDir(input.packetId, workerId);
199:   await mkdir(dir, { recursive: true });
200: 
201:   const stdoutPath = path.join(dir, "stdout.log");
202:   const stderrPath = path.join(dir, "stderr.log");
203:   const statusPath = path.join(dir, "status.json");
204:   const startRequestPath = path.join(dir, "start-request.json");
205:   const pidPath = path.join(dir, "pid.txt");
206: 
207:   const args = ["run", "--dir", workspacePath, "--file", promptPath];
208:   if (input.title && input.title.trim().length > 0) {
209:     args.push("--title", input.title.trim());
210:   }
211:   if (input.modelId && input.modelId.trim().length > 0) {
212:     args.push("--model", input.modelId.trim());
213:   }
214:   args.push("Implement attached prompt.");
215: 
216:   const request = {
217:     packetId: input.packetId,
218:     requestId: input.requestId ?? null,
219:     targetWorkspaceId: input.targetWorkspaceId,
220:     workspacePath,
221:     promptFile: promptPath,
222:     promptFileSha256: sha256String(promptText),
223:     title: input.title ?? null,
224:     modelId: input.modelId ?? null,
225:     timeoutSeconds: input.timeoutSeconds ?? null,
226:     executable: OPENCODE_BIN,
227:     args,
228:     approvalSource: "CHATGPT_MCP_TOOL_APPROVAL",
229:     approvedToolName: "forgepilot_start_opencode_worker",
230:     requestedAt: new Date().toISOString(),
231:   };
232:   await writeFile(startRequestPath, JSON.stringify(request, null, 2) + "\n", "utf8");
233: 
234:   const stdoutFd = openSync(stdoutPath, "a");
235:   const stderrFd = openSync(stderrPath, "a");
236:   let child;
237:   try {
238:     child = spawn(OPENCODE_BIN, args, {
239:       cwd: workspacePath,
240:       env: sanitizeEnv(),
241:       detached: true,
242:       stdio: ["ignore", stdoutFd, stderrFd],
243:     });
244:   } finally {
245:     closeSync(stdoutFd);
246:     closeSync(stderrFd);
247:   }
248: 
249:   child.unref();
250: 
251:   const startedAt = new Date().toISOString();
252:   await writeFile(pidPath, `${child.pid}\n`, "utf8");
253: 
254:   const status: WorkerStatus = {
255:     workerId,
256:     packetId: input.packetId,
257:     requestId: input.requestId ?? null,
258:     modelId: input.modelId ?? null,
259:     targetWorkspaceId: input.targetWorkspaceId,
260:     workspacePath,
261:     promptFile: promptPath,
262:     promptFileSha256: sha256String(promptText),
263:     pid: child.pid ?? -1,
264:     status: "RUNNING",
265:     startedAt,
266:     updatedAt: startedAt,
267:     completedAt: null,
268:     timeoutSeconds: input.timeoutSeconds ?? null,
269:     stdoutPath,
270:     stderrPath,
271:     statusPath,
272:     startRequestPath,
273:     workerDir: dir,
274:     approvalSource: "CHATGPT_MCP_TOOL_APPROVAL",
275:     approvedToolName: "forgepilot_start_opencode_worker",
276:     command: { executable: OPENCODE_BIN, args },
277:     reasons: [],
278:   };
279: 
280:   child.on("exit", async (code, signal) => {
281:     try {
282:       const current = await readJsonFile<WorkerStatus>(statusPath);
283:       if (current.status !== "RUNNING") return;
284: 
285:       const completedAt = new Date().toISOString();
286:       current.status = code === 0 ? "SUCCEEDED" : "FAILED";
287:       current.updatedAt = completedAt;
288:       current.completedAt = completedAt;
289:       current.reasons = [
290:         ...current.reasons,
291:         code === 0 ? "PROCESS_EXITED_ZERO" : `PROCESS_EXITED_${code ?? "NULL"}`,
292:         ...(signal ? [`SIGNAL_${signal}`] : []),
293:       ];
294:       await writeStatus(current);
295:     } catch {
296:       // Status update is best-effort; status reads can still fall back to UNKNOWN_EXIT.
297:     }
298:   });
299: 
300:   child.on("error", async (error) => {
```

## src/opencode-worker.ts:60-160

```ts
60: 
61: function createWorkerId(packetId: string): string {
62:   const timestamp = new Date()
63:     .toISOString()
64:     .replaceAll("-", "")
65:     .replaceAll(":", "")
66:     .replace(".", "")
67:     .replace("Z", "Z");
68:   const shortHash = createHash("sha256")
69:     .update(`${packetId}-${timestamp}-${Math.random()}`)
70:     .digest("hex")
71:     .slice(0, 8);
72:   return `WORKER-${timestamp}-${shortHash}`;
73: }
74: 
75: function sha256String(input: string): string {
76:   return createHash("sha256").update(input).digest("hex");
77: }
78: 
79: function resolveWorkspace(targetWorkspaceId: string): string {
80:   const workspacePath = WORKSPACE_ALLOWLIST[targetWorkspaceId];
81:   if (!workspacePath) {
82:     throw new Error(`Unknown workspace "${targetWorkspaceId}". Allowed: ${Object.keys(WORKSPACE_ALLOWLIST).join(", ")}`);
83:   }
84:   return workspacePath;
85: }
86: 
87: function resolvePromptPath(promptFile: string): string {
88:   const baseRoots = [FORGEPILOT_REPO, BRIDGE_REPO];
89:   const resolved = path.isAbsolute(promptFile)
90:     ? path.resolve(promptFile)
91:     : path.resolve(FORGEPILOT_REPO, promptFile);
92: 
93:   const allowed = baseRoots.some((root) => resolved === root || resolved.startsWith(root + path.sep));
94:   if (!allowed) {
95:     throw new Error("Prompt file must be inside ForgePilot or the MCP bridge workspace.");
96:   }
97: 
98:   return resolved;
99: }
100: 
101: async function assertPromptFile(promptPath: string): Promise<string> {
102:   let fileStat;
103:   try {
104:     fileStat = await stat(promptPath);
105:   } catch {
106:     throw new Error(`Prompt file does not exist: ${promptPath}`);
107:   }
108: 
109:   if (!fileStat.isFile()) {
110:     throw new Error(`Prompt path is not a file: ${promptPath}`);
111:   }
112: 
113:   return await readFile(promptPath, "utf8");
114: }
115: 
116: function workerRoot(packetId: string): string {
117:   return path.join(RUNS_ROOT, packetId, "opencode-workers");
118: }
119: 
120: function workerDir(packetId: string, workerId: string): string {
121:   return path.join(workerRoot(packetId), workerId);
122: }
123: 
124: function sanitizeEnv(): Record<string, string> {
125:   return {
126:     PATH: `${NODE_TOOLING_BIN}:/usr/local/bin:/usr/bin:/bin`,
127:     HOME: "/home/ridasaidd",
128:     USER: "ridasaidd",
129:     SHELL: "/bin/bash",
130:     LANG: process.env.LANG ?? "C.UTF-8",
131:     TERM: process.env.TERM ?? "dumb",
132:   };
133: }
134: 
135: async function readJsonFile<T>(filePath: string): Promise<T> {
136:   return JSON.parse(await readFile(filePath, "utf8")) as T;
137: }
138: 
139: async function writeStatus(status: WorkerStatus): Promise<void> {
140:   await writeFile(status.statusPath, JSON.stringify(status, null, 2) + "\n", "utf8");
141: }
142: 
143: function processIsActive(pid: number): boolean {
144:   try {
145:     process.kill(pid, 0);
146:     return true;
147:   } catch {
148:     return false;
149:   }
150: }
151: 
152: async function findActiveWorkerForPacket(packetId: string): Promise<WorkerStatus | null> {
153:   let entries: string[];
154:   try {
155:     entries = await readdir(workerRoot(packetId));
156:   } catch {
157:     return null;
158:   }
159: 
160:   for (const entry of entries) {
```

