// Basic validation utilities for forms
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUrl = (url: string): boolean => {
  if (!url) return true // URL is optional in most cases
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return true // Phone is optional in most cases
  // Basic phone validation - at least 7 digits, can have +, spaces, dashes, parentheses
  const phoneRegex = /^[\+]?[(]?[\d\s\-\(\)]{7,}$/
  return phoneRegex.test(phone)
}

export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0
}

// Agency-specific validation
export const validateAgencyBasicInfo = (data: {
  name: string
  country: string
  timezone: string
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!validateRequired(data.name)) {
    errors.push("Agency name is required")
  }

  if (!validateRequired(data.country)) {
    errors.push("Country is required")
  }

  if (!validateRequired(data.timezone)) {
    errors.push("Timezone is required")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Login validation
export const validateLoginForm = (data: {
  email: string
  password: string
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!validateRequired(data.email)) {
    errors.push("Email is required")
  } else if (!validateEmail(data.email)) {
    errors.push("Please enter a valid email address")
  }

  if (!validateRequired(data.password)) {
    errors.push("Password is required")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Registration validation
export const validateRegistrationForm = (data: {
  email: string
  password: string
  firstName: string
  lastName: string
  confirmPassword: string
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []

  if (!validateRequired(data.firstName)) {
    errors.push("First name is required")
  }

  if (!validateRequired(data.lastName)) {
    errors.push("Last name is required")
  }

  if (!validateRequired(data.email)) {
    errors.push("Email is required")
  } else if (!validateEmail(data.email)) {
    errors.push("Please enter a valid email address")
  }

  if (!validateRequired(data.password)) {
    errors.push("Password is required")
  } else if (data.password.length < 6) {
    errors.push("Password must be at least 6 characters long")
  }

  if (data.password !== data.confirmPassword) {
    errors.push("Passwords do not match")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
