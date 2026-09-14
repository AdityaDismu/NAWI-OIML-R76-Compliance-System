-- NAWI role/workflow additions. Safe to run after 004_app_completion.sql.
alter table if exists evaluations add column if not exists submitted_at timestamptz;
alter table if exists evaluations add column if not exists reviewed_at timestamptz;
alter table if exists evaluations add column if not exists approved_at timestamptz;
alter table if exists evaluations add column if not exists review_notes text;
alter table if exists evaluations add column if not exists rejection_reason text;
