import React, { useState } from 'react'
import { Save, User, Mail, Calendar } from 'lucide-react'
import { Button, Card, RichTextEditor } from '@/components/ui'
import { useRichTextEditor } from '@/hooks/useRichTextEditor'
import { cn } from '@/lib/utils/cn'

interface ProfileFormProps {
  initialData?: {
    name: string
    email: string
    joinDate: string
    bio: string
  }
  onSave?: (data: {
    name: string
    email: string
    bio: string
  }) => Promise<void>
  className?: string
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData = {
    name: '',
    email: '',
    joinDate: new Date().toISOString(),
    bio: ''
  },
  onSave,
  className
}) => {
  const [name, setName] = useState(initialData.name)
  const [email, setEmail] = useState(initialData.email)
  const [isSaving, setIsSaving] = useState(false)

  // Rich text editor for bio
  const { 
    value: bio, 
    handleChange: handleBioChange,
    validation: bioValidation 
  } = useRichTextEditor({
    initialValue: initialData.bio || '',
    maxLength: 1000,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!onSave || !bioValidation.isValid) return
    
    try {
      setIsSaving(true)
      await onSave({
        name,
        email,
        bio
      })
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary">Profile Settings</h2>
        <p className="text-sm text-text-secondary">Update your personal information</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Section */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-text-primary">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 pl-10 bg-surface border border-surface-light rounded"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 pl-10 bg-surface border border-surface-light rounded"
                  required
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Member Since
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={new Date(initialData.joinDate).toLocaleDateString()}
                className="w-full px-3 py-2 pl-10 bg-surface border border-surface-light rounded"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-4">
          <h3 className="text-md font-medium text-text-primary">Trader Bio</h3>
          
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-text-secondary mb-1">
              About You
            </label>
            <RichTextEditor
              value={bio}
              onChange={handleBioChange}
              placeholder="Tell us about your trading journey, experience, and style..."
              error={!bioValidation.isValid}
              errorMessage={bioValidation.errors.join('. ')}
              maxLength={1000}
              showCharCount
              className="min-h-[150px]"
            />
            <p className="mt-1 text-xs text-text-secondary">
              Share your trading background and philosophy to personalize your profile.
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end pt-4 border-t border-surface-light">
          <Button 
            type="submit"
            disabled={isSaving || !bioValidation.isValid}
            className="bg-profit text-white"
          >
            <Save className="w-4 h-4 mr-1" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default ProfileForm
