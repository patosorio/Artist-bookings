"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useRegister } from "@/lib/hooks/useRegister"

export function RegisterForm() {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    loading,
    error,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleRegister
  } = useRegister()

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name</Label>
        <Input 
          id="firstName" 
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="John"
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name</Label>
        <Input 
          id="lastName" 
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          placeholder="Doe"
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@agency.com"
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password" 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input 
          id="confirmPassword" 
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm password"
          required 
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {loading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  )
}