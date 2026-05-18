create table tenants (
  id uuid primary key,
  name text not null,
  industry text,
  plan text not null,
  status text not null,
  autonomy_level text not null default 'review_required',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table users (
  id uuid primary key,
  tenant_id uuid references tenants(id),
  email text unique not null,
  role text not null,
  created_at timestamptz not null default now()
);

create table leads (
  id uuid primary key,
  tenant_id uuid references tenants(id),
  source text not null,
  source_record_id text,
  first_name text,
  last_name text,
  email text,
  email_status text,
  phone text,
  title text,
  company_name text,
  company_domain text,
  linkedin_url text,
  segment text,
  score numeric default 0,
  status text not null default 'new',
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(email, company_domain)
);

create table lead_source_usage (
  id uuid primary key,
  source text not null,
  endpoint text not null,
  credits_used numeric default 0,
  calls_used int default 0,
  minute_window text,
  hour_window text,
  day_window date,
  response_status int,
  created_at timestamptz not null default now()
);

create table campaigns (
  id uuid primary key,
  tenant_id uuid references tenants(id),
  name text not null,
  channel text not null,
  status text not null,
  hypothesis text,
  audience text,
  created_at timestamptz not null default now()
);

create table campaign_events (
  id uuid primary key,
  campaign_id uuid references campaigns(id),
  lead_id uuid references leads(id),
  event_type text not null,
  event_payload jsonb,
  created_at timestamptz not null default now()
);

create table opportunities (
  id uuid primary key,
  tenant_id uuid references tenants(id),
  lead_id uuid references leads(id),
  crm_deal_id text,
  stage text not null,
  expected_mrr numeric default 0,
  setup_fee numeric default 0,
  probability numeric default 0,
  close_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key,
  tenant_id uuid references tenants(id),
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text not null,
  mrr numeric not null default 0,
  performance_fee_percent numeric default 0,
  status text not null,
  created_at timestamptz not null default now()
);

create table claims (
  id uuid primary key,
  tenant_id uuid references tenants(id),
  external_claim_id text,
  payer text,
  patient_ref text,
  service_date date,
  billed_amount numeric,
  allowed_amount numeric,
  paid_amount numeric,
  denied_amount numeric,
  status text,
  denial_code text,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table recovery_workflows (
  id uuid primary key,
  tenant_id uuid references tenants(id),
  claim_id uuid references claims(id),
  workflow_type text not null,
  priority_score numeric default 0,
  estimated_recovery numeric default 0,
  status text not null default 'draft',
  requires_human_review boolean not null default true,
  created_at timestamptz not null default now()
);

create table appeal_drafts (
  id uuid primary key,
  recovery_workflow_id uuid references recovery_workflows(id),
  payer text,
  draft_text text not null,
  evidence_payload jsonb,
  compliance_status text not null,
  approved_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key,
  tenant_id uuid references tenants(id),
  actor_type text not null,
  actor_id text,
  action text not null,
  entity_type text,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table agent_runs (
  id uuid primary key,
  agent_name text not null,
  directive_name text,
  status text not null,
  input_payload jsonb,
  output_payload jsonb,
  error_message text,
  model_name text,
  model_cost numeric default 0,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
