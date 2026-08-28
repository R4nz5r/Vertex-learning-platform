# Implementation prompt: Add Clerk Authentication

## Goal

Set up Clerk authentication for Vertex using the Clerk CLI linked to Clerk application `app_3IOxfo5Kx64BoOKqwWQcFkhSlj5`. Integrate `@clerk/nextjs` with Next.js App Router, configure `<ClerkProvider>` inside `<body>`, configure the Next.js proxy/middleware matcher, and integrate user controls (`SignInButton`, `SignUpButton`, `Show`, `UserButton`) into the navbar navigation while maintaining clean visual styling and public browsing.

## Skills and docs read

- `AGENTS.md` (sections 1 What you are building, 2 How to work, 5 structure, 6 stack, 7 decisions, 12 things that will trip you up, 13 checks).
- `clerk` skill (`.agents/skills/clerk/SKILL.md`)
- `clerk-cli` skill (`.agents/skills/clerk-cli/SKILL.md`)
- `clerk-setup` skill (`.agents/skills/clerk-setup/SKILL.md`)
- `clerk-nextjs-patterns` skill (`.agents/skills/clerk-nextjs-patterns/SKILL.md`)
- `clerk-custom-ui` skill (`.agents/skills/clerk-custom-ui/SKILL.md`)

## Code inspected

- `package.json` — Next.js 16.3.3, React 19.2.8, Tailwind CSS v4.
- `app/layout.tsx` — Root layout with `Playfair_Display` and `Inter` fonts, currently plain `<html><body suppressHydrationWarning>{children}</body></html>`.
- `components/nav/navbar.tsx` — Main navigation header with logo, links ("Courses", "My Learning"), notifications bell, and static avatar placeholder.
- `app/page.tsx` — Vertex home page.

## Decisions and assumptions

1. **Clerk Application Target**:
   - Application ID: `app_3IOxfo5Kx64BoOKqwWQcFkhSlj5`.
   - Use Clerk CLI (`clerk init --app app_3IOxfo5Kx64BoOKqwWQcFkhSlj5`) to initialize the app and pull environment variables.

2. **Next.js & React 19 Integration**:
   - Install `@clerk/nextjs` (latest version supporting Next 16 / React 19).
   - Place `<ClerkProvider>` directly inside `<body>` in `app/layout.tsx` (not wrapping `<html>`).
   - Create/verify Next.js middleware / proxy file (`middleware.ts` or `proxy.ts`) with `clerkMiddleware()` and matcher:
     ```ts
     export const config = {
       matcher: [
         '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
         '/(api|trpc)(.*)',
         '/__clerk/:path*',
       ],
     }
     ```

3. **Public Browsing & Protected Routes**:
   - Per `AGENTS.md` section 7: "Keep browsing public and gate only what a feature marks as protected."
   - Home page, catalog, courses, and lessons are publicly viewable by default.

4. **Navbar Auth Controls**:
   - Update `components/nav/navbar.tsx` to include Clerk authentication controls:
     - When signed out: Render "Sign in" and "Sign up" action buttons matching Vertex design aesthetics.
     - When signed in: Render `<UserButton />` in place of the static avatar placeholder, along with the notification bell.
   - Use `<Show when="signed-out">` and `<Show when="signed-in">` or `<SignedIn>` / `<SignedOut>` from `@clerk/nextjs`.

5. **Security Considerations**:
   - Keep `CLERK_SECRET_KEY` exclusively on the server (in `.env.local`, never exposed to the client).
   - Only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is accessible in client components.
   - `.env.local` is gitignored. Ensure `.env.example` documents required keys without secrets.

## Files to create or change

```
app/layout.tsx                wrap body contents with <ClerkProvider>
middleware.ts                 create Clerk middleware with matcher including /__clerk/:path*
components/nav/navbar.tsx     integrate Clerk auth controls (SignInButton, SignUpButton, UserButton, Show/SignedIn/SignedOut)
.env.example                  ensure Clerk public and secret keys are documented as templates
package.json                  add @clerk/nextjs dependency
```

## Acceptance criteria

1. `@clerk/nextjs` is installed and properly configured in `app/layout.tsx` with `<ClerkProvider>`.
2. `middleware.ts` (or `proxy.ts`) is configured with `clerkMiddleware()` and contains `/__clerk/:path*` in `config.matcher`.
3. `components/nav/navbar.tsx` displays "Sign in" and "Sign up" buttons when signed out, and `<UserButton />` when signed in.
4. Existing layout and styles remain intact and visual aesthetics match the Vertex design.
5. `clerk doctor` passes successfully.
6. `npx tsc --noEmit`, `npm run lint`, and `npm run build` pass with zero errors.

## Checks to run

```bash
clerk doctor
npx tsc --noEmit
npm run lint
npm run build
```

## Manual test steps

1. Start development server (`npm run dev`).
2. Visit `http://localhost:3000` as a signed-out user; verify "Sign in" and "Sign up" buttons appear in the top navbar.
3. Click "Sign up" or "Sign in" to open the Clerk authentication modal/page and complete sign up / sign in.
4. Verify user avatar / `<UserButton />` displays in the navbar upon successful sign in.
5. Click `<UserButton />` to open the profile dropdown and verify account management options.
6. Sign out and verify the state returns to showing "Sign in" and "Sign up" buttons.
