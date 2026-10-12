-- FITAI initial relational schema. This file is NOT applied by the migration work in this workspace.
-- Review in a disposable Supabase project, test RLS, then seek explicit approval before production use.

begin;

create type public.age_band as enum (
  'under_13', '13_17', '18_29', '30_49', '50_69', '70_plus', 'prefer_not_to_say'
);
create type public.goal_type as enum (
  'lose_weight', 'maintain', 'gain_weight', 'improve_energy', 'habit_consistency', 'sports_performance'
);
create type public.food_normalization_status as enum (
  'search_only', 'raw_import', 'normalized', 'verified'
);
create type public.reference_value_type as enum ('EAR', 'RDA', 'AI', 'UL', 'DV', 'OTHER');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 80),
  age_band public.age_band,
  sex_for_reference text check (sex_for_reference in ('female', 'male', 'unspecified')),
  country_code char(2),
  preferred_unit_system text not null default 'metric' check (preferred_unit_system in ('metric', 'imperial')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- This trigger creates only a minimal profile row. Auth metadata is untrusted user input.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    left(coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), ''), 80)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Add minimal profile rows for accounts that predate this migration.
insert into public.profiles (id, display_name)
select id, left(coalesce(nullif(trim(raw_user_meta_data ->> 'display_name'), ''), ''), 80)
from auth.users
on conflict (id) do nothing;

create table public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  goal public.goal_type not null,
  target_weight_kg numeric(6,2) check (target_weight_kg is null or target_weight_kg between 20 and 500),
  weekly_change_kg numeric(4,2) check (weekly_change_kg is null or weekly_change_kg between 0 and 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create unique index user_goals_one_active_per_user
  on public.user_goals(user_id) where is_active;
create index user_goals_owner_created_idx on public.user_goals(user_id, created_at desc);
create trigger user_goals_set_updated_at
before update on public.user_goals
for each row execute function public.set_updated_at();

-- An age-unverified or under-18 account cannot activate a restrictive weight-loss goal.
create or replace function public.guard_minor_weight_loss_goal()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  account_age_band public.age_band;
begin
  if new.goal = 'lose_weight' and new.is_active then
    select age_band into account_age_band
    from public.profiles
    where id = new.user_id;

    if account_age_band is null
       or account_age_band in ('under_13', '13_17', 'prefer_not_to_say') then
      raise exception using
        errcode = '23514',
        message = 'A restrictive weight-loss goal requires a confirmed adult age band.';
    end if;
  end if;
  return new;
end;
$$;
create trigger user_goals_minor_safety
before insert or update of goal, is_active, user_id on public.user_goals
for each row execute function public.guard_minor_weight_loss_goal();

create or replace function public.deactivate_weight_loss_goal_for_minor()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.age_band is null
     or new.age_band in ('under_13', '13_17', 'prefer_not_to_say') then
    update public.user_goals
       set is_active = false
     where user_id = new.id
       and goal = 'lose_weight'
       and is_active = true;
  end if;
  return new;
end;
$$;
create trigger profiles_minor_safety
after insert or update of age_band on public.profiles
for each row execute function public.deactivate_weight_loss_goal_for_minor();

-- Atomic onboarding RPC. The authenticated subject is derived from auth.uid(); callers
-- cannot submit another user's ID. Age band is intentionally not directly writable.
create or replace function public.complete_onboarding(
  p_age_band public.age_band,
  p_goal public.goal_type,
  p_sex_for_reference text default null,
  p_country_code text default null,
  p_display_name text default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
begin
  if actor_id is null then
    raise exception using errcode = '42501', message = 'Authentication is required.';
  end if;
  if p_age_band is null or p_goal is null then
    raise exception using errcode = '22023', message = 'Age band and primary goal are required.';
  end if;
  if p_sex_for_reference is not null and p_sex_for_reference not in ('female', 'male', 'unspecified') then
    raise exception using errcode = '22023', message = 'Invalid reference category.';
  end if;
  if p_country_code is not null and p_country_code !~ '^[A-Z]{2}$' then
    raise exception using errcode = '22023', message = 'Country code must be two uppercase letters.';
  end if;
  if p_display_name is not null and char_length(trim(p_display_name)) > 80 then
    raise exception using errcode = '22023', message = 'Display name is too long.';
  end if;
  if p_goal = 'lose_weight'
     and p_age_band in ('under_13', '13_17', 'prefer_not_to_say') then
    raise exception using errcode = '23514', message = 'Weight-loss plans are not available for minors or unconfirmed age.';
  end if;

  update public.profiles
     set age_band = p_age_band,
         sex_for_reference = p_sex_for_reference,
         country_code = p_country_code,
         display_name = coalesce(nullif(trim(p_display_name), ''), display_name)
   where id = actor_id;
  if not found then
    raise exception using errcode = '23503', message = 'The account profile is unavailable.';
  end if;

  update public.user_goals
     set is_active = false
   where user_id = actor_id and is_active = true;

  insert into public.user_goals (user_id, goal, is_active)
  values (actor_id, p_goal, true);
end;
$$;

create table public.user_diet_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  preference_key text not null check (char_length(preference_key) between 1 and 80),
  preference_value text not null check (char_length(preference_value) between 1 and 120),
  created_at timestamptz not null default now(),
  unique (user_id, preference_key, preference_value)
);
create index user_diet_preferences_owner_idx on public.user_diet_preferences(user_id);

create table public.user_allergies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  allergen_key text not null check (char_length(allergen_key) between 1 and 100),
  display_name text not null check (char_length(display_name) between 1 and 120),
  is_self_reported boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, allergen_key)
);
create index user_allergies_owner_idx on public.user_allergies(user_id);

