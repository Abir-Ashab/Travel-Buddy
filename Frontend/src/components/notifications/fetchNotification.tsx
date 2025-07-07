import React, { useEffect, useState } from 'react'
import { FiBell, FiCheck, FiTrash2, FiHeart, FiBookmark, FiUsers, FiTarget, FiShare2 } from 'react-icons/fi'
import api from '../../services/api'

interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: 'like' | 'save' | 'trip_invite' | 'match_found' | 'wishlist_share'
  metadata?: any
  is_read: boolean
  created_at: string
}

const typeIcons = {
  like: FiHeart,
  save: FiBookmark,
  trip_invite: FiUsers,
  match_found: FiTarget,
  wishlist_share: FiShare2
}

const typeColors = {
  like: 'text-red-500',
  save: 'text-blue-500',
  trip_invite: 'text-green-500',
  match_found: 'text-purple-500',
  wishlist_share: 'text-orange-500'
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.id
  }

  const fetchNotifications = async () => {
    try {
      const userId = getUserId()
      if (!userId) return

      const response = await api.get(`/notifications/user`)
      console.log("notification: ", response)
      setNotifications(response.data.data || [])

      const unread = response.data.data?.filter((n: Notification) => !n.is_read).length || 0
      setUnreadCount(unread)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true }
            : n
        )
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      
      const deletedNotification = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    
    // Navigate to related post if available
    if (notification.metadata?.post_id) {
      window.location.href = `/posts/${notification.metadata.post_id}`
    }
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  useEffect(() => {
    fetchNotifications()
    
    const handleRefresh = () => fetchNotifications()
    window.addEventListener('refreshNotifications', handleRefresh)
    
    return () => {
      window.removeEventListener('refreshNotifications', handleRefresh)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <FiBell className="text-lg text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <FiBell className="mx-auto text-3xl text-gray-300 mb-2" />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => {
              const IconComponent = typeIcons[notification.type] || FiBell
              const iconColor = typeColors[notification.type]
              
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-full bg-gray-100 ${iconColor}`}>
                        <IconComponent className="text-sm" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900 text-sm">
                            {notification.title}
                          </p>
                          {!notification.is_read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-gray-500 mt-1">
                          {formatRelativeTime(notification.created_at)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Mark as read"
                        >
                          <FiCheck className="text-sm" />
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}