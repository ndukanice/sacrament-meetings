import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export type User = {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
};

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const rows = await sql`
    SELECT id, name, email, password_hash AS "passwordHash"
    FROM users
    WHERE email = ${email.trim().toLowerCase()}`;
  return rows[0] as User | undefined;
}
