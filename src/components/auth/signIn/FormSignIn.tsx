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
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import axios from "axios"
import type { ApiResponseDTO } from "@/types/api"
import type { SigninRequestDTO, SigninResponseDTO } from "@/types/auth"

export default function FormSignIn() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [form, setForm] = useState<SigninRequestDTO>({
    username: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (!form.username || !form.password) {
      setError("Please enter username and password.")
      return
    }

    setIsSubmitting(true)

    try {
      const { data } = await axios.post<ApiResponseDTO<SigninResponseDTO>>(
        `${apiBaseUrl}/auth/login`,
        form
      )
      const payload = data.data

      localStorage.setItem("token", payload.token)
      localStorage.setItem("expires_at", payload.expires_at)
      localStorage.setItem("user_id", String(payload.id))
      localStorage.setItem("username", payload.username)
      localStorage.setItem("remember_me", String(rememberMe))

      navigate("/")
    } catch (err) {
      setError("Login failed. Please check your credentials.")
      console.error("Login error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm justify-center flex flex-col gap-6">
      <FieldSet className="w-full">
        <FieldGroup>
          <Field className="w-full">
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="Enter your Username"
              className="h-10"
              value={form.username}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, username: event.target.value }))
              }
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
                value={form.password}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, password: event.target.value }))
                }
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

      {error ? (
        <p className="text-center text-sm text-red-600">{error}</p>
      ) : null}

      <div className="mt-4 flex justify-center">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-10/12 h-auto rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </div>
      <p className="mt-5 justify-center text-center font-normal text-muted-foreground text-sm">Don’t have an account? <a href="/signup" className="text-indigo-400 font-semibold hover:underline">Sign Up</a></p>
    </form>
  )
}
