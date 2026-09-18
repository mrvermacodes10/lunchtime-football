# Lunchtime Football — Fantasy League

A full-stack fantasy football app for your school's lunchtime league, built with
Next.js, TypeScript, Tailwind CSS, and Prisma. Every player, price, point,
manager, squad, gameweek, match, and setting lives in a real database and is
editable from a password-protected `/admin` dashboard — nothing is hardcoded,
and there is **no built-in scoring formula**: you type in the points and
prices yourself, whenever you like.

This README assumes you've never deployed a Next.js project before. Follow it
top to bottom and copy/paste the commands exactly as written.

---

## 1. What you need before you start

- **Node.js 18 or newer** — download from https://nodejs.org (the "LTS" version).
  To check what you have, open a terminal and run:
  ```
  node -v
  ```
- A code editor (e.g. VS Code) to open the project folder — optional, but helpful.
- A free **GitHub** account and a free **Vercel** account, only needed later
  for deployment (Section 7).

---

## 2. Unzip and install

1. Unzip the file you were given. You'll get a folder called `fantasy-league`.
2. Open a terminal **inside that folder**. (In VS Code: File → Open Folder →
   pick `fantasy-league`, then Terminal → New Terminal.)
3. Install all dependencies:
   ```
   npm install
   ```
   This downloads Next.js, Prisma, and everything else the project needs. It
   also automatically generates the Prisma database client (via a
   `postinstall` script), so you don't need a separate step for that — but
   Section 3 below still explains what Prisma is doing, in case anything
   looks unfamiliar.

If `npm install` prints a warning about Prisma engines and fails, just run
`npx prisma generate` once by hand afterwards — see Section 3.

---

## 3. Set up the local database

For local development this project uses **SQLite** — a database that's just a
single file on your computer (`prisma/dev.db`), so there's nothing to install
or configure. It's already wired up: a file called `.env` in the project root
contains:

```
DATABASE_URL="file:./dev.db"
SESSION_SECRET="change-this-in-production-to-a-long-random-string"
```

That's enough to run everything locally. Now create the actual database
tables from the schema:

```
npm run db:push
```

This reads `prisma/schema.prisma` and creates `prisma/dev.db` with all the
tables (Player, Manager, Squad, Gameweek, Match, Setting, and so on).

If you ever change `prisma/schema.prisma` later, re-run `npm run db:push` to
apply the change to your database.

---

## 4. Seed the database (your players + the first admin account)

This loads Team 1 and Team 2 into the database, creates default league
settings, creates Gameweek 1, and creates your first admin login:

```
npm run db:seed
```

You'll see output like:

```
=================================================
Admin login  ->  username: "admin"   password: "changeme123"
=================================================
Seed complete.
```

**Write that password down and change it before anyone else can see your
screen** — see "Changing the admin password" below. The two players named
"Kabir" on Team 1 are seeded as two separate players on purpose (they show up
as two distinct rows everywhere, each with their own price and points — feel
free to rename them from the admin Players page to tell them apart, e.g.
"Kabir S" and "Kabir T").

### Changing the admin username/password before you seed

If you'd rather not use `admin` / `changeme123` at all, open `.env` and add:

```
SEED_ADMIN_USERNAME="your-username"
SEED_ADMIN_PASSWORD="a-stronger-password"
```

then run `npm run db:seed`. (If you already seeded once, run
`npm run db:reset` instead — see "Useful commands" below — since the seed
script won't overwrite an admin account that already exists.)

---

## 5. Run it locally

```
npm run dev
```

Then open your browser to:

- **http://localhost:3000** — the public site (pick a squad, table, players,
  match centre)
- **http://localhost:3000/admin** — the admin dashboard (log in with the
  username/password from Section 4)

Leave the terminal window open while you're using the site — closing it stops
the server. Press `Ctrl+C` in the terminal to stop it.

Try this to confirm everything really works end-to-end:
1. On the home page, type a name, pick a formation, click a few players until
   the squad is full, then **Save team**.
2. Go to `/admin` → **Players**, change that player's points, save.
3. Go back to the public **Table** or **Players** page and refresh — the new
   number appears immediately. No code was touched.

---

## 6. Everyday admin use (no code, ever)

Everything below is done from `/admin` after logging in:

| What you want to do | Where |
|---|---|
| Add/edit/delete a player, change their team, price, or points | Admin → Players |
| Add a new real team (e.g. "Team 3") | Admin → Players → "Add real team" |
| Add/edit/delete a fantasy manager, or jump to their squad | Admin → Managers |
| Manually override a manager's gameweek/total points, lock their squad | Admin → Squads |
| Create a new gameweek, set the current one, open/close transfers, lock squads | Admin → Gameweeks |
| Add/edit/delete a match, enter scores, change status | Admin → Matches |
| See the live league table | Admin → League table |
| Change league name, season, starting budget, formations, transfer window banner text | Admin → Settings |

