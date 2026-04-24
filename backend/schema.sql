-- StadiumIQ Database Schema & Seed Data
-- 50,000-capacity cricket stadium in India
-- Run this in Supabase SQL Editor

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: zones
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    section TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER NOT NULL DEFAULT 0,
    congestion_level TEXT NOT NULL DEFAULT 'low'
        CHECK (congestion_level IN ('low', 'moderate', 'high', 'critical')),
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: queues
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stall_name TEXT NOT NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    wait_minutes INTEGER NOT NULL DEFAULT 0,
    queue_length INTEGER NOT NULL DEFAULT 0,
    stall_type TEXT NOT NULL
        CHECK (stall_type IN ('food', 'beverage', 'restroom', 'merchandise', 'entry_gate')),
    is_open BOOLEAN NOT NULL DEFAULT true,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: alerts
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    alert_type TEXT NOT NULL
        CHECK (alert_type IN ('congestion', 'queue_overflow', 'entry_spike', 'weather')),
    priority TEXT NOT NULL DEFAULT 'low'
        CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    message TEXT NOT NULL,
    suggested_action TEXT,
    is_resolved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: agent_runs
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS agent_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    steps JSONB DEFAULT '[]'::jsonb,
    result JSONB DEFAULT '{}'::jsonb,
    duration_ms INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════════
-- TABLE: routes
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_zone TEXT NOT NULL,
    to_zone TEXT NOT NULL,
    path_description TEXT,
    estimated_walk_minutes INTEGER NOT NULL DEFAULT 5,
    congestion_avoided BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ═══════════════════════════════════════════════════════════════════
-- SEED DATA: 8 Zones (live match scenario)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO zones (name, section, capacity, current_occupancy, congestion_level, last_updated) VALUES
('North Stand Gate A',    'North', 8000, 7200, 'critical',  now() - interval '2 minutes'),
('North Stand Gate B',    'North', 7000, 5600, 'high',      now() - interval '1 minute'),
('South Stand',           'South', 7500, 3750, 'moderate',  now() - interval '3 minutes'),
('East Pavilion',         'East',  6000, 2400, 'low',       now() - interval '5 minutes'),
('West Pavilion',         'West',  5500, 4400, 'high',      now() - interval '1 minute'),
('VIP Box',               'VIP',   2000,  800, 'low',       now() - interval '4 minutes'),
('General Entry North',   'North', 5000, 4250, 'high',      now() - interval '2 minutes'),
('General Entry South',   'South', 5000, 2000, 'low',       now() - interval '6 minutes'),
('Food Court Central',    'Central', 4000, 3400, 'high',    now() - interval '1 minute');


-- ═══════════════════════════════════════════════════════════════════
-- SEED DATA: 20 Food/Beverage Stalls
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO queues (stall_name, zone_id, wait_minutes, queue_length, stall_type, is_open, last_updated)
SELECT
    q.stall_name,
    z.id,
    q.wait_minutes,
    q.queue_length,
    q.stall_type,
    q.is_open,
    now() - (random() * interval '5 minutes')
FROM (VALUES
    ('Biryani Express',        'Food Court Central', 18, 45, 'food',     true),
    ('Chaat Corner',           'Food Court Central', 12, 30, 'food',     true),
    ('Dosa Station',           'South Stand',        8,  20, 'food',     true),
    ('Pizza Point',            'East Pavilion',      5,  12, 'food',     true),
    ('Burger Hub',             'West Pavilion',      15, 38, 'food',     true),
    ('Samosa Stand',           'North Stand Gate A', 22, 55, 'food',     true),
    ('Noodle Bar',             'North Stand Gate B', 10, 25, 'food',     true),
    ('Ice Cream Parlour',      'East Pavilion',      4,  10, 'food',     true),
    ('Veg Thali Counter',      'South Stand',        7,  18, 'food',     true),
    ('Sandwich Express',       'VIP Box',            3,   8, 'food',     true),
    ('Chai Point North',       'North Stand Gate A', 14, 35, 'beverage', true),
    ('Chai Point South',       'South Stand',        6,  15, 'beverage', true),
    ('Cold Drinks Central',    'Food Court Central', 9,  22, 'beverage', true),
    ('Lassi Corner',           'West Pavilion',      11, 28, 'beverage', true),
    ('Fresh Juice Bar',        'East Pavilion',      3,   7, 'beverage', true),
    ('Water & Soda Station',   'General Entry North',2,   5, 'beverage', true),
    ('Coffee House',           'VIP Box',            4,  10, 'beverage', true),
    ('Nimbu Pani Stand',       'General Entry South',5,  13, 'beverage', true),
    ('Energy Drinks Kiosk',    'North Stand Gate B', 8,  20, 'beverage', true),
    ('Buttermilk Counter',     'Food Court Central', 6,  15, 'beverage', false)
) AS q(stall_name, zone_name, wait_minutes, queue_length, stall_type, is_open)
JOIN zones z ON z.name = q.zone_name;


