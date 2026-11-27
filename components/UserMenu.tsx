import Link from "next/link";
import { auth } from "@/auth";
import { logout } from "@/lib/auth-actions";

// Right side of the header: the signed-in name and Sign out, or Sign in.
export async function UserMenu() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-slate-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-slate-300">
        Signed in as <span className="font-semibold text-white">{session.user.name}</span>
      </span>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-full border border-slate-500 px-3 py-2 font-medium text-white transition hover:bg-slate-700"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