Nothing here requires touching the source code or redeploying — every change
is saved straight to the database and the public site picks it up right away.

**On points and prices:** this app deliberately has **no built-in scoring
formula**. Goals, assists, clean sheets, saves and appearances are just
editable numbers on each player for your own record-keeping — the points and
price a player is worth in the game are whatever you type into "Total
points", "GW points" and "Price" on the Players page. Nothing calculates them
for you.

---

## 7. Deploying to Vercel (so the whole school can use it)

Locally you used SQLite (a single file). That **will not work in
production** — Vercel's servers don't keep files between requests, so a
SQLite file would reset constantly and managers would lose their squads. For
production you need a real **PostgreSQL** database instead. Don't worry —
it's a five-minute change, done in two places, no code logic to touch.

### 7.1 Push the project to GitHub

1. Go to https://github.com/new and create a new empty repository (any name,
   e.g. `lunchtime-fantasy`).
2. Back in your terminal, inside the `fantasy-league` folder:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```
   (Replace the URL with the one GitHub shows you after creating the repo.)

### 7.2 Switch the database from SQLite to PostgreSQL

Open `prisma/schema.prisma` and find this block near the top:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

Change `"sqlite"` to `"postgresql"`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

That's the **only code change** needed to move to production. Commit and
push it:

```
git add prisma/schema.prisma
git commit -m "Switch to PostgreSQL for production"
git push
```

### 7.3 Create a free PostgreSQL database

Easiest option — **Vercel Postgres** (created from inside Vercel, so it wires
itself up automatically):

1. Go to https://vercel.com and sign up/log in (you can sign in with your
   GitHub account).
2. Click **Add New… → Project**, then **Import** the GitHub repo you just
   pushed.
3. Before clicking Deploy, Vercel will show a project settings screen —
   that's fine, you'll add the database in the next step, either before or
   right after the first deploy.
4. In your new Vercel project, go to the **Storage** tab → **Create
   Database** → choose **Postgres** (powered by Neon) → follow the prompts to
   create it and connect it to this project.
5. Vercel will automatically add a `DATABASE_URL` (and a couple of related)
   environment variable to your project — you don't need to copy/paste it
   yourself.

Alternative: create a free database at https://neon.tech or
https://supabase.com and copy the connection string they give you — you'll
paste it manually as `DATABASE_URL` in Section 7.4 instead.

### 7.4 Set environment variables on Vercel

In your Vercel project: **Settings → Environment Variables**. Add:

| Name | Value |
|---|---|
| `DATABASE_URL` | Already set automatically if you used Vercel Postgres. Otherwise paste the connection string from Neon/Supabase (it looks like `postgresql://user:password@host/dbname?sslmode=require`). |
| `SESSION_SECRET` | Any long random string — this signs admin login sessions. Generate one by running `openssl rand -hex 32` in a terminal, or just mash your keyboard for 40+ random characters. |

You do **not** need to set `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` here
unless you want to re-seed in production with a specific login (see 7.6).

Click **Save**, then **Deploy** (or **Redeploy** if it already deployed once
before you added the variables).

### 7.5 Why the build "just works"

The `build` script in `package.json` is:

```
"build": "prisma generate && next build"
```

Vercel automatically runs `npm run build`, which regenerates the Prisma
client against whichever database `DATABASE_URL` points to (Postgres in
production, SQLite locally) before building the site. You don't need to
configure anything extra for this.

### 7.6 Set up the production database's tables and seed data

Your production Postgres database starts empty — you need to create its
tables and load your players into it, the same way you did locally in
Sections 3–4, just pointed at the production database instead.

The simplest way: run the commands **from your own computer**, temporarily
pointed at the production database.

1. Copy the production `DATABASE_URL` value from Vercel (Settings →
   Environment Variables → click to reveal it).
2. In your terminal, in the `fantasy-league` folder, run (macOS/Linux):
   ```
   DATABASE_URL="paste-the-production-url-here" npx prisma db push
   DATABASE_URL="paste-the-production-url-here" npx prisma db seed
   ```
   On Windows (PowerShell):
   ```
   $env:DATABASE_URL="paste-the-production-url-here"; npx prisma db push
   $env:DATABASE_URL="paste-the-production-url-here"; npx prisma db seed
   ```
