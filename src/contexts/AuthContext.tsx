
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // For demo purposes, we'll use a simple login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Demo admin login - in real app, this would be replaced with Supabase authentication
      if (password === "1234") {
        const user = {
          id: "1",
          email,
          role: "admin",
        };
        
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        
        toast({
          title: "Login successful",
          description: "Welcome to the admin panel",
        });
        
        navigate("/admin/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/admin/login");
    
    toast({
      title: "Logged out",
      description: "You have been logged out",
    });
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
