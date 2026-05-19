"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Mail, Lock } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().min(1, "Invalid email"),
  password: z.string().min(1, "Invalid Password"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await signIn("credentials", {
        redirect: false,
        ...data,
      });
      console.log(res);

      if (res?.error) {
        setIsLoading(false);
        return toast.error("Invalid email or password");
      }
      setTimeout(() => {
        toast.success("Login successful");
        setIsLoading(false);
        redirect("/admin/dashboard");
      }, 500);
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Image
        src={"/images/home-hero.png"}
        alt="Background"
        width={500}
        height={500}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
      />

      <div className="w-full mx-auto flex backdrop-blur-sm bg-black/30 justify-center items-center  absolute inset-0  h-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white text-main rounded-lg shadow-lg px-6 py-8 sm:px-10 space-y-6"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">Sign in to continue</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={errors.email ? "text-red-500" : "text-gray-600"}
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="text"
                  placeholder="Enter your email"
                  {...register("email")}
                  className={`pl-10 bg-white text-main ${
                    errors.email ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className={errors.password ? "text-red-500" : "text-gray-600"}
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register("password")}
                  className={`pl-10 bg-white text-main ${
                    errors.password ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-main text-white py-3 rounded-md font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
