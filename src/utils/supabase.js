import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fbswmipelgbgkqrxezia.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZic3dtaXBlbGdiZ2txcnhlemlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3NDQ3MzcsImV4cCI6MjA2OTMyMDczN30.RDJdNhN-jcJ4AKORW54BlQWSiBL5KWATmq0jNonMaL8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchBranches = async () => {
  const { data, error } = await supabase
    .from('branches')
    .select('*');
  if (error) throw error;
  return data;
};

export const addBranch = async (branch) => {
  const { data, error } = await supabase
    .from('branches')
    .insert(branch)
    .select();
  if (error) throw error;
  return data[0];
};

export const updateBranch = async (id, updates) => {
  const { data, error } = await supabase
    .from('branches')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteBranch = async (id) => {
  const { error } = await supabase
    .from('branches')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

export const fetchBranchContacts = async (branchId) => {
  const { data, error } = await supabase
    .from('branch_contacts')
    .select('*')
    .eq('branch_id', branchId);
  if (error) throw error;
  return data;
};

export const addBranchContact = async (contact) => {
  const { data, error } = await supabase
    .from('branch_contacts')
    .insert(contact)
    .select();
  if (error) throw error;
  return data[0];
};

export const updateBranchContact = async (id, updates) => {
  const { data, error } = await supabase
    .from('branch_contacts')
    .update(updates)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
};

export const deleteBranchContact = async (id) => {
  const { error } = await supabase
    .from('branch_contacts')
    .delete()
    .eq('id', id);
  if (error) throw error;
};