create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  weight_kg numeric(6,2) not null check (weight_kg between 20 and 500),
  recorded_at timestamptz not null default now(),
  note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now()
);
create index weight_entries_owner_recorded_idx on public.weight_entries(user_id, recorded_at desc);

create table public.hydration_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_date date not null,
  volume_ml numeric(8,1) not null check (volume_ml between 0 and 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, local_date)
);
create trigger hydration_logs_set_updated_at
before update on public.hydration_logs
for each row execute function public.set_updated_at();

-- Provider records are versioned by a stable source checksum. New source revisions should
-- create a new row so historical meal items can retain the facts that were used at log time.
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  source_system text not null check (source_system in ('USDA_FDC', 'OTHER_VERIFIED')),
  source_food_id text not null check (char_length(source_food_id) between 1 and 120),
  source_checksum text not null check (char_length(source_checksum) between 8 and 128),
  source_data_type text not null check (char_length(source_data_type) between 1 and 80),
  description text not null check (char_length(description) between 1 and 500),
  brand_owner text check (brand_owner is null or char_length(brand_owner) <= 250),
  food_category text check (food_category is null or char_length(food_category) <= 250),
  source_url text not null check (source_url like 'https://%'),
  source_license text not null default 'CC0-1.0',
  normalization_status public.food_normalization_status not null default 'search_only',
  source_payload jsonb not null default '{}'::jsonb check (jsonb_typeof(source_payload) = 'object'),
  fetched_at timestamptz not null default now(),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (source_system, source_food_id, source_checksum)
);
create index foods_description_search_idx on public.foods using gin (to_tsvector('simple', description));
create index foods_source_lookup_idx on public.foods(source_system, source_food_id);

create table public.nutrients (
  id text primary key check (char_length(id) between 1 and 80),
  source_system text not null,
  source_nutrient_id text not null,
  name text not null check (char_length(name) between 1 and 160),
  canonical_unit text not null check (char_length(canonical_unit) between 1 and 24),
  category text check (category is null or char_length(category) <= 80),
  unique (source_system, source_nutrient_id)
);

-- Rows contain only normalized per-100 g values. An absent row is unavailable, not zero.
create table public.food_nutrients (
  food_id uuid not null references public.foods(id) on delete cascade,
  nutrient_id text not null references public.nutrients(id) on delete restrict,
  amount_per_100g numeric(20,8) not null check (amount_per_100g >= 0),
  unit text not null check (char_length(unit) between 1 and 24),
  source_amount numeric(20,8) check (source_amount is null or source_amount >= 0),
  source_unit text check (source_unit is null or char_length(source_unit) <= 24),
  source_basis text not null check (char_length(source_basis) between 1 and 120),
  created_at timestamptz not null default now(),
  primary key (food_id, nutrient_id)
);

create table public.food_servings (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.foods(id) on delete cascade,
  source_portion_id text,
  description text not null check (char_length(description) between 1 and 250),
  gram_weight numeric(12,4) not null check (gram_weight > 0),
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (food_id, source_portion_id)
);
create index food_servings_food_idx on public.food_servings(food_id);

create table public.reference_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  jurisdiction_code text not null check (char_length(jurisdiction_code) between 2 and 30),
  title text not null check (char_length(title) between 1 and 300),
  source_url text not null check (source_url like 'https://%'),
  version_label text,
  published_on date,
  accessed_at timestamptz not null default now(),
  license_label text,
  created_at timestamptz not null default now()
);

