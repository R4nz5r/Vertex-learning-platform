import Link from "next/link";
import { Bell } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface NavbarProps {
  links?: NavLink[];
  showActions?: boolean;
  className?: string;
}

const defaultLinks: NavLink[] = [
  { label: "Courses", href: "#", active: true },
  { label: "My Learning", href: "#" },
];

export function Navbar({
  links = defaultLinks,
  showActions = true,
  className,
}: NavbarProps) {
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "flex items-center justify-between h-14 px-6 bg-white border-b border-neutral-200",
        "shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {/* Left side: Logo & Nav Links */}
      <div className="flex items-center gap-8">
        <Link href="/" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm">
          <Logo size={22} />
        </Link>
        <ul className="flex items-center gap-6 list-none m-0 p-0">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                className={cn(
                  "text-body font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-sm",
                  link.active ? "text-primary-500" : "text-neutral-700 hover:text-neutral-900",
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Right side: Bell & User Avatar */}
      {showActions && (
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Notifications"
            className="p-1.5 text-neutral-700 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full cursor-pointer"
          >
            <Bell className="w-4 h-4 text-neutral-800" strokeWidth={1.75} aria-hidden="true" />
          </button>

          <div className="relative">
            <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-neutral-200 shadow-sm flex items-center justify-center bg-[#F3D7C8]">
              {/* Profile portrait avatar matching design */}
              <svg viewBox="0 0 36 36" fill="none" className="w-full h-full">
                <rect width="36" height="36" fill="#F8DFD4" />
                <path d="M9 14C9 8 13 4 18 4C23 4 27 8 27 14C27 18 26 24 26 28H10C10 24 9 18 9 14Z" fill="#3D2314" />
                <path d="M12 15C12 12 14.5 10 18 10C21.5 10 24 12 24 15C24 19 21.5 22 18 22C14.5 22 12 19 12 15Z" fill="#FBD0B8" />
                <path d="M12 12C14 10 17 9 20 10C23 11 25 14 25 14C25 14 23 12 20 12C17 12 14 14 13 16" stroke="#3D2314" strokeWidth="2" strokeLinecap="round" />
                <path d="M7 36C7 29 12 26 18 26C24 26 29 29 29 36" fill="#1E293B" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

