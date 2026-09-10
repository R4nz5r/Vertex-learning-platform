"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import { Logo } from "@/components/brand/logo";
import { NotificationPopover } from "@/components/nav/notification-popover";
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
  { label: "Design System", href: "/design-system" },
];

export function Navbar({
  links = defaultLinks,
  showActions = true,
  className,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile menu automatically on route change
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
  }

  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        "relative flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8 border-b border-[#EBE4DC] bg-[#FAF7F2]",
        className,
      )}
    >
      {/* Left side: Logo & Desktop Navigation Links */}
      <div className="flex items-center gap-6 lg:gap-8">
        <Link
          href="/"
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded-sm shrink-0"
        >
          <Logo size={22} />
        </Link>
        
        {/* Desktop Links (Hidden on Mobile) */}
        <ul className="hidden md:flex items-center gap-6 list-none m-0 p-0">
          {links.map((link) => {
            const isActive = link.active ?? pathname === link.href;
            return (
              <li key={link.label}>
                <Link
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "text-[14px] font-medium transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-sm",
                    isActive ? "text-primary-500 font-semibold" : "text-neutral-700 hover:text-neutral-900",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right side: Auth Controls, Notifications & Mobile Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {showActions && (
          <>
            <Show when="signed-out">
              <div className="hidden sm:flex items-center gap-2">
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
              <div className="flex items-center gap-2 sm:gap-3">
                <NotificationPopover />

                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-7 h-7 ring-1 ring-neutral-200 shadow-sm",
                    },
                  }}
                />
              </div>
            </Show>
          </>
        )}

        {/* Mobile Hamburger Toggle Button (<md) */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden p-1.5 text-neutral-700 hover:text-neutral-900 rounded-md hover:bg-neutral-200/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5 text-neutral-900" strokeWidth={2} />
          ) : (
            <Menu className="w-5 h-5 text-neutral-900" strokeWidth={2} />
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu Panel (<md) */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-[#FAF7F2] border-b border-[#EBE4DC] px-4 py-3 shadow-[0_12px_24px_rgba(0,0,0,0.06)] animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-3">
          <ul className="flex flex-col gap-1 list-none m-0 p-0">
            {links.map((link) => {
              const isActive = link.active ?? pathname === link.href;
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-[8px] text-[13.5px] font-medium transition-colors",
                      isActive
                        ? "text-primary-600 bg-[#FFF1EB] font-semibold"
                        : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-200/40",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {showActions && (
            <Show when="signed-out">
              <div className="pt-2.5 border-t border-[#EBE4DC] flex items-center gap-2">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-xs font-medium text-neutral-800 bg-white border border-[#EBE4DC] py-2 rounded-md hover:bg-neutral-50 shadow-xs transition-colors cursor-pointer"
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-xs font-medium text-white bg-primary-500 hover:bg-primary-600 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
                  >
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </Show>
          )}
        </div>
      )}
    </nav>
  );
}
