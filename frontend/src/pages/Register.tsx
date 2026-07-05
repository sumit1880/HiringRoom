import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import {
  registerSchema,
  type RegisterFormData,
} from "../validators/register.schema";

import { register } from "../api/auth.api";

export default function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    register: registerField,
    handleSubmit,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(
    data: RegisterFormData
  ) {
    try {
      await register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      toast.success(
        "Account created successfully!"
      );

      navigate("/login");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Registration failed"
      );
    }
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start your AI interview journey today."
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <Input
          label="Full Name"
          placeholder="Enter your name"
          error={errors.name?.message}
          {...registerField("name")}
        />

        <Input
          label="Email"
          placeholder="Enter your email"
          error={errors.email?.message}
          {...registerField("email")}
        />

        <div className="relative">
          <Input
            label="Password"
            type={
              showPassword ? "text" : "password"
            }
            placeholder="Enter password"
            error={errors.password?.message}
            {...registerField("password")}
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-4 top-[46px] text-slate-400"
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={
              showConfirmPassword
                ? "text"
                : "password"
            }
            placeholder="Confirm password"
            error={
              errors.confirmPassword?.message
            }
            {...registerField(
              "confirmPassword"
            )}
          />

          <button
            type="button"
            onClick={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
            className="absolute right-4 top-[46px] text-slate-400"
          >
            {showConfirmPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        </div>

        <Button loading={isSubmitting}>
          Create Account
        </Button>

        <p className="text-center text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-400 hover:text-blue-300"
          >
            Login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}