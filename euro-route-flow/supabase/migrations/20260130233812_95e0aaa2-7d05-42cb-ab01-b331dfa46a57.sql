-- Create enum for delivery status
CREATE TYPE public.delivery_status AS ENUM ('en_attente', 'en_cours', 'livre');

-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'driver');

-- Create profiles table for user information
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create drivers table
CREATE TABLE public.drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_requests table
CREATE TABLE public.delivery_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Client information
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    -- Addresses
    pickup_address TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    -- Package details
    item_type TEXT NOT NULL,
    item_size TEXT,
    item_weight TEXT,
    -- Scheduling
    requested_date DATE NOT NULL,
    requested_time TEXT,
    -- Status and assignment
    status delivery_status NOT NULL DEFAULT 'en_attente',
    assigned_driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
    -- Notes
    client_notes TEXT,
    internal_notes TEXT,
    -- Tracking
    tracking_number TEXT UNIQUE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Function to check if user is staff (admin or staff)
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('admin', 'staff')
    )
$$;

-- Generate tracking number function
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.tracking_number := 'DLV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
    RETURN NEW;
END;
$$;

-- Create trigger for tracking number
CREATE TRIGGER set_tracking_number
    BEFORE INSERT ON public.delivery_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_tracking_number();

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON public.drivers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_requests_updated_at
    BEFORE UPDATE ON public.delivery_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_roles (only admins can manage)
CREATE POLICY "Users can view own role"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Staff can view all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

CREATE POLICY "Admins can manage roles"
    ON public.user_roles FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for drivers (staff can manage)
CREATE POLICY "Staff can view drivers"
    ON public.drivers FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

CREATE POLICY "Drivers can view own record"
    ON public.drivers FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Staff can manage drivers"
    ON public.drivers FOR ALL
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- RLS Policies for delivery_requests
-- Anyone can insert (public form submission)
CREATE POLICY "Anyone can create delivery request"
    ON public.delivery_requests FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Staff can view all requests
CREATE POLICY "Staff can view all requests"
    ON public.delivery_requests FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Drivers can view their assigned requests
CREATE POLICY "Drivers can view assigned requests"
    ON public.delivery_requests FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.drivers
            WHERE drivers.user_id = auth.uid()
            AND drivers.id = delivery_requests.assigned_driver_id
        )
    );

-- Staff can update requests
CREATE POLICY "Staff can update requests"
    ON public.delivery_requests FOR UPDATE
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Drivers can update their assigned requests
CREATE POLICY "Drivers can update assigned requests"
    ON public.delivery_requests FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.drivers
            WHERE drivers.user_id = auth.uid()
            AND drivers.id = delivery_requests.assigned_driver_id
        )
    );

-- Staff can delete requests
CREATE POLICY "Staff can delete requests"
    ON public.delivery_requests FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RPC Function to get available users for driver creation (non-driver users)
CREATE OR REPLACE FUNCTION public.get_available_users_for_drivers()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as full_name
  FROM auth.users au
  WHERE NOT EXISTS (
    SELECT 1 FROM public.drivers
    WHERE drivers.user_id = au.id
  )
  ORDER BY COALESCE(au.raw_user_meta_data->>'full_name', au.email);
$$;