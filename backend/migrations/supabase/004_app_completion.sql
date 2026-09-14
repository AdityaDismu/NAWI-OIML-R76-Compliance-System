-- NAWI application completion schema additions.
-- Safe to run after the existing project schema.

create extension if not exists pgcrypto;

-- The UI calculates progress from test_instances, so this column is optional.
-- It is added only for future reporting/dashboard use.
alter table if exists evaluations
  add column if not exists progress numeric(5,2);

create table if not exists evaluation_environments (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null unique references evaluations(id) on delete cascade,
  temperature numeric,
  humidity numeric,
  pressure numeric,
  location text,
  start_time timestamptz,
  end_time timestamptz,
  conditions_ok boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references evaluations(id) on delete cascade,
  report_number text,
  status text not null default 'GENERATED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reports_evaluation_id
  on reports(evaluation_id);

create table if not exists equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  equipment_type text not null,
  manufacturer text,
  model text,
  serial_number text,
  capacity numeric,
  accuracy text,
  resolution text,
  status text not null default 'ACTIVE',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists equipment_calibrations (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid not null references equipment(id) on delete cascade,
  calibration_date date,
  due_date date,
  certificate_number text,
  laboratory text,
  result text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists test_equipment (
  id uuid primary key default gen_random_uuid(),
  test_instance_id uuid not null references test_instances(id) on delete cascade,
  equipment_id uuid not null references equipment(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(test_instance_id, equipment_id)
);

create index if not exists idx_test_equipment_test
  on test_equipment(test_instance_id);

create table if not exists attachments (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references evaluations(id) on delete cascade,
  test_instance_id uuid references test_instances(id) on delete set null,
  file_name text not null,
  file_path text,
  content_type text,
  file_size bigint,
  description text,
  created_at timestamptz not null default now()
);

create index if not exists idx_attachments_evaluation
  on attachments(evaluation_id);

-- Canonical active test codes used by the current backend engine.
-- Existing rows are not replaced; missing rows are inserted.
do $$
declare
  item record;
begin
  for item in
    select * from (values
      ('WEIGHING_PERFORMANCE', 'Weighing Performance', 1),
      ('ECCENTRICITY', 'Eccentricity', 2),
      ('REPEATABILITY', 'Repeatability', 3),
      ('DISCRIMINATION', 'Discrimination', 4),
      ('ZERO_RETURN', 'Zero Return', 5),
      ('CREEP', 'Creep', 6),
      ('STABILITY_OF_EQUILIBRIUM', 'Stability of Equilibrium', 7),
      ('TARE', 'Tare', 8),
      ('WARM_UP', 'Warm-up', 9),
      ('TEMPERATURE', 'Temperature', 10),
      ('VOLTAGE_VARIATION', 'Voltage Variation', 11),
      ('TILTING', 'Tilting', 12),
      ('CONSTRUCTION_CHECKLIST', 'Construction Checklist', 13),
      ('DAMP_HEAT', 'Damp Heat', 14),
      ('EMC', 'Electromagnetic Compatibility', 15),
      ('SPAN_STABILITY', 'Span Stability', 16),
      ('ENDURANCE', 'Endurance', 17)
    ) as v(code, name, display_order)
  loop
    if not exists (select 1 from test_definitions where code = item.code) then
      insert into test_definitions(code, name, display_order, is_active)
      values (item.code, item.name, item.display_order, true);
    end if;
  end loop;
end $$;