-- ═══════════════════════════════════════════════════════════════════
-- SEED DATA: 8 Restroom Blocks
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO queues (stall_name, zone_id, wait_minutes, queue_length, stall_type, is_open, last_updated)
SELECT
    q.stall_name,
    z.id,
    q.wait_minutes,
    q.queue_length,
    'restroom',
    q.is_open,
    now() - (random() * interval '3 minutes')
FROM (VALUES
    ('Restrooms North A',      'North Stand Gate A', 15, 40, true),
    ('Restrooms North B',      'North Stand Gate B', 10, 25, true),
    ('Restrooms South',        'South Stand',         5, 12, true),
    ('Restrooms East',         'East Pavilion',       3,  8, true),
    ('Restrooms West',         'West Pavilion',      12, 30, true),
    ('Restrooms VIP',          'VIP Box',             2,  4, true),
    ('Restrooms Central',      'Food Court Central', 14, 35, true),
    ('Restrooms Entry South',  'General Entry South', 4, 10, true)
) AS q(stall_name, zone_name, wait_minutes, queue_length, is_open)
JOIN zones z ON z.name = q.zone_name;


-- ═══════════════════════════════════════════════════════════════════
-- SEED DATA: 6 Entry Gates
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO queues (stall_name, zone_id, wait_minutes, queue_length, stall_type, is_open, last_updated)
SELECT
    q.stall_name,
    z.id,
    q.wait_minutes,
    q.queue_length,
    'entry_gate',
    true,
    now() - (random() * interval '2 minutes')
FROM (VALUES
    ('Gate 1 - North Main',     'General Entry North', 20, 120),
    ('Gate 2 - North Side',     'North Stand Gate A',  18,  95),
    ('Gate 3 - East Entry',     'East Pavilion',        6,  30),
    ('Gate 4 - South Main',     'General Entry South',  4,  20),
    ('Gate 5 - West Entry',     'West Pavilion',       12,  60),
    ('Gate 6 - VIP Entrance',   'VIP Box',              2,   8)
) AS q(stall_name, zone_name, wait_minutes, queue_length)
JOIN zones z ON z.name = q.zone_name;


-- ═══════════════════════════════════════════════════════════════════
-- SEED DATA: Initial Alerts (live match scenario)
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO alerts (zone_id, alert_type, priority, message, suggested_action, is_resolved, created_at)
SELECT
    z.id,
    a.alert_type,
    a.priority,
    a.message,
    a.suggested_action,
    false,
    now() - (random() * interval '10 minutes')
FROM (VALUES
    ('North Stand Gate A', 'congestion',    'critical', 'North Stand Gate A at 90% capacity — risk of overcrowding',        'Open overflow Gate C4 immediately and redirect incoming fans to Gate 3 East'),
    ('North Stand Gate B', 'entry_spike',   'high',     'Entry spike detected at North Stand Gate B — 200 fans in last 5 min', 'Deploy 3 additional security staff to Gate B screening'),
    ('West Pavilion',      'congestion',    'high',     'West Pavilion reaching 80% capacity',                              'Announce on PA system: fans can use East Pavilion which is at 40% capacity'),
    ('Food Court Central', 'queue_overflow','high',     'Biryani Express queue exceeds 45 people — 22 min wait',            'Open auxiliary food counter near South Stand'),
    ('General Entry North','entry_spike',   'medium',   'Steady high volume at General Entry North',                        'Consider activating express entry lane for mobile ticket holders')
) AS a(zone_name, alert_type, priority, message, suggested_action)
JOIN zones z ON z.name = a.zone_name;


-- ═══════════════════════════════════════════════════════════════════
-- SEED DATA: Routes
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO routes (from_zone, to_zone, path_description, estimated_walk_minutes, congestion_avoided) VALUES
('Gate 4 - South Main', 'East Pavilion',    'Enter via Gate 4 → Turn right along South Concourse → Pass Restrooms South → Follow signs to East Pavilion Level 2', 6, true),
('Gate 3 - East Entry', 'North Stand Gate A','Enter via Gate 3 → Take the East-North corridor → Avoid Food Court Central (congested) → Use stairs at Section E4', 8, true),
('Gate 1 - North Main', 'VIP Box',           'Enter via Gate 1 → Proceed straight to Elevator Bank A → Take elevator to Level 3 → Follow VIP signage',            5, false),
('Gate 4 - South Main', 'Food Court Central','Enter via Gate 4 → Walk along the Southern Ring → Turn left at Junction S3 → Food Court is ahead on the right',      4, false),
('Gate 5 - West Entry', 'South Stand',       'Enter via Gate 5 → Follow West Concourse south → Pass West Pavilion → Descend to South Stand via Ramp W2',           7, true);