create table public.nutrition_reference_targets (
  id uuid primary key default gen_random_uuid(),
  nutrient_id text not null references public.nutrients(id) on delete restrict,
  reference_source_id uuid not null references public.reference_sources(id) on delete restrict,
  age_band public.age_band not null,
  sex_for_reference text check (sex_for_reference in ('female', 'male', 'all', 'unspecified')),
  value_type public.reference_value_type not null,
  amount numeric(20,8) not null check (amount >= 0),
  unit text not null check (char_length(unit) between 1 and 24),
  life_stage text check (life_stage is null or char_length(life_stage) <= 100),
  valid_from date,
  valid_to date,
  created_at timestamptz not null default now(),
  check (valid_to is null or valid_from is null or valid_to >= valid_from)
);
create index nutrition_reference_targets_lookup_idx
  on public.nutrition_reference_targets(nutrient_id, age_band, sex_for_reference, value_type);

create table public.user_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  currency_code char(3) not null,
  period text not null check (period in ('daily', 'weekly', 'monthly')),
  country_code char(2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index user_budgets_one_current_per_user on public.user_budgets(user_id);
create trigger user_budgets_set_updated_at
before update on public.user_budgets
for each row execute function public.set_updated_at();

create table public.food_prices (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.foods(id) on delete cascade,
  source_name text not null check (char_length(source_name) between 1 and 160),
  source_url text check (source_url is null or source_url like 'https://%'),
  country_code char(2) not null,
  region_code text,
  price_amount numeric(12,2) not null check (price_amount > 0),
  currency_code char(3) not null,
  price_unit text not null check (price_unit in ('kg', '100g', 'item', 'package', 'serving')),
  observed_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index food_prices_food_region_date_idx on public.food_prices(food_id, country_code, region_code, observed_at desc);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  description text check (description is null or char_length(description) <= 1200),
  servings numeric(8,2) not null default 1 check (servings > 0 and servings <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create index recipes_owner_updated_idx on public.recipes(user_id, updated_at desc);
create trigger recipes_set_updated_at
before update on public.recipes
for each row execute function public.set_updated_at();

create table public.recipe_ingredients (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null,
  user_id uuid not null,
  food_id uuid not null references public.foods(id) on delete restrict,
  weight_grams numeric(12,4) not null check (weight_grams > 0),
  ingredient_order integer not null default 0 check (ingredient_order >= 0),
  created_at timestamptz not null default now(),
  foreign key (recipe_id, user_id) references public.recipes(id, user_id) on delete cascade,
  unique (recipe_id, ingredient_order)
);
create index recipe_ingredients_owner_idx on public.recipe_ingredients(user_id, recipe_id);

create table public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  logged_for date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
  note text check (note is null or char_length(note) <= 1200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);
create index meals_owner_date_idx on public.meals(user_id, logged_for desc, created_at desc);
create trigger meals_set_updated_at
before update on public.meals
for each row execute function public.set_updated_at();

-- Meal items persist quantities and source/recipe IDs only. Nutrient totals are recomputed
-- from these referenced records; client-supplied nutrient numbers are never stored here.
create table public.meal_items (
  id uuid primary key default gen_random_uuid(),
  meal_id uuid not null,
  user_id uuid not null,
  food_id uuid references public.foods(id) on delete restrict,
  recipe_id uuid,
  item_name_snapshot text not null check (char_length(item_name_snapshot) between 1 and 300),
  quantity_grams numeric(12,4) not null check (quantity_grams > 0),
  created_at timestamptz not null default now(),
  foreign key (meal_id, user_id) references public.meals(id, user_id) on delete cascade,
  foreign key (recipe_id, user_id) references public.recipes(id, user_id) on delete restrict,
  check (num_nonnulls(food_id, recipe_id) = 1)
);
create index meal_items_owner_meal_idx on public.meal_items(user_id, meal_id);

-- Once a recipe is used in a meal, its ingredients are frozen so historical calculations
-- keep their meaning. Users can create a replacement recipe for subsequent meals.
create or replace function public.prevent_used_recipe_update()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if exists (select 1 from public.meal_items where recipe_id = old.id) then
    raise exception using errcode = '23514', message = 'A logged recipe cannot be edited; create a replacement recipe.';
  end if;
  return new;
end;
$$;
create trigger recipes_freeze_after_use
before update on public.recipes
for each row execute function public.prevent_used_recipe_update();

create or replace function public.prevent_used_recipe_ingredient_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
declare
  is_used boolean;
begin
  if tg_op = 'UPDATE' then
    select exists (
      select 1 from public.meal_items where recipe_id in (old.recipe_id, new.recipe_id)
    ) into is_used;
  elsif tg_op = 'DELETE' then
    select exists (select 1 from public.meal_items where recipe_id = old.recipe_id) into is_used;
  else
    select exists (select 1 from public.meal_items where recipe_id = new.recipe_id) into is_used;
  end if;

  if is_used then
    raise exception using errcode = '23514', message = 'Ingredients of a logged recipe are immutable.';
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;
create trigger recipe_ingredients_freeze_after_use
before insert or update or delete on public.recipe_ingredients
for each row execute function public.prevent_used_recipe_ingredient_mutation();

create table public.recommendation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (char_length(provider) between 1 and 80),
  model_version text,
  request_kind text not null check (char_length(request_kind) between 1 and 80),
  constraints_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(constraints_snapshot) = 'object'),
  result_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(result_snapshot) = 'object'),
  status text not null check (status in ('succeeded', 'needs_confirmation', 'failed')),
  created_at timestamptz not null default now()
);
create index recommendation_runs_owner_created_idx on public.recommendation_runs(user_id, created_at desc);

