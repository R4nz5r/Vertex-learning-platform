import Link from "next/link";
import { Bell } from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
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
  { label: "Courses", href: "/courses" },
  { label: "My Learning", href: "/my-learning" },
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
        "flex items-center justify-between h-14 px-6 border-b border-[#EBE4DC]",
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
              <Link
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                className={cn(
                  "text-body font-medium transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-sm",
                  link.active ? "text-primary-500" : "text-neutral-700 hover:text-neutral-900",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Right side: Auth Controls & Actions */}
      {showActions && (
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="text-xs font-medium text-neutral-700 hover:text-neutral-900 px-3 py-1.5 rounded-md hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 px-3.5 py-1.5 rounded-full shadow-sm transition-colors cursor-pointer"
                >
                  Sign up
                </button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Notifications"
                className="p-1.5 text-neutral-700 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-full cursor-pointer"
              >
                <Bell className="w-4 h-4 text-neutral-800" strokeWidth={1.75} aria-hidden="true" />
              </button>

              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-7 h-7 ring-1 ring-neutral-200 shadow-sm",
                  },
                }}
              />
            </div>
          </Show>
        </div>
      )}
    </nav>
  );
}

