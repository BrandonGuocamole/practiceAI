-- Run this query in the Supabase SQL editor to setup your tables  
-- Follow the convention of double-quoting column names so they support camelCase   
-- Full instructions at https://divjoy.com/docs/supabase

drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists on_auth_user_updated on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.handle_update_user();

/*** USERS ***/

create table public.users (
  -- UUID from auth.users
  "id" uuid references auth.users not null primary key,
  -- User data
  "email" text,
  "name" text,
  -- Validate data
  constraint "email" check (char_length("email") >= 3 AND char_length("email") <= 500),
  constraint "name" check (char_length("name") >= 1 AND char_length("name") <= 144)
);

-- Create security policies
alter table public.users enable row level security;
create policy "Can view their user data" on public.users for select using ( auth.uid() = "id" );
create policy "Can update their user data" on public.users for update using ( auth.uid() = "id" );

-- Create a trigger that automatically inserts a new user after signup with Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users ("id", "email", "name")
  values (
    new."id",
    new."email",
    coalesce(new."raw_user_meta_data"->>'full_name', split_part(new."email", '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger on_auth_user_updated
  after update of "email" on auth.users
  for each row execute procedure public.handle_update_user();
-- Create a trigger that automatically updates a user when their email is changed in Supabase Auth
create or replace function public.handle_update_user() 
returns trigger as $$
begin
  update public.users
  set "email" = new."email"
  where "id" = new."id";
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_updated
  after update of "email" on auth.users
  for each row execute procedure public.handle_update_user();

/*** CUSTOMERS ***/

create table public.customers (
  -- UUID from public.users
  "id" uuid references public.users not null primary key,
  -- Stripe data
  "stripeCustomerId" text,
  "stripeSubscriptionId" text,
  "stripePriceId" text,
  "stripeSubscriptionStatus" text
);

-- Create security policies
alter table public.customers enable row level security;
create policy "Can view their own customer data" on customers for select using (auth.uid() = "id");

/*** ITEMS ***/

create table public.items (
  -- Auto-generated UUID
  "id" uuid primary key default uuid_generate_v4(),
  -- UUID from public.users
  "owner" uuid references public.users not null,
  -- Item data
  "name" text,
  "featured" boolean,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
  -- Validate data
  constraint name check (char_length("name") >= 1 AND char_length("name") <= 144)
);


/*** CLASSES ***/

create table public.classes (
  "id" uuid primary key default uuid_generate_v4(),
  "owner" uuid references public.users not null,
  "name" text,
  "description" text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint "name" check (char_length("name") >= 1 AND char_length("name") <= 144)
);

/*** DOCUMENTS ***/

create table public.documents (
  "id" uuid primary key default uuid_generate_v4(),
  "classId" uuid references public.classes not null,
  "title" text,
  "filePath" text,
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint "title" check (char_length("title") >= 1 AND char_length("title") <= 144)
);

-- Create security policies
alter table public.items enable row level security;
create policy "Can read items they own" on public.items for select using ( auth.uid() = "owner" );
create policy "Can insert items they own" on public.items for insert with check ( auth.uid() = "owner" );
create policy "Can update items they own" on public.items for update using ( auth.uid() = "owner" );
create policy "Can delete items they own" on public.items for delete using ( auth.uid() = "owner" );

alter table public.classes enable row level security;
create policy "Can read classes they own" on public.classes for select using ( auth.uid() = "owner" );
create policy "Can insert classes they own" on public.classes for insert with check ( auth.uid() = "owner" );
create policy "Can update classes they own" on public.classes for update using ( auth.uid() = "owner" );
create policy "Can delete classes they own" on public.classes for delete using ( auth.uid() = "owner" );

alter table public.documents enable row level security;
create policy "Can read documents they own" on public.documents for select using ( auth.uid() = (select "owner" from public.classes where "id" = "classId") );
create policy "Can insert documents they own" on public.documents for insert with check ( auth.uid() = (select "owner" from public.classes where "id" = "classId") );
create policy "Can update documents they own" on public.documents for update using ( auth.uid() = (select "owner" from public.classes where "id" = "classId") );
create policy "Can delete documents they own" on public.documents for delete using ( auth.uid() = (select "owner" from public.classes where "id" = "classId") );