-- RLS: profile and user data are isolated by the authenticated subject, never by a submitted owner ID.
alter table public.profiles enable row level security;
alter table public.user_goals enable row level security;
alter table public.user_diet_preferences enable row level security;
alter table public.user_allergies enable row level security;
alter table public.weight_entries enable row level security;
alter table public.hydration_logs enable row level security;
alter table public.foods enable row level security;
alter table public.nutrients enable row level security;
alter table public.food_nutrients enable row level security;
alter table public.food_servings enable row level security;
alter table public.reference_sources enable row level security;
alter table public.nutrition_reference_targets enable row level security;
alter table public.user_budgets enable row level security;
alter table public.food_prices enable row level security;
alter table public.recipes enable row level security;
alter table public.recipe_ingredients enable row level security;
alter table public.meals enable row level security;
alter table public.meal_items enable row level security;
alter table public.recommendation_runs enable row level security;

create policy profiles_owner_select on public.profiles
for select to authenticated using (id = (select auth.uid()));
create policy profiles_owner_update on public.profiles
for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy user_goals_owner_all on public.user_goals
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy user_diet_preferences_owner_all on public.user_diet_preferences
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy user_allergies_owner_all on public.user_allergies
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy weight_entries_owner_all on public.weight_entries
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy hydration_logs_owner_all on public.hydration_logs
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy user_budgets_owner_all on public.user_budgets
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy recipes_owner_all on public.recipes
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy recipe_ingredients_owner_all on public.recipe_ingredients
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy meals_owner_all on public.meals
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy meal_items_owner_all on public.meal_items
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy recommendation_runs_owner_all on public.recommendation_runs
for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Nutrition/provider/reference records are readable to signed-in users. Client writes are not granted.
create policy foods_authenticated_read on public.foods
for select to authenticated using (true);
create policy nutrients_authenticated_read on public.nutrients
for select to authenticated using (true);
create policy food_nutrients_authenticated_read on public.food_nutrients
for select to authenticated using (true);
create policy food_servings_authenticated_read on public.food_servings
for select to authenticated using (true);
create policy reference_sources_authenticated_read on public.reference_sources
for select to authenticated using (true);
create policy nutrition_targets_authenticated_read on public.nutrition_reference_targets
for select to authenticated using (true);
create policy food_prices_authenticated_read on public.food_prices
for select to authenticated using (true);

-- Keep browser-granted table permissions aligned with the policies above.
grant usage on schema public to authenticated;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, sex_for_reference, country_code, preferred_unit_system) on public.profiles to authenticated;
revoke all on function public.complete_onboarding(public.age_band, public.goal_type, text, text, text) from public;
revoke all on function public.complete_onboarding(public.age_band, public.goal_type, text, text, text) from anon;
grant execute on function public.complete_onboarding(public.age_band, public.goal_type, text, text, text) to authenticated;
grant select, insert, update, delete on public.user_goals to authenticated;
grant select, insert, update, delete on public.user_diet_preferences to authenticated;
grant select, insert, update, delete on public.user_allergies to authenticated;
grant select, insert, update, delete on public.weight_entries to authenticated;
grant select, insert, update, delete on public.hydration_logs to authenticated;
grant select on public.foods, public.nutrients, public.food_nutrients, public.food_servings,
  public.reference_sources, public.nutrition_reference_targets, public.food_prices to authenticated;
grant select, insert, update, delete on public.user_budgets to authenticated;
grant select, insert, update, delete on public.recipes, public.recipe_ingredients to authenticated;
grant select, insert, update, delete on public.meals, public.meal_items to authenticated;
grant select, insert, update, delete on public.recommendation_runs to authenticated;

commit;
