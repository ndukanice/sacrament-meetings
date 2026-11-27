// Creates (or updates the password of) a bishopric sign-in account.
//
//   node --env-file=.env.local scripts/create-user.mjs
//
// You type the name, email, and password here; only a bcrypt hash of the
// password is saved in the database.
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Run with --env-file=.env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const rl = createInterface({ input: stdin, output: stdout });

// Read a password without showing it: the terminal is switched to "raw"
// mode so each key arrives here, and we print * instead of the character.
function askHidden(question) {
  stdout.write(question);
  return new Promise((resolve) => {
    let answer = "";
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    stdin.resume();

    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          stdin.off("data", onData);
          stdin.setRawMode(false);
          stdin.pause();
          stdout.write("\n");
          resolve(answer);
          return;
        }
        if (char === "\u0003") {
          // Ctrl + C
          stdout.write("\n");
          process.exit(130);
        }
        if (char === "\u007f" || char === "\b") {
          // Backspace
          if (answer.length > 0) {
            answer = answer.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }
        answer += char;
        stdout.write("*");
      }
    };
    stdin.on("data", onData);
  });
}

const name = (await rl.question("Name (e.g. Bishop Eze): ")).trim();
const email = (await rl.question("Email: ")).trim().toLowerCase();
rl.close(); // hand the keyboard over to askHidden

if (!stdin.isTTY) {
  console.error("Run this in a terminal so the password can be typed privately.");
  process.exit(1);
}
const password = await askHidden("Password (at least 8 characters): ");
const confirm = await askHidden("Type the password again: ");

if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
  console.error("Please enter a name and a valid email.");
  process.exit(1);
}
if (password.length < 8 || password !== confirm) {
  console.error("Passwords must match and be at least 8 characters.");
  process.exit(1);
}

// Make sure the users table exists (same statement as db/users.sql).
const create = readFileSync(new URL("../db/users.sql", import.meta.url), "utf8")
  .replace(/--[^\n]*/g, "")
  .trim();
await sql.query(create);

const passwordHash = await bcrypt.hash(password, 10);
await sql`
  INSERT INTO users (name, email, password_hash)
  VALUES (${name}, ${email}, ${passwordHash})
  ON CONFLICT (email) DO UPDATE
    SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash`;

console.log(`Saved sign-in account for ${email}. You can now sign in at /login.`);
