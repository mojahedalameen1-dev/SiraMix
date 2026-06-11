create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, theme, language)
  values (new.id, 'light', 'en')
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "Users can perform ALL operations on their own resumes" on public.resumes;
drop policy if exists "Users can view their own resumes" on public.resumes;
drop policy if exists "Users can insert their own resumes" on public.resumes;
drop policy if exists "Users can update their own resumes" on public.resumes;
drop policy if exists "Users can delete their own resumes" on public.resumes;

create policy "Users can view their own resumes"
on public.resumes
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own resumes"
on public.resumes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own resumes"
on public.resumes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own resumes"
on public.resumes
for delete
to authenticated
using ((select auth.uid()) = user_id);
