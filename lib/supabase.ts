import { createClient } from "@supabase/supabase-js";

// Use environment variables for Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Validate configuration in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    if (!supabaseUrl || !supabaseKey) {
        console.error("❌ Missing Supabase environment variables!");
        console.error("Please create a .env.local file with:");
        console.error("NEXT_PUBLIC_SUPABASE_URL=your_supabase_url");
        console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key");
    } else {
        console.log("✅ Supabase URL:", supabaseUrl);
        console.log("✅ Supabase Key configured");
    }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
