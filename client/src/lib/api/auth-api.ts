import { AxiosResponse } from 'axios'
import { apiClient } from "./client"
import { RegisterData, LoginResponse, UserProfile } from "@/types/auth"
import { Agency, CreateAgencyDto } from "@/types/agency"

class AuthApi {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post("/api/v1/auth/login/", { email, password })
    return response.data
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post("/api/v1/auth/register/", data)
    return response.data
  }

  async getUserProfile(): Promise<AxiosResponse<UserProfile>> {
    return await apiClient.get("/api/v1/auth/user/profile/")
  }

  async createAgency(data: CreateAgencyDto): Promise<Agency> {
    const response = await apiClient.post("/api/v1/agencies/", data)
    return response.data
  }

  async verifyEmail(token?: string): Promise<void> {
    await apiClient.post("/api/v1/auth/verify-email/", token ? { token } : {})
  }

  async sendVerificationEmail(): Promise<void> {
    await apiClient.post("/api/v1/auth/send-verification-email/")
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/api/v1/auth/forgot-password/", { email })
  }

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post("/api/v1/auth/reset-password/", { token, password })
  }
}

export const authApi = new AuthApi()