3. Watch the terminal output for your production admin username/password,
   exactly like Section 4 — write it down.

You only need to do this once. After that, everything is managed from
`/admin` on your live site.

### 7.7 Visit your live site

Vercel gives you a URL like `https://your-project-name.vercel.app`. Your
public site is at the root, and your admin dashboard is at
`https://your-project-name.vercel.app/admin`.

From now on, any time you push a change to GitHub, Vercel automatically
rebuilds and redeploys — but for day-to-day league admin (prices, points,
managers, gameweeks, matches) you'll never need to do that again; it all
happens through `/admin` on the live site.

---

## 8. Useful commands (reference)

Run these from inside the `fantasy-league` folder.

| Command | What it does |
|---|---|
| `npm install` | Installs dependencies (run once, and again if you edit `package.json`) |
| `npm run dev` | Runs the site locally at http://localhost:3000 |
| `npm run build` | Builds the production version (what Vercel runs) |
| `npm run start` | Runs the already-built production version locally |
| `npm run db:push` | Creates/updates database tables from `prisma/schema.prisma` |
| `npm run db:seed` | Loads the starting players/settings/admin account (safe to re-run — it won't duplicate players or overwrite an existing admin) |
| `npm run db:reset` | ⚠️ Wipes the local database completely and reseeds from scratch |
| `npx prisma studio` | Opens a visual browser/editor for your database at http://localhost:5555 — handy for a quick look under the hood |

---

## 9. Project structure (for reference)

```
fantasy-league/
├── prisma/
│   ├── schema.prisma        # The entire data model (Player, Manager, Squad, Gameweek, Match, Setting, ...)
│   └── seed.ts               # Loads Team 1 / Team 2, default settings, first admin account
├── src/
│   ├── app/
│   │   ├── (site)/            # Public pages: squad builder, table, players, match centre
│   │   ├── admin/
│   │   │   ├── login/          # Admin login page (not password-protected, obviously)
│   │   │   └── (protected)/    # Everything else under /admin — requires login
│   │   └── actions/            # Server actions: all database reads/writes live here
│   ├── components/             # UI components (public site + admin/ subfolder)
│   ├── lib/                    # Prisma client, auth helpers, shared data helpers, match-status constants (enums.ts)
│   └── middleware.ts           # Redirects logged-out visitors away from /admin
├── .env                        # Local environment variables (SQLite + session secret)
├── .env.example                 # Template showing what production needs
└── package.json
```

---

## 10. What changed recently

- **Players no longer have a "position" at all.** No Goalkeeper / Defender /
  Midfielder / Forward — a player is just a player, with a name, a team, a
  price, and manually-entered stats. Formations (e.g. "2-2-2") are now
  purely a visual layout for the squad-builder pitch: picking "2-2-2" just
  arranges however many players that adds up to (6) across three rows —
  any player can go in any row. There's no position requirement anywhere
  in squad validation.
- **Admin login crash fixed** ("`formData.get is not a function`"): the
  login form uses React's `useFormState`, which always calls the action as
  `(previousState, formData)`. The server action had been written to accept
  only `(formData)`, so it was receiving the wrong value in that parameter.
  It's now `loginAction(prevState, formData)`, matching what `useFormState`
  actually calls.

## 11. Troubleshooting

- **"You defined the enum `Position`/`MatchStatus`. But the current
  connector does not support enums."**: this was a bug in an earlier version
  of this project — SQLite doesn't support native database enums. It's fixed
  in this version: there's no `Position` concept anywhere anymore, and
  `MatchStatus` is a plain text column validated in code via
  `src/lib/enums.ts`. If you still see this error, make sure
  `prisma/schema.prisma` has no `enum` blocks in it at all.
- **"Failed to fetch checksum" / Prisma engine download error during
  `npm install`**: this means your network blocked the download. Just run
  `npx prisma generate` again once your network allows it (this is unrelated
  to Vercel — Vercel's own servers can always reach it).
- **Admin login doesn't work**: make sure you ran `npm run db:seed` (locally)
  or the Section 7.6 seed step (in production), and that you're using the
  exact username/password printed in the terminal at that time.
- **Squad won't save**: check Admin → Gameweeks — a gameweek must exist, be
  marked "current", have transfers open, and not be locked.
- **Changes in `/admin` aren't showing on the public site**: refresh the
  page — the public site reads live from the database on every request, so
  there's no caching to clear.
- **Deployed site shows a database error**: double check `DATABASE_URL` is
  set correctly in Vercel's Environment Variables, and that you ran
  `prisma db push` against that same production database (Section 7.6).
