-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'EMPLOYEE', 'CUSTOMER')),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial mock users for testing
INSERT INTO users (id, name, role, email) VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Admin Budi', 'ADMIN', 'admin@laundry.com'),
  ('22222222-2222-2222-2222-222222222222', 'Karyawan Siti', 'EMPLOYEE', 'siti@laundry.com'),
  ('33333333-3333-3333-3333-333333333333', 'Karyawan Joko', 'EMPLOYEE', 'joko@laundry.com');

-- 2. Attendances Table
CREATE TABLE attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  UNIQUE(user_id, date)
);

-- 3. Orders Table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELIVERED')),
  total_price NUMERIC NOT NULL,
  weight NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Order Tasks Table
CREATE TABLE order_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL CHECK (step_name IN ('CUCI', 'SETRIKA', 'PACKING')),
  employee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Set up Row Level Security (RLS) - Optional but recommended
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE order_tasks ENABLE ROW LEVEL SECURITY;

-- Create policies (Example: allow all for now since it's an internal tool)
-- CREATE POLICY "Allow all operations" ON users FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON attendances FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON orders FOR ALL USING (true);
-- CREATE POLICY "Allow all operations" ON order_tasks FOR ALL USING (true);
