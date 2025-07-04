import { Agency } from "./agency"

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  token?: string;
}

export interface LoginResponse {
  user: UserProfile;
  token: string;
}

export interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  agency?: Agency;
  role?: "agency_owner" | "agency_manager" | "agency_agent" | "agency_assistant";
  token?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  error: string | null;
}
