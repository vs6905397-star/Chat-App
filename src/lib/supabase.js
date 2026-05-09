import { createClient } from '@supabase/supabase-js'

const  supabaseUrl = "https://avehriuhfvegxsohstdq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2ZWhyaXVoZnZlZ3hzb2hzdGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNTMwNzcsImV4cCI6MjA5MTcyOTA3N30.81QRvXzxVCe0c4J5Qp4uA3fROSdFd67gg1q-v1iIGi0";

export const supabase =  createClient( supabaseUrl, supabaseKey );