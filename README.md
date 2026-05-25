# Orbit Planner

A fixed-viewport daily planning cockpit for tasks, time blocks, markdown notes, subtasks, goals, and focus sessions.

## Local Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Cross-Device Sync

The app currently persists locally in the browser through Zustand storage. For laptop plus mobile sync, use Supabase:

1. Create a free Supabase project.
2. Run [supabase/schema.sql](/supabase/schema.sql) in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local`.
4. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
5. Install and wire `@supabase/supabase-js` for auth and task sync.

Supabase is the recommended first backend here because the free plan includes Postgres, Auth, API access, and row-level security, which are the pieces this app needs for private cross-device data.

## Checks

```bash
npm run lint
npm run build
```
