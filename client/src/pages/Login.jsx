// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { useAuth } from '../context/useAuth'
// import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi'
// import { Button } from '../components/ui/button'
// import { Input } from '../components/ui/input'
// import { Checkbox } from '../components/ui/checkbox'
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card'
// import { Label } from '../components/ui/label'

// export default function Login() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [showPassword, setShowPassword] = useState(false)
//   const [error, setError] = useState('')
//   const [rememberMe, setRememberMe] = useState(false)
//   const { login } = useAuth()
//   const navigate = useNavigate()

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       await login(email, password)
//       navigate('/home')
//     } catch {
//       setError('Invalid email or password')
//     }
//   }

//   return (
//     <div className="min-h-screen  to-indigo-50 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader className="text-center">
//           <Link to="/" className="flex items-center justify-center gap-2 mb-4">
//             <div className="bg-indigo-600 p-2 rounded-lg">
//               <svg 
//                 width="24" 
//                 height="24" 
//                 viewBox="0 0 24 24" 
//                 fill="none" 
//                 stroke="currentColor" 
//                 strokeWidth="2"
//                 className="text-white"
//               >
//                 <path d="M23 7L16 12L23 17V7Z" />
//                 <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
//               </svg>
//             </div>
//             <span className="text-2xl font-bold text-indigo-600">StreamHub</span>
//           </Link>
//           <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
//           <CardDescription className="text-gray-500">
//             Sign in to access your account
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           {error && (
//             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <div className="relative">
//                 <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="you@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="pl-10"
//                   required
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <div className="relative">
//                 <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="pl-10 pr-10"
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center space-x-2">
//                 <Checkbox 
//                   id="remember" 
//                   checked={rememberMe}
//                   onCheckedChange={(checked) => setRememberMe(checked)}
//                 />
//                 <Label htmlFor="remember" className="text-sm font-medium leading-none">
//                   Remember me
//                 </Label>
//               </div>
//               <Link 
//                 to="/forgot-password" 
//                 className="text-sm text-indigo-600 hover:underline"
//               >
//                 Forgot password?
//               </Link>
//             </div>

//             <Button type="submit" className="w-full gap-2">
//               Sign In
//               <FiArrowRight className="h-4 w-4" />
//             </Button>
//           </form>
//         </CardContent>

//         <CardFooter className="justify-center">
//           <p className="text-sm text-gray-600">
//             Don't have an account?{" "}
//             <Link to="/register" className="text-indigo-600 font-medium hover:underline">
//               Sign up
//             </Link>
//           </p>
//         </CardFooter>
//       </Card>
//     </div>
//   )
// }

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
      navigate("/dashboard")
    } catch (err) {
      setError(err.message || "Login failed. Please try again.")
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
          <Link to="/" className="flex items-center justify-center gap-2 mb-4">
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
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-100">
              <RiGithubFill className="mr-2" /> GitHub
            </Button>
            <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-100">
              <RiGoogleFill className="mr-2" /> Google
            </Button>
          </div>
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs text-gray-500 uppercase">Or continue with email</span>
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
            <Button type="submit" className="w-full bg-purple-500 hover:bg-purple-600 text-white" disabled={loading}>
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