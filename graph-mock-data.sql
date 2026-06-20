-- Mock graph data for multiple timelines
-- Clears existing rows and inserts new sample data.

begin;

delete from public.graph_edges;
delete from public.graph_nodes;
delete from public.meetings
where id in (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'a1b2c3d4-0002-0002-0002-000000000002',
  'a1b2c3d4-0003-0003-0003-000000000003',
  'a1b2c3d4-0004-0004-0004-000000000004',
  'a1b2c3d4-0005-0005-0005-000000000005',
  'a1b2c3d4-0006-0006-0006-000000000006'
);

insert into public.meetings (id, title, department, started_at)
values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Architecture Sync', 'eng', '2026-03-13 14:30:00+00'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Infra Decisions', 'eng', '2026-03-13 15:00:00+00'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Platform Direction', 'eng', '2026-03-13 16:00:00+00'),
  ('a1b2c3d4-0004-0004-0004-000000000004', 'Launch Readiness', 'mkt', '2026-03-13 17:00:00+00'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Zero Trust Review', 'fin', '2026-03-13 18:00:00+00'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'UX Refresh', 'mkt', '2026-03-13 19:00:00+00');

insert into public.graph_nodes (id, meeting_id, node_type, label, metadata, created_at)
values
  ('2b3b9d57-420a-4990-9d8a-e39aaf0b2a2d', 'a1b2c3d4-0001-0001-0001-000000000001', 'person',   'Tom Okafor', '{"role": "Engineer"}', '2026-03-13 14:37:19+00'),
  ('cf1a40a1-c65a-490d-a819-c2291b89e226', 'a1b2c3d4-0001-0001-0001-000000000001', 'person',   'Sarah Chen', '{"role": "Tech Lead"}', '2026-03-13 14:38:20+00'),
  ('b6070ded-5f7b-4e85-869f-80b3ffb07346', 'a1b2c3d4-0001-0001-0001-000000000001', 'project',  'GraphQL API', '{"priority": "high"}', '2026-03-13 14:39:20+00'),
  ('0d500f6c-e474-43e7-99ee-79dd8c82711d', 'a1b2c3d4-0001-0001-0001-000000000001', 'risk',     'GraphQL performance under load', '{"severity": "medium"}', '2026-03-13 14:40:20+00'),

  ('cf062415-121b-42e2-9c7b-4e5fec2c711c', 'a1b2c3d4-0002-0002-0002-000000000002', 'person',   'Marcus Webb', '{"role": "Infrastructure Lead"}', '2026-03-13 15:01:20+00'),
  ('cb803eba-f0b8-4a5d-8d80-abe29a9fa214', 'a1b2c3d4-0002-0002-0002-000000000002', 'decision', 'Migrate to MongoDB from PostgreSQL', '{"owner": "Marcus Webb", "timestamp": 120}', '2026-03-13 15:02:00+00'),
  ('77cffe51-fdcb-4273-9cc5-b77576abff3b', 'a1b2c3d4-0002-0002-0002-000000000002', 'decision', 'Adopt Firebase for push notifications', '{"owner": "Marcus Webb", "timestamp": 200}', '2026-03-13 15:05:00+00'),
  ('35ebd6af-1dbf-4cd1-a6a1-9e87cbfb359d', 'a1b2c3d4-0002-0002-0002-000000000002', 'risk',     'PostgreSQL to MongoDB migration downtime', '{"severity": "high"}', '2026-03-13 15:06:00+00'),

  ('2c6e9f9b-7301-4b6b-8c2a-0fe9f5a3e3a9', 'a1b2c3d4-0003-0003-0003-000000000003', 'person',   'Priya Nair', '{"role": "Product Lead"}', '2026-03-13 16:00:00+00'),
  ('6a84159f-1461-4c1f-b271-396a57b06310', 'a1b2c3d4-0003-0003-0003-000000000003', 'decision', 'Pilot GraphQL on dashboard service', '{"owner": "Tom Okafor", "timestamp": 180}', '2026-03-13 16:03:00+00'),
  ('a4afd68c-26cc-43d5-a352-628965290e7b', 'a1b2c3d4-0003-0003-0003-000000000003', 'decision', 'Adopt Radix UI + Tailwind as component lib', '{"owner": "Sarah Chen", "timestamp": 280}', '2026-03-13 16:06:00+00'),
  ('0a8b9ffb-3813-4a1c-9ad7-86b1d89a73a7', 'a1b2c3d4-0003-0003-0003-000000000003', 'risk',     'Parallel REST and GraphQL increases maintenance', '{"severity": "medium"}', '2026-03-13 16:08:00+00'),
  ('247879dc-ede2-46c5-ba11-82020b18aab4', 'a1b2c3d4-0003-0003-0003-000000000003', 'risk',     'GraphQL conflicts with existing REST decision', '{"severity": "high"}', '2026-03-13 16:10:00+00'),

  ('b0a6c984-0a8f-4d4b-b1c7-08b9b93d2e33', 'a1b2c3d4-0004-0004-0004-000000000004', 'person',   'Nina Patel', '{"role": "Program Manager"}', '2026-03-13 17:00:00+00'),
  ('f2c51f6e-8c2f-4e59-8b7c-8df1d2fa41e9', 'a1b2c3d4-0004-0004-0004-000000000004', 'action',   'Coordinate cross-team launch checklist', '{"owner": "Nina Patel", "timestamp": 60}', '2026-03-13 17:01:00+00'),
  ('0f7f4bda-8e84-4d88-9b6a-320fcb20d3d0', 'a1b2c3d4-0004-0004-0004-000000000004', 'project',  'Launch Readiness', '{"priority": "high"}', '2026-03-13 17:02:00+00'),
  ('4a0a3b2f-e1df-4f1d-b4ed-9d77c3a6b1a4', 'a1b2c3d4-0004-0004-0004-000000000004', 'risk',     'Unclear deployment ownership', '{"severity": "medium"}', '2026-03-13 17:03:00+00'),

  ('8f6d2c4b-9c1e-4a4d-8b52-4cfbe0c2a6f7', 'a1b2c3d4-0005-0005-0005-000000000005', 'person',   'Luis Romero', '{"role": "Security Lead"}', '2026-03-13 18:00:00+00'),
  ('caa6b25e-22f8-4f59-9f88-b05f12e7d144', 'a1b2c3d4-0005-0005-0005-000000000005', 'project',  'Zero Trust Rollout', '{"priority": "critical"}', '2026-03-13 18:01:00+00'),
  ('d7e0a2ad-0d2a-4b5b-8f5b-1b8e0e6f7f21', 'a1b2c3d4-0005-0005-0005-000000000005', 'action',   'Audit service account keys', '{"owner": "Luis Romero", "timestamp": 90}', '2026-03-13 18:02:00+00'),
  ('1fa4efc2-0a7b-4c17-a3b0-f70f8f9f6c15', 'a1b2c3d4-0005-0005-0005-000000000005', 'risk',     'Legacy auth bypass risk', '{"severity": "high"}', '2026-03-13 18:03:00+00'),

  ('5b2a1cc2-6e8d-4d7f-8c8d-7a96a1f2bcd1', 'a1b2c3d4-0006-0006-0006-000000000006', 'person',   'Amira Solis', '{"role": "Design Manager"}', '2026-03-13 19:00:00+00'),
  ('be7efc42-9b8c-48a0-a9e7-4c46b8a5c2a2', 'a1b2c3d4-0006-0006-0006-000000000006', 'project',  'UX Refresh', '{"priority": "medium"}', '2026-03-13 19:01:00+00'),
  ('0f59d5a3-4ff1-4f6a-80d4-2c7b4f6a2b11', 'a1b2c3d4-0006-0006-0006-000000000006', 'action',   'Prototype navigation revamp', '{"owner": "Amira Solis", "timestamp": 110}', '2026-03-13 19:02:00+00'),
  ('7a8a6c9f-1c52-4d7d-9e7a-ff5b7d0e4c2a', 'a1b2c3d4-0006-0006-0006-000000000006', 'risk',     'Fragmented design tokens', '{"severity": "medium"}', '2026-03-13 19:03:00+00');

insert into public.graph_edges (id, meeting_id, source, target, edge_type, created_at)
values
  ('e40f1e52-3df2-43b8-95d1-3c91c6d2a1a1', 'a1b2c3d4-0001-0001-0001-000000000001', '2b3b9d57-420a-4990-9d8a-e39aaf0b2a2d', 'b6070ded-5f7b-4e85-869f-80b3ffb07346', 'authored', '2026-03-13 14:39:30+00'),
  ('e74a64d3-1e0e-4e0f-b10a-73c2f1b8a2b2', 'a1b2c3d4-0001-0001-0001-000000000001', 'cf1a40a1-c65a-490d-a819-c2291b89e226', '2dad5052-9ea3-4327-83ac-a5531baf626c', 'approved', '2026-03-13 14:40:30+00'),
  ('e6c4d0b0-4b74-4a58-9e18-4af5f3f7f3c3', 'a1b2c3d4-0001-0001-0001-000000000001', 'b6070ded-5f7b-4e85-869f-80b3ffb07346', '0d500f6c-e474-43e7-99ee-79dd8c82711d', 'risk', '2026-03-13 14:41:30+00'),

  ('a2e2f1d2-29c3-4d2a-8f1c-2f9a2e3b4c4d', 'a1b2c3d4-0002-0002-0002-000000000002', 'cf062415-121b-42e2-9c7b-4e5fec2c711c', 'cb803eba-f0b8-4a5d-8d80-abe29a9fa214', 'authored', '2026-03-13 15:02:30+00'),
  ('b3c3d4e5-4f5a-4a6b-9c7d-8e9f0a1b2c3d', 'a1b2c3d4-0002-0002-0002-000000000002', 'cb803eba-f0b8-4a5d-8d80-abe29a9fa214', '35ebd6af-1dbf-4cd1-a6a1-9e87cbfb359d', 'risk', '2026-03-13 15:06:30+00'),
  ('c4d5e6f7-5a6b-4c7d-8e9f-0a1b2c3d4e5f', 'a1b2c3d4-0002-0002-0002-000000000002', 'cf062415-121b-42e2-9c7b-4e5fec2c711c', '77cffe51-fdcb-4273-9cc5-b77576abff3b', 'authored', '2026-03-13 15:05:30+00'),

  ('d5e6f7a8-6b7c-4d8e-9f0a-1b2c3d4e5f6a', 'a1b2c3d4-0003-0003-0003-000000000003', '2c6e9f9b-7301-4b6b-8c2a-0fe9f5a3e3a9', '6a84159f-1461-4c1f-b271-396a57b06310', 'authored', '2026-03-13 16:03:30+00'),
  ('e6f7a8b9-7c8d-4e9f-a0b1-2c3d4e5f6a7b', 'a1b2c3d4-0003-0003-0003-000000000003', '6a84159f-1461-4c1f-b271-396a57b06310', '247879dc-ede2-46c5-ba11-82020b18aab4', 'contradiction', '2026-03-13 16:10:30+00'),
  ('f7a8b9c0-8d9e-4f0a-b1c2-3d4e5f6a7b8c', 'a1b2c3d4-0003-0003-0003-000000000003', '6a84159f-1461-4c1f-b271-396a57b06310', '0a8b9ffb-3813-4a1c-9ad7-86b1d89a73a7', 'risk', '2026-03-13 16:08:30+00'),

  ('a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d', 'a1b2c3d4-0004-0004-0004-000000000004', 'b0a6c984-0a8f-4d4b-b1c7-08b9b93d2e33', 'f2c51f6e-8c2f-4e59-8b7c-8df1d2fa41e9', 'owner', '2026-03-13 17:01:30+00'),
  ('b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e', 'a1b2c3d4-0004-0004-0004-000000000004', 'f2c51f6e-8c2f-4e59-8b7c-8df1d2fa41e9', '0f7f4bda-8e84-4d88-9b6a-320fcb20d3d0', 'drives', '2026-03-13 17:02:30+00'),
  ('c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f', 'a1b2c3d4-0004-0004-0004-000000000004', '0f7f4bda-8e84-4d88-9b6a-320fcb20d3d0', '4a0a3b2f-e1df-4f1d-b4ed-9d77c3a6b1a4', 'risk', '2026-03-13 17:03:30+00'),

  ('d1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c', 'a1b2c3d4-0005-0005-0005-000000000005', '8f6d2c4b-9c1e-4a4d-8b52-4cfbe0c2a6f7', 'd7e0a2ad-0d2a-4b5b-8f5b-1b8e0e6f7f21', 'owner', '2026-03-13 18:02:30+00'),
  ('e2b3c4d5-6e7f-8a9b-0c1d-2e3f4a5b6c7d', 'a1b2c3d4-0005-0005-0005-000000000005', 'd7e0a2ad-0d2a-4b5b-8f5b-1b8e0e6f7f21', 'caa6b25e-22f8-4f59-9f88-b05f12e7d144', 'drives', '2026-03-13 18:03:30+00'),
  ('f3c4d5e6-7f8a-9b0c-1d2e-3f4a5b6c7d8e', 'a1b2c3d4-0005-0005-0005-000000000005', 'caa6b25e-22f8-4f59-9f88-b05f12e7d144', '1fa4efc2-0a7b-4c17-a3b0-f70f8f9f6c15', 'risk', '2026-03-13 18:04:30+00'),

  ('a4b5c6d7-8e9f-0a1b-2c3d-4e5f6a7b8c9d', 'a1b2c3d4-0006-0006-0006-000000000006', '5b2a1cc2-6e8d-4d7f-8c8d-7a96a1f2bcd1', '0f59d5a3-4ff1-4f6a-80d4-2c7b4f6a2b11', 'owner', '2026-03-13 19:02:30+00'),
  ('b5c6d7e8-9f0a-1b2c-3d4e-5f6a7b8c9d0e', 'a1b2c3d4-0006-0006-0006-000000000006', '0f59d5a3-4ff1-4f6a-80d4-2c7b4f6a2b11', 'be7efc42-9b8c-48a0-a9e7-4c46b8a5c2a2', 'drives', '2026-03-13 19:03:30+00'),
  ('c6d7e8f9-0a1b-2c3d-4e5f-6a7b8c9d0e1f', 'a1b2c3d4-0006-0006-0006-000000000006', 'be7efc42-9b8c-48a0-a9e7-4c46b8a5c2a2', '7a8a6c9f-1c52-4d7d-9e7a-ff5b7d0e4c2a', 'risk', '2026-03-13 19:04:30+00');

commit;
