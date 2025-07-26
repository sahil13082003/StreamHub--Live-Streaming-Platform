

"use client"

import { useState, useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RiEyeLine, RiEyeOffLine, RiGithubFill, RiGoogleFill, RiArrowRightLine, RiPlayCircleLine } from "react-icons/ri"
import { toast } from "react-toastify"

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const { login } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(formData.email, formData.password)
      toast.success("Login successful! Redirecting...")
      navigate("/home", { replace: true })
    } catch (err) {
      const errorMsg = err.message || "Login failed. Please check your credentials."
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-gray-200 shadow-lg">
        <CardHeader className="text-center">
          <Link to="/home" className="flex items-center justify-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500 text-white">
              <RiPlayCircleLine size={20} />
            </div>
            <span className="text-xl font-bold text-gray-900">StreamHub</span>
          </Link>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">Sign in to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-500 uppercase">Sign in with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-600">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-600">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="border-gray-200 focus:border-purple-500 focus:ring-purple-500/20 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <RiEyeOffLine /> : <RiEyeLine />}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, rememberMe: checked }))}
                  className="border-gray-200"
                />
                <Label htmlFor="rememberMe" className="text-sm text-gray-600">Remember me</Label>
              </div>
              <Link to="/forgot-password" className="text-sm text-purple-500 hover:text-purple-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"} <RiArrowRightLine className="ml-2" />
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-purple-500 font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login