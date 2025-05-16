
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from "@/integrations/supabase/client";
import { toast, Toaster } from "sonner";

// Verify Supabase connection on startup
const verifySupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('clients').select('count');
    if (error) {
      console.error("Supabase connection error:", error);
      toast.error("Failed to connect to Supabase. Using local data.");
      return false;
    }
    console.info("Supabase connection successful");
    return true;
  } catch (e) {
    console.error("Supabase connection error:", e);
    toast.error("Failed to connect to Supabase. Using local data.");
    return false;
  }
};

// Initialize the app
const init = async () => {
  await verifySupabaseConnection();
  
  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error('Root element not found');
  
  createRoot(rootElement).render(
    <>
      <App />
      <Toaster position="top-right" />
    </>
  );
};

init();
