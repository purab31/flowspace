import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://buyvhhqpjdabczwcjdat.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1eXZoaHFwamRhYmN6d2NqZGF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NjQ3NTUsImV4cCI6MjA5MjM0MDc1NX0.eM-a8NY7KhFosA17q9n1ZhOCmmoTZ_nObNPQceTrH_U';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('Seeding Database...');
  
  // 1. Insert Users
  const usersToInsert = [
    { id: 'sarah', name: 'Sarah Jenkins', role: 'Admin', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPJ1CIvVbhg4q9Uu7pJEPf9WfkHEVsy0A5RJHtWoarmePIa1-Oa6nOoFRLjViUbCJ4fODzfBEPQxSqmPJh8ng_N5Ul0Y2HaPYVh8Yc4Bw0qXh6f2Xk72mcAYaqbXobKh5B8ac-LLI5BxErHuGyyon5U2I7i0CqH_apoU_qB1reQFqTwRGWPMiJgNGwPyIcsIalgKhx1ugBmY9Aabyx-4Dz6VPOx_8pXDjX9b5qmKXho9hg3JQkXRIBEJLa690dvZid5PlAIVQgNMk' },
    { id: 'marcus', name: 'Marcus Chen', role: 'Member', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRmrpsbMe_DHScrYsMXieBcT3vwN86k-t9AazSzdQECvNDEgFTZaeWmw_0FzxMJEJgoGG3tFAwEKC0cifcGpORFLQr0KPVWDmZTibYsiqP1v3L22EF42BRALrVvcsY9XLNy0Dp04S6wQbADgLLlh-W4iPLLQtNKZCKrvonUuZosy34wekrqBFtMJ0fJL042vJC5NO8QO2dBLNjt81zU5Ilp_h-m-WQmMahDCuhhqmOyBkwbWkBDxUdCxtNMn5RUakfuQI56HXyDOo' },
    { id: 'elena', name: 'Elena Rostova', role: 'Member', avatar: null }
  ];

  const { error: usersError } = await supabase.from('users').upsert(usersToInsert).select();
  if (usersError) console.error('Users error:', usersError);
  else console.log('Users Seeded!');

  // 2. Insert Project
  const projectToInsert = {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Website Redesign',
    description: 'Overhaul the main site',
    status: 'active'
  };

  const { error: projError } = await supabase.from('projects').upsert([projectToInsert]).select();
  if (projError) console.error('Project error:', projError);
  else console.log('Project Seeded!');

  // 3. Insert Task
  const taskToInsert = {
    title: 'Design new homepage mockup',
    description: 'Create figma designs for the new landing page',
    status: 'todo',
    assignee: 'marcus',
    project_id: '11111111-1111-1111-1111-111111111111',
    created_by: 'sarah'
  };

  const { error: taskError } = await supabase.from('tasks').insert([taskToInsert]).select();
  if (taskError) console.error('Task error:', taskError);
  else console.log('Task Seeded!');
}

seed();
