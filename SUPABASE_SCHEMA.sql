-- Tenant Management Platform - Supabase Schema
-- Run these migrations in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (managed by Supabase Auth, extended with profile)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('manager', 'owner', 'tenant')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workspaces (owned by managers)
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manager_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Units (in workspaces, can have multiple owners)
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  state TEXT CHECK (state IN ('vacant', 'incoming', 'occupied', 'notice', 'outgoing', 'turnover')) DEFAULT 'vacant',
  rent_amount DECIMAL(10, 2),
  square_feet INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(workspace_id, unit_number)
);

-- Unit Owners (junction table for multi-owner support)
CREATE TABLE unit_owners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ownership_percentage DECIMAL(5, 2) DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(unit_id, owner_id)
);

-- Leases/Tenancies
CREATE TABLE leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  monthly_rent DECIMAL(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'active', 'ended', 'terminated')) DEFAULT 'pending',
  signed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases (lifecycle cases for units)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  case_type TEXT CHECK (case_type IN ('move-in', 'move-out', 'maintenance', 'repair', 'incident', 'turnover')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'in-progress', 'completed', 'blocked')) DEFAULT 'pending',
  current_phase TEXT,
  progress_percentage INTEGER DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Case Checklists (dynamic tasks within cases)
CREATE TABLE case_checklist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  assigned_to UUID REFERENCES users(id),
  due_date DATE,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES units(id) ON DELETE CASCADE,
  lease_id UUID REFERENCES leases(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transitions (move-in/out timeline tracking)
CREATE TABLE transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  transition_type TEXT CHECK (transition_type IN ('move-in', 'move-out')) NOT NULL,
  scheduled_date DATE NOT NULL,
  actual_date DATE,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies

-- Users: users can see their own profile, managers can see their workspace users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Managers can view workspace users"
  ON users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT manager_id FROM workspaces
    )
  );

-- Workspaces: only managers can see/edit their own
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers can view own workspaces"
  ON workspaces FOR SELECT
  USING (manager_id = auth.uid());

CREATE POLICY "Managers can insert workspaces"
  ON workspaces FOR INSERT
  WITH CHECK (manager_id = auth.uid());

CREATE POLICY "Managers can update own workspaces"
  ON workspaces FOR UPDATE
  USING (manager_id = auth.uid())
  WITH CHECK (manager_id = auth.uid());

-- Units: manager sees all in workspace, owner sees own, tenant sees current
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see workspace units"
  ON units FOR SELECT
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE manager_id = auth.uid()
    )
  );

CREATE POLICY "Owners see own units"
  ON units FOR SELECT
  USING (
    id IN (
      SELECT unit_id FROM unit_owners WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenants see current unit"
  ON units FOR SELECT
  USING (
    id IN (
      SELECT unit_id FROM leases WHERE tenant_id = auth.uid() AND status = 'active'
    )
  );

-- Leases: manager of workspace, owners of unit, or the tenant
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manager can view unit leases"
  ON leases FOR SELECT
  USING (
    unit_id IN (
      SELECT id FROM units WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE manager_id = auth.uid()
      )
    )
  );

CREATE POLICY "Owner can view own unit leases"
  ON leases FOR SELECT
  USING (
    unit_id IN (
      SELECT unit_id FROM unit_owners WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Tenant can view own lease"
  ON leases FOR SELECT
  USING (tenant_id = auth.uid());

-- Cases: manager, owners, or involved parties
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manager can view unit cases"
  ON cases FOR SELECT
  USING (
    unit_id IN (
      SELECT id FROM units WHERE workspace_id IN (
        SELECT id FROM workspaces WHERE manager_id = auth.uid()
      )
    )
  );

CREATE POLICY "Owner can view own unit cases"
  ON cases FOR SELECT
  USING (
    unit_id IN (
      SELECT unit_id FROM unit_owners WHERE owner_id = auth.uid()
    )
  );

-- Documents: same as cases
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Manager can view documents"
  ON documents FOR SELECT
  USING (
    uploaded_by = auth.uid() OR
    case_id IN (
      SELECT id FROM cases WHERE unit_id IN (
        SELECT id FROM units WHERE workspace_id IN (
          SELECT id FROM workspaces WHERE manager_id = auth.uid()
        )
      )
    )
  );

-- Activity Log: users see own actions
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own activity"
  ON activity_log FOR SELECT
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX idx_workspaces_manager ON workspaces(manager_id);
CREATE INDEX idx_units_workspace ON units(workspace_id);
CREATE INDEX idx_unit_owners_unit ON unit_owners(unit_id);
CREATE INDEX idx_unit_owners_owner ON unit_owners(owner_id);
CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_cases_unit ON cases(unit_id);
CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_documents_unit ON documents(unit_id);
CREATE INDEX idx_activity_user ON activity_log(user_id);
CREATE INDEX idx_activity_created ON activity_log(created_at DESC);
