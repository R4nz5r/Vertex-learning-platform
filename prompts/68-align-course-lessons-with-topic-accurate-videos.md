# Implementation Prompt 68: Align Course Lessons with Topic-Accurate Videos

## Goal
Resolve topic/video mismatches across the platform (such as "Turbo Drive and Page Transitions" playing "JavaScript Promises In 10 Minutes" or OOP lessons showing unrelated languages) by replacing lesson video URLs with verified, active, 100% topic-accurate YouTube videos for Ruby on Rails, Object-Oriented Programming, and audited catalog courses.

## Skills Read & References
- `sanity-best-practices` (`~/.claude/skills/sanity-best-practices/SKILL.md`) — Schema field validation, safe additive mutations, and referential integrity.
- `node_modules/next/dist/docs/` — Verification of client and server boundaries.
- `AGENTS.md`:
  - Section 1: "A learner types a plain language query and gets back ranked, clickable cards. Each card links straight to the exact second in a lesson's video where that topic is taught, and the video plays on the site itself."
  - Section 7: "Content is coherent from top to bottom. A module's lessons genuinely cover that module's topic. If the lessons are unrelated to their module, search returns junk."
  - Section 9: "The supported providers are YouTube, Vimeo, and Bunny, each shown as an embed on the lesson page."
  - Section 13: Checks to run (seed build, live sync, lint, type check).

## Code & Data Inspected
- Audit of `seed.ndjson` and live Sanity `production` dataset:
  - **Ruby on Rails Modern Web Development**:
    - Lesson 3.1 "Turbo Drive and Page Transitions" was mapped to `DHvZLI7Db8E` ("JavaScript Promises In 10 Minutes") — completely mismatched!
    - Lesson 3.2 "Turbo Frames for Scoped Component Updates" was mapped to `7CqJlxBYj-M` ("MERN Stack Tutorial") — mismatched!
    - Lesson 3.3 "Turbo Streams and Real-Time WebSocket Broadcasting" was mapped to `8aGhZQkoFbQ` ("Event loop in JS") — mismatched!
    - Lesson 4.1 "User Authentication and Authorization Patterns" returned HTTP 404!
    - Lesson 4.2 "ActiveJob and Background Workers" was mapped to `Oe421EPjeBE` ("Node.js and Express") — mismatched!
    - Lesson 4.3 "Production Deployment, Docker, and Performance Tuning" was mapped to `X48VuDVv0do` ("Kubernetes 4-hour tutorial") — mismatched!
    - Lesson 2.1 & 2.2 had generic SQL tutorials rather than Rails ActiveRecord migrations/associations.
  - **Object-Oriented Programming: Principles & Design Patterns**:
    - Lesson 1.3 "Polymorphism and Dynamic Dispatch" was mapped to `si-KFFOW2gw` ("Introduction to C Language") — mismatched!
    - Lesson 1.1 "Encapsulation" had general SOLID instead of an encapsulation/OOP breakdown.
    - Lesson 1.2 "Composition vs Inheritance" was missing a dedicated composition breakdown.
    - Several SOLID lessons were mapped to generic design patterns (Strategy, Decorator, Event Loop) rather than dedicated Single Responsibility, Open/Closed, Liskov Substitution, and Interface Segregation tutorials.
  - **Courses 11 to 20**:
    - Several lessons contain placeholder/generic technical videos rather than specific topic alignments (e.g., GraphQL having React history, Data Engineering having Next.js tutorial).

## Decisions & Assumptions
1. **Verified Topic-Accurate Video Library**:
   Every replaced video URL MUST be verified via YouTube's official oEmbed endpoint (`https://www.youtube.com/oembed?url=...&format=json`) to return `HTTP 200 OK` with an exact title matching the lesson's core learning objective.
2. **Ruby on Rails 100% Curated Alignment**:
   - Module 1 (MVC & Fundamentals): Typecraft Rails Setup (`oEDkhfsFMTg`), Full Rails MVC (`fmyvWz5TUWg`), ActionView & Helpers (`7-1HCWbu7iU`).
   - Module 2 (ActiveRecord): Strong Migrations (`jEitUhHS760`), Active Record Associations (`6DmWCnlaCcY`), N+1 Query & Performance Optimizations (`v2ehGvveYP0`).
   - Module 3 (Hotwire & Turbo): Update Page Without Refreshing Using Turbo (`lnSJ01chhG4`), Turbo Frame Pages in Ruby on Rails 7 (`iwZDoz_Ya2k`), Rails 7 Realtime Chat App With Turbo Streams (`UvTLumcEMgU`).
   - Module 4 (Auth, Jobs & Deploy): Devise Update Works With Turbo Now (`HX4XaDmAovM`), Sidekiq Background Jobs With Admin Dashboard (`fUVTtTVJ_QY`), Deploy Rails 7.1 With Postgres Using Docker Compose (`omv-qHu8FGU`).
