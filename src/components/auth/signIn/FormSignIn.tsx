import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function FormSignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  return (
    <div className="w-full max-w-sm justify-center flex flex-col gap-6">
      <FieldSet className="w-full">
        <FieldGroup>
          <Field className="w-full">
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="Enter your Username"
              className="h-10"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your Password"
                className="h-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </Field>

          <Field orientation="horizontal" className="items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember-me"
                name="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <FieldLabel
                htmlFor="remember-me"
                className="text-muted-foreground font-normal"
              >
                Remember me
              </FieldLabel>
            </div>
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="mt-4 flex justify-center">
        <Button className="w-10/12 h-auto rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-700">
          Sign In
        </Button>
      </div>
      <p className="mt-5 justify-center text-center font-normal text-muted-foreground text-sm">Don’t have an account? <a href="/signup" className="text-indigo-400 font-semibold hover:underline">Sign Up</a></p>
    </div>
  )
}
