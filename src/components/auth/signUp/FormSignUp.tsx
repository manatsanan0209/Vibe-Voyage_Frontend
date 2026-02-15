import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function FormSignUp() {

  const [showPassword, setShowPassword] = useState(false);
  return (

    <div className="w-full max-w-sm justify-center flex flex-col mt-2">
      <FieldSet className="w-full">
        <FieldGroup>
          <Field className="w-full">
            <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your Full Name"
              className="h-10"
            />
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="Enter your Username"
              className="h-10"
            />
          </Field>
          <Field className="w-full">
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="text"
              placeholder="Enter your Email"
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
          <Field className="w-full">
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your Password"
              className="h-10"
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-center mt-7">
        <Button className="w-10/12 h-auto rounded-md font-semibold bg-indigo-600 text-white hover:bg-indigo-700">
          Sign Up
        </Button>
      </div>
      <p className=" mt-4 justify-center text-center font-normal text-muted-foreground text-sm">
       Already have an account?{" "}
        <a
          href="/signin"
          className="text-indigo-400 font-semibold hover:underline"
        >
          Sign In
        </a>
      </p>
    </div>
  );
}
