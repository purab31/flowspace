-- 1. Create the files table
CREATE TABLE IF NOT EXISTS public.workspace_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    size INTEGER NOT NULL,
    type TEXT NOT NULL,
    url TEXT NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    uploaded_by TEXT REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.workspace_files ENABLE ROW LEVEL SECURITY;

-- Create Policies for Table
CREATE POLICY "Enable read access for all users" ON public.workspace_files FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON public.workspace_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable delete for all users" ON public.workspace_files FOR DELETE USING (true);

-- Enable Realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_files;

-- 2. Storage Setup (Note: you must create the bucket 'workspace' manually via UI if this fails)
INSERT INTO storage.buckets (id, name, public) VALUES ('workspace', 'workspace', true) ON CONFLICT DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'workspace' );
CREATE POLICY "Enable upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'workspace' );
CREATE POLICY "Enable delete" ON storage.objects FOR DELETE USING ( bucket_id = 'workspace' );
