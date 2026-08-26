import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

interface NavbarProps {
  links?: NavLink[];
  className?: string;
}

const defaultLinks: NavLink[] = [
  { label: "Courses", href: "#", active: true },
  { label: "My Learning", href: "#" },
];

export function Navbar({ links = defaultLinks, className }: NavbarProps) {
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "flex items-center justify-between h-14 px-6 bg-white border-b border-neutral-200",
        "shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <Logo size={22} />
      <ul className="flex items-center gap-6 list-none">
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
    </nav>
  );
}
