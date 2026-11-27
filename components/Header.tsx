import Link from "next/link";
import { NavLinks } from "./NavLinks";
import { UserMenu } from "./UserMenu";

export function Header() {
  const currentDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="border-b border-slate-700 bg-slate-900 text-white print:hidden">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div>
          <Link href="/" className="text-xl font-bold tracking-tight">
            Isolo Ward, Lagos-Ikotun Stake of Zion
          </Link>
          <p className="text-sm text-slate-300">{currentDate}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-4">
          <NavLinks />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
