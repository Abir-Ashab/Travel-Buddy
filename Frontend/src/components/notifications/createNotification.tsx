import React, { useState } from 'react'
import api from '../../services/api'
import { FiBell, FiX, FiSend, FiLoader } from 'react-icons/fi'

interface CreateNotificationProps {
  onNotificationCreated?: (notification: any) => void
  className?: string
  trigger?: React.ReactNode
}

interface NotificationData {
  user_id: number
  title: string
  message: string
  type: 'like' | 'save' | 'trip_invite' | 'match_found' | 'wishlist_share'
  metadata?: any
}

const notificationTypes = [
  { value: 'like', label: 'Like' },
  { value: 'save', label: 'Save' },
  { value: 'trip_invite', label: 'Trip Invite' },
  { value: 'match_found', label: 'Match Found' },
  { value: 'wishlist_share', label: 'Wishlist Share' }
]

export default function CreateNotification({ 
  onNotificationCreated, 
  className = '',
  trigger 
}: CreateNotificationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<NotificationData>({
    user_id: 0,
    title: '',
    message: '',
    type: 'like',
    metadata: {}
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.user_id || !formData.title || !formData.message) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const payload = {
        ...formData,
        metadata: formData.metadata || {}
      }
      
      const response = await api.post('/notifications', payload)
      
      if (onNotificationCreated) {
        onNotificationCreated(response.data.data)
      }
      
      // Reset form
      setFormData({
        user_id: 0,
        title: '',
        message: '',
        type: 'like',
        metadata: {}
      })
      
      setIsOpen(false)
      
    } catch (err: any) {
      console.error('Failed to create notification:', err)
      setError(err.response?.data?.message || 'Failed to create notification')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'user_id' ? parseInt(value) || 0 : value
    }))
  }

  const defaultTrigger = (
    <button
      onClick={() => setIsOpen(true)}
      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
    >
      <FiBell className="mr-2" />
      Create Notification
    </button>
  )

  return (
    <div className={className}>
      {trigger ? (
        <div onClick={() => setIsOpen(true)}>
          {trigger}
        </div>
      ) : (
        defaultTrigger
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Create Notification</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID *
                </label>
                <input
                  type="number"
                  name="user_id"
                  value={formData.user_id || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={loading}
                >
                  {notificationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metadata (JSON)
                </label>
                <textarea
                  name="metadata"
                  value={typeof formData.metadata === 'string' ? formData.metadata : JSON.stringify(formData.metadata, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setFormData(prev => ({ ...prev, metadata: parsed }))
                    } catch {
                      setFormData(prev => ({ ...prev, metadata: e.target.value }))
                    }
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder='{"key": "value"}'
                  disabled={loading}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <FiLoader className="animate-spin mr-2" />
                  ) : (
                    <FiSend className="mr-2" />
                  )}
                  {loading ? 'Creating...' : 'Create Notification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}