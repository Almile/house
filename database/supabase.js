import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://asxkgqevnbxbpdjdwrhv.supabase.co";
const supabaseAnonKey = "sb_publishable_BZ9KqaxozMHeN20bZM9L5g_JOL67AaO";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
