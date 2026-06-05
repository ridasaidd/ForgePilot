import { parseArgs } from "node:util";

const HELP_TEXT = `ForgePilot — Software production observatory for AI-assisted development.

Usage:
  pnpm fp -- [options]

Options:
  --help      Show this help message
  --version   Show version
  --init-db   Initialize the SQLite database and run pending migrations

Environment:
  ForgePilot follows an environment-centric architecture.
  Agents read state, perform work, persist results, and exit.
  The environment owns truth. Agents own no truth.
`;

async function main(): Promise<void> {
  const argv = process.argv.slice(2).filter((arg) => arg !== "--");
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      help: { type: "boolean", short: "h" },
      version: { type: "boolean", short: "v" },
      "init-db": { type: "boolean" },
    },
    strict: true,
    allowPositionals: true,
  });

  if (values.help) {
    console.log(HELP_TEXT);
    return;
  }

  if (values.version) {
    console.log("forgepilot v0.1.0");
    return;
  }

  if (values["init-db"] || positionals.includes("init-db")) {
    const { initAndMigrate } = await import("../db/migrate.js");
    initAndMigrate();
    const { closeDb } = await import("../db/client.js");
    closeDb();
    console.log("Database initialized successfully.");
    return;
  }

  console.log("ForgePilot CLI — use --help for usage information.");
}

main();
