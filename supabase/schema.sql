create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  notes text,
  status text not null default 'backlog'
    check (status in ('backlog', 'scheduled', 'completed')),
  task_date date not null,
  scheduled_time timestamptz,
  duration integer not null default 30 check (duration > 0),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'critical')),
  energy text not null default 'medium'
    check (energy in ('light', 'medium', 'deep')),
  tags text[] not null default '{}',
  subtasks jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists tasks_user_date_idx on public.tasks (user_id, task_date);
create index if not exists tasks_user_updated_idx on public.tasks (user_id, updated_at desc);

alter table public.tasks enable row level security;

create policy "Users can read their own tasks"
on public.tasks for select
using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
on public.tasks for insert
with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
on public.tasks for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
on public.tasks for delete
using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();
