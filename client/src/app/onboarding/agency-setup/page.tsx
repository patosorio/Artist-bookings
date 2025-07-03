import { AgencySetupForm } from "@/components/auth/forms/AgencySetupForm"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function AgencySetupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Set Up Your Agency</CardTitle>
          <CardDescription className="text-center">
            Name your agency to get started with your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AgencySetupForm />
        </CardContent>
      </Card>
    </div>
  )
}