3. **Object-Oriented Programming 100% Curated Alignment**:
   - Module 1 (Foundations): OOP Explained Simply: Classes, Inheritance, Polymorphism and Encapsulation (`lY-7OnKkW3c`), Composition Vs Inheritance - Why You Should Stop Using Inheritance (`nnwD5Lwwqdo`), Polymorphism in JavaScript: Method Overriding Explained (`DFdy7EOIpxw`).
   - Module 2 (SRP): SOLID - SRP - Single Responsibility Principle in 5 minutes (`Vl7bxEdgPB0`), Becoming a better developer by using the SOLID design principles (`rtmFCcjEgEw`).
   - Module 3 (OCP): Open/Closed Principle Explained - SOLID Design Principles (`-ptMtJAdj40`), Uncle Bob’s SOLID Principles Made Easy (`pTB30aXS77U`).
   - Module 4 (LSP): Liskov Substitution Principle Explained - SOLID Design Principles (`dJQMqNOC4Pc`), Liskov Substitution Principle Explained Practically (`-3UXq2krhyw`).
   - Module 5 (ISP): Interface Segregation Principle Explained - SOLID Design Principles (`JVWZR23B_iE`), SOLID Design Principles in PHP & Architecture (`4Zy8b2VKR2E`).
   - Module 6 (DIP): Dependency Inversion Principle Explained - SOLID Design Principles (`9oHY5TllWaU`), Dependency Injection Patterns & Containers (`tAuRQs_d9F8`).
   - Module 7 (Creational & Structural): Factory Method Pattern (`EcFVTgRHJLM`), Decorator & Structural Patterns (`GCraGHx6gso`).
   - Module 8 (Behavioral & Clean Architecture): Strategy Pattern (`v9ejT8FO-7I`), Observer Pattern – Design Patterns ep 2 (`_BpmfnqjgzQ`), 10 Design Patterns Explained in 10 Minutes (`tv-_1er1mWI`).
4. **Courses 11 to 20 Alignment**:
   Curate topic-matching videos for Go, AWS Serverless, Advanced CSS, Supabase, Rust, GraphQL, AI-Assisted SE, Testing, E-Commerce, and Data Engineering, removing generic cross-topic mismatches.
5. **Live Dataset Sync**:
   Execute `safeImport()` to update the live Sanity Cloud `production` dataset (`0p3a2wia`) with the verified URLs.

## Files to Touch
- `studio/scripts/seed/seed.ndjson` (MODIFY)
- `studio/scripts/seed/build-ndjson.mjs` (Run validation)
- `studio/scripts/seed/safe-import.mjs` (Run sync)

## Requirements
1. The video embed on `http://localhost:3000/lessons/ruby-on-rails-turbo-drive-and-navigation` must play the real Turbo Drive Rails tutorial ("Update Page Without Refreshing Using Turbo | Ruby On Rails 7 Tutorial") instead of "JavaScript Promises".
2. The video embed on `http://localhost:3000/lessons/oop-solid-dip-inversion-of-control` must play the real DIP tutorial ("Dependency Inversion Principle Explained - SOLID Design Principles").
3. All lessons across Ruby on Rails and OOP courses must play videos directly related to their declared subject matter.
4. All replaced video URLs must return `HTTP 200 OK` via YouTube oEmbed.
5. `npm --prefix studio run seed:build`, `npx tsc --noEmit`, and `npm run lint` must pass with 0 errors.

## Acceptance Criteria
- [ ] `/lessons/ruby-on-rails-turbo-drive-and-navigation` displays the Rails Turbo Drive tutorial video without 404 or topic mismatch.
- [ ] `/lessons/oop-solid-polymorphism-and-dynamic-dispatch` displays a true Polymorphism tutorial (replacing the previous C language video).
- [ ] Every lesson in the Ruby on Rails course (12 lessons) matches its specific Rails topic (Devise, Sidekiq, Turbo Frames, Turbo Streams, Docker Compose, Strong Migrations, ActiveRecord).
- [ ] Every lesson in the OOP course (18 lessons) matches its specific OOP/SOLID/Design Pattern topic.
- [ ] Live Sanity `production` dataset is updated and verified.
- [ ] `npx tsc --noEmit` exits with 0 errors.
- [ ] `npm run lint` exits with 0 errors.

## Checks to Run
- `npm --prefix studio run seed:build`
- Safe import sync to Sanity Cloud `production`
- `npx tsc --noEmit`
- `npm run lint`
- Live curl / fetch validation of video embeds on localhost:3000

## Exact Manual Test Steps
1. Navigate to `http://localhost:3000/lessons/ruby-on-rails-turbo-drive-and-navigation`.
2. Verify the YouTube embed player loads "Update Page Without Refreshing Using Turbo | Ruby On Rails 7 Tutorial".
3. Navigate to `http://localhost:3000/lessons/ruby-on-rails-turbo-frames-scoped-updates`.
4. Verify the YouTube embed player loads "Turbo Frame Pages in Ruby on Rails 7".
5. Navigate to `http://localhost:3000/lessons/ruby-on-rails-turbo-streams-websockets`.
6. Verify the YouTube embed player loads "Rails 7 Realtime Chat App With Turbo Streams".
7. Navigate to `http://localhost:3000/lessons/oop-solid-polymorphism-and-dynamic-dispatch` and verify it plays a real Polymorphism lesson.
