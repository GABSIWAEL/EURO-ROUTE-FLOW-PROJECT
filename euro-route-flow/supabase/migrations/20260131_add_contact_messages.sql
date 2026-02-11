-- Create contact_messages table
CREATE TABLE public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new',  -- 'new', 'responded', 'deleted'
    response_text TEXT,
    response_date TIMESTAMP WITH TIME ZONE,
    delete_at TIMESTAMP WITH TIME ZONE,  -- Auto-delete date (7 days after response)
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_messages
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_messages
-- Anyone can insert (public form submission)
CREATE POLICY "Anyone can create contact message"
    ON public.contact_messages FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Staff can view all messages
CREATE POLICY "Staff can view all messages"
    ON public.contact_messages FOR SELECT
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Staff can update messages (add response)
CREATE POLICY "Staff can update messages"
    ON public.contact_messages FOR UPDATE
    TO authenticated
    USING (public.is_staff(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-delete old responded messages
CREATE OR REPLACE FUNCTION public.delete_old_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE public.contact_messages
    SET status = 'deleted'
    WHERE status = 'responded'
    AND delete_at IS NOT NULL
    AND delete_at <= now();
END;
$$;
