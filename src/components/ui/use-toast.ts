
import { toast as sonnerToast } from "sonner";

// Re-export sonner toast directly
export const toast = sonnerToast;

// Export useToast from the actual hook file
export { useToast } from "@/hooks/use-toast";
