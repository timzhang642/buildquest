-- BuildQuest MVP Schema
-- Supabase Postgres

-- Parents table (the paying customer)
create table public.parents (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text not null,
  created_at timestamptz not null default now()
);

-- Teens table (linked to parent)
create table public.teens (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.parents(id) on delete cascade,
  name text not null,
  age int not null check (age >= 13),
  username text not null unique,
  password_hash text not null, -- managed by app, not Supabase Auth
  created_at timestamptz not null default now()
);

-- Quests (teen's chosen project)
create table public.quests (
  id uuid primary key default gen_random_uuid(),
  teen_id uuid not null references public.teens(id) on delete cascade,
  title text not null, -- teen's project title
  description text not null, -- what they want to build
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  target_ship_date timestamptz, -- 6 weeks from start
  completed_at timestamptz
);

-- Milestones within a quest
create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  title text not null,
  description text,
  sort_order int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Chat messages (AI coach conversation)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  quest_id uuid not null references public.quests(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Weekly email log
create table public.weekly_emails (
  id uuid primary key default gen_random_uuid(),
  teen_id uuid not null references public.teens(id) on delete cascade,
  parent_id uuid not null references public.parents(id) on delete cascade,
  subject text not null,
  body_html text not null,
  sent_at timestamptz not null default now()
);

-- Indexes
create index idx_teens_parent on public.teens(parent_id);
create index idx_quests_teen on public.quests(teen_id);
create index idx_milestones_quest on public.milestones(quest_id);
create index idx_messages_quest on public.messages(quest_id);
create index idx_messages_quest_created on public.messages(quest_id, created_at);
create index idx_weekly_emails_teen on public.weekly_emails(teen_id);

-- Row Level Security
alter table public.parents enable row level security;
alter table public.teens enable row level security;
alter table public.quests enable row level security;
alter table public.milestones enable row level security;
alter table public.messages enable row level security;
alter table public.weekly_emails enable row level security;

-- Parents can read their own row
create policy "Parents read own" on public.parents
  for select using (auth.uid() = id);

-- Parents can read their teens
create policy "Parents read own teens" on public.teens
  for select using (parent_id = auth.uid());

-- Parents can insert teens
create policy "Parents insert teens" on public.teens
  for insert with check (parent_id = auth.uid());

-- Service role bypasses RLS for API routes (teen auth is app-managed)
