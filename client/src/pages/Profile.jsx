"use client"
import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '@/context/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { RiCameraLine, RiSaveLine, RiLockLine, RiMailLine, RiUserLine } from 'react-icons/ri'
import { toast } from 'react-toastify'

const ProfilePage = () => {
  const { user, updateProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const fileInputRef = useRef(null)
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm()

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || ''
      })
      setPreviewImage(user.profilePhoto)
    }
  }, [user, reset])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
      }
      reader.readAsDataURL(file)
      // Manually set the file value for react-hook-form
      setValue('profilePhoto', file)
    }
  }

 const onSubmit = async (data) => {
  setIsLoading(true);
  try {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('bio', data.bio || '');
    formData.append('location', data.location || '');
    formData.append('website', data.website || '');
    if (data.profilePhoto instanceof File) {
      formData.append('profilePhoto', data.profilePhoto);
    }

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value instanceof File ? value.name : value);
    }

    const response = await updateProfile(formData);
    if (response.success) {
      toast.success('Profile updated successfully!');
    } else {
      throw new Error(response.message || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Profile update error:', error);
    const message = error.response?.data?.message || error.message;
    const details = error.response?.data?.errorDetails;
    console.log('Error details:', details);
    if (message.includes('Timeout')) {
      toast.error('Image upload timed out. Please check your connection and try again.');
    } else if (message.includes('Cloudinary')) {
      toast.error(`Image upload failed: ${details?.message || message}`);
    } else if (message.includes('Unauthorized')) {
      toast.error('Please log in again.');
    } else if (message.includes('file not found')) {
      toast.error('Uploaded file could not be processed.');
    } else {
      toast.error(message || 'Failed to update profile');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Cover Photo Placeholder */}
        <div className="h-48 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-white rounded-full shadow-md">
                <AvatarImage src={previewImage} />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-2xl font-medium">
                  {user?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label
                htmlFor="profilePhoto"
                className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <RiCameraLine className="text-gray-700" />
                <input
                  id="profilePhoto"
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="pt-20 px-6 pb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <Label htmlFor="username" className="flex items-center gap-2 text-gray-700 mb-2">
                  <RiUserLine size={16} />
                  Username
                </Label>
                <Input
                  id="username"
                  {...register('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' }
                  })}
                  className="border-gray-300 focus:border-purple-500"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              {/* Email (readonly) */}
              <div>
                <Label htmlFor="email" className="flex items-center gap-2 text-gray-700 mb-2">
                  <RiMailLine size={16} />
                  Email
                </Label>
                <Input
                  id="email"
                  value={user?.email || ''}
                  readOnly
                  className="border-gray-300 bg-gray-100"
                />
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <Label htmlFor="bio" className="text-gray-700 mb-2">Bio</Label>
                <textarea
                  id="bio"
                  {...register('bio')}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Tell us about yourself..."
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-gray-700 mb-2">Location</Label>
                <Input
                  id="location"
                  {...register('location')}
                  className="border-gray-300 focus:border-purple-500"
                  placeholder="City, Country"
                />
              </div>

              {/* Website */}
              <div>
                <Label htmlFor="website" className="text-gray-700 mb-2">Website</Label>
                <Input
                  id="website"
                  {...register('website')}
                  className="border-gray-300 focus:border-purple-500"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                disabled={isLoading}
              >
                <RiSaveLine size={18} />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage