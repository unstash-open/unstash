create schema if not exists security_ops authorization postgres;

revoke all on schema security_ops from public, anon, authenticated, service_role;

alter default privileges for role postgres in schema security_ops
  revoke all on tables from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema security_ops
  revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges for role postgres in schema security_ops
  revoke all on functions from public, anon, authenticated, service_role;

create table security_ops.audit_order_events (
  id bigint generated always as identity primary key,
  event_id text not null unique,
  event_type text not null,
  event_created_at timestamptz not null,
  polar_order_id text,
  polar_subscription_id text,
  polar_product_id uuid not null,
  plan text not null,
  status text not null default 'queued',
  payload jsonb not null,
  attempt_count integer not null default 0,
  received_at timestamptz not null default now(),
  processing_started_at timestamptz,
  completed_at timestamptz,
  retention_due_at timestamptz not null default (now() + interval '120 days'),
  last_error text,
  constraint audit_order_events_event_id_length check (char_length(event_id) between 1 and 512),
  constraint audit_order_events_event_type check (
    event_type in ('order.paid', 'order.refunded', 'subscription.past_due', 'subscription.revoked')
  ),
  constraint audit_order_events_plan check (plan in ('beta', 'standard', 'managed')),
  constraint audit_order_events_status check (
    status in ('queued', 'processing', 'completed', 'cancelled', 'failed')
  ),
  constraint audit_order_events_payload_object check (jsonb_typeof(payload) = 'object'),
  constraint audit_order_events_attempt_count check (attempt_count >= 0)
);

comment on table security_ops.audit_order_events is
  'Private, idempotent queue for signed Polar security-audit order events.';
comment on column security_ops.audit_order_events.payload is
  'Minimum order-fulfillment payload; may contain customer contact and repository metadata.';

create index audit_order_events_work_queue_idx
  on security_ops.audit_order_events (status, received_at)
  where status in ('queued', 'failed');

create index audit_order_events_retention_idx
  on security_ops.audit_order_events (retention_due_at);

revoke all on table security_ops.audit_order_events
  from public, anon, authenticated, service_role;
revoke all on sequence security_ops.audit_order_events_id_seq
  from public, anon, authenticated, service_role;
