import { parseArgs } from "node:util";

const HELP_TEXT = `ForgePilot — Software production observatory for AI-assisted development.

Usage:
  pnpm fp -- [options]

Options:
  --help      Show this help message
  --version   Show version

Environment:
  ForgePilot follows an environment-centric architecture.
  Agents read state, perform work, persist results, and exit.
  The environment owns truth. Agents own no truth.
`;

function main(): void {
  const argv = process.argv.slice(2).filter((arg) => arg !== "--");
  const { values } = parseArgs({
    args: argv,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help) {
    console.log(HELP_TEXT);
    return;
  }

  if (values.version) {
    console.log("forgepilot v0.1.0");
    return;
  }

  console.log("ForgePilot CLI — use --help for usage information.");
}

main();
