import { useEffect, useState, useCallback } from 'react'
import { FiBell, FiCheck, FiTrash2, FiHeart, FiBookmark, FiUsers, FiTarget, FiX, FiCheckCircle, FiFilter, FiRefreshCw, FiMapPin, FiNavigation } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: 'like' | 'trip_invite' | 'match_found' | 'nearby_wishlist_location' | 'proximity_alert'
  metadata?: {
    post_id?: number;
    post_title?: string;
    user_name?: string;
    trigger_type?: string;
    location_id?: string;
    location_name?: string;
    distance_km?: number;
    wishlist_item_id?: string;
    wishlist_item_name?: string;
    [key: string]: any;
  }
  is_read: boolean
  created_at: string
}

const notificationIcons = {
  like: FiHeart,
  save: FiBookmark,
  trip_invite: FiUsers,
  match_found: FiTarget,
  nearby_wishlist_location: FiHeart,
  proximity_alert: FiMapPin
}

const notificationColors = {
  like: 'text-red-500 bg-red-50',
  trip_invite: 'text-green-500 bg-green-50',
  match_found: 'text-purple-500 bg-purple-50',
  nearby_wishlist_location: 'text-pink-500 bg-pink-50', 
  proximity_alert: 'text-blue-500 bg-blue-50'
}

const notificationTypes = {
  like: 'Like',
  trip_invite: 'Trip Invite',
  match_found: 'Match Found',
  nearby_wishlist_location: 'Nearby Wishlist',
  proximity_alert: 'Proximity Alert'
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const navigate = useNavigate()

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user.id
  }

  const applyFilters = useCallback((notificationData: Notification[], statusFilter: string, typeFilterValue: string) => {
    let filtered = [...notificationData]

    if (statusFilter === 'unread') {
      filtered = filtered.filter(n => !n.is_read)
    } else if (statusFilter === 'read') {
      filtered = filtered.filter(n => n.is_read)
    }

    if (typeFilterValue !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilterValue)
    }

    setFilteredNotifications(filtered)
  }, [])

  const fetchNotifications = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setRefreshing(true)
      }
      
      const userId = getUserId()
      if (!userId) {
        setLoading(false)
        return
      }

      const response = await api.get(`/notifications/user`)
      const notificationData = response.data.data || []
      
      setNotifications(notificationData)
      
      const unread = notificationData.filter((n: Notification) => !n.is_read).length
      setUnreadCount(unread)
      applyFilters(notificationData, filter, typeFilter)
      
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [applyFilters, filter, typeFilter])

  const markAsRead = async (notificationId: number) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
      
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notificationId 
            ? { ...n, is_read: true }
            : n
        )
        const unread = updated.filter(n => !n.is_read).length
        setUnreadCount(unread)
        applyFilters(updated, filter, typeFilter)
        
        return updated
      })
      
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read)
      
      if (unreadNotifications.length === 0) return
      
      await Promise.all(
        unreadNotifications.map(n => api.patch(`/notifications/${n.id}/read`))
      )
      
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, is_read: true }))
        applyFilters(updated, filter, typeFilter)
        return updated
      })
      
      setUnreadCount(0)
      
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
    }
  }

  const markSelectedAsRead = async () => {
    try {
      const selectedIds = Array.from(selectedNotifications)
      
      if (selectedIds.length === 0) return
      
      await Promise.all(
        selectedIds.map(id => api.patch(`/notifications/${id}/read`))
      )
      
      setNotifications(prev => {
        const updated = prev.map(n => 
          selectedIds.includes(n.id) 
            ? { ...n, is_read: true }
            : n
        )
        
        const unread = updated.filter(n => !n.is_read).length
        setUnreadCount(unread)
        
        applyFilters(updated, filter, typeFilter)
        return updated
      })
      
      setSelectedNotifications(new Set())
      setShowBulkActions(false)
      
    } catch (err) {
      console.error('Failed to mark selected notifications as read:', err)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      await api.delete(`/notifications/${notificationId}`)
      
      setNotifications(prev => {
        const deletedNotification = prev.find(n => n.id === notificationId)
        const updated = prev.filter(n => n.id !== notificationId)
      
        if (deletedNotification && !deletedNotification.is_read) {
          setUnreadCount(prevCount => Math.max(0, prevCount - 1))
        }
        
        applyFilters(updated, filter, typeFilter)
        return updated
      })
      
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const deleteSelected = async () => {
    try {
      const selectedIds = Array.from(selectedNotifications)
      
      if (selectedIds.length === 0) return
      
      await Promise.all(
        selectedIds.map(id => api.delete(`/notifications/${id}`))
      )
      
      setNotifications(prev => {
        const deletedUnread = prev.filter(n => selectedIds.includes(n.id) && !n.is_read).length
        const updated = prev.filter(n => !selectedIds.includes(n.id))
        
        setUnreadCount(prevCount => Math.max(0, prevCount - deletedUnread))
        applyFilters(updated, filter, typeFilter)
        return updated
      })
      
      setSelectedNotifications(new Set())
      setShowBulkActions(false)
      
    } catch (err) {
      console.error('Failed to delete selected notifications:', err)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    
    // Handle different notification types
    if (notification.type === 'trip_invite') {
      navigate('/travel-places/invites')
    } else if (notification.type === 'nearby_wishlist_location') {
      // Navigate to wishlist when clicking on nearby wishlist location notifications
      navigate('/wishlist')
    } else if (notification.type === 'proximity_alert') {
      // Handle proximity alerts based on trigger type
      if (notification.metadata?.trigger_type === 'nearby_wishlist_location') {
        navigate('/wishlist') // Navigate to wishlist page
      } else if (notification.metadata?.trigger_type === 'trip_participant') {
        navigate('/travel-places') // Navigate to trips page
      } else if (notification.metadata?.location_id) {
        navigate(`/locations/${notification.metadata.location_id}`) // Navigate to specific location
      }
    } else if (notification.metadata?.post_id) {
      navigate(`/posts/${notification.metadata.post_id}`)
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

  const handleFilterChange = (newFilter: 'all' | 'unread' | 'read') => {
    setFilter(newFilter)
    applyFilters(notifications, newFilter, typeFilter)
  }

  const handleTypeFilterChange = (newTypeFilter: string) => {
    setTypeFilter(newTypeFilter)
    applyFilters(notifications, filter, newTypeFilter)
  }

  const handleSelectNotification = (notificationId: number) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev)
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId)
      } else {
        newSet.add(notificationId)
      }
      setShowBulkActions(newSet.size > 0)
      return newSet
    })
  }

  const handleSelectAll = () => {
    if (selectedNotifications.size === filteredNotifications.length) {
      setSelectedNotifications(new Set())
      setShowBulkActions(false)
    } else {
      setSelectedNotifications(new Set(filteredNotifications.map(n => n.id)))
      setShowBulkActions(true)
    }
  }

  // Helper function to get proximity alert icon based on trigger type
  const getProximityIcon = (triggerType: string) => {
    switch (triggerType) {
      case 'nearby_wishlist_location':
        return FiHeart
      case 'trip_participant':
        return FiUsers
      case 'attraction':
        return FiTarget
      case 'accommodation':
      case 'dining':
        return FiMapPin
      default:
        return FiNavigation
    }
  }

  useEffect(() => {
    applyFilters(notifications, filter, typeFilter)
  }, [notifications, filter, typeFilter, applyFilters])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => {
      fetchNotifications()
    }, 300000) // 5 minutes
    
    return () => {
      clearInterval(interval)
    }
  }, [fetchNotifications])

  if (loading) {
    return (
   <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiBell className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg">
                <FiBell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Notifications</h1>
                <p className="text-slate-500 mt-1">Stay updated with your latest activities</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => fetchNotifications(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-200 font-medium text-slate-700 disabled:opacity-50"
              >
                <FiRefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                >
                  <FiCheckCircle size={16} />
                  Mark all read
                </button>
              )}
              
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-2 rounded-xl shadow-sm">
                <span className="text-sm font-semibold text-slate-700">
                  {unreadCount} unread
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-2">
              <FiFilter className="text-slate-500" size={18} />
              <span className="text-sm font-semibold text-slate-700">Filters:</span>
            </div>
            
            <div className="flex items-center gap-2">
              {(['all', 'unread', 'read'] as const).map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => handleFilterChange(filterOption)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === filterOption
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => handleTypeFilterChange(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
              >
                <option value="all">All Types</option>
                {Object.entries(notificationTypes).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {filteredNotifications.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 text-sm bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors font-medium"
                >
                  {selectedNotifications.size === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}
          </div>

          {showBulkActions && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedNotifications.size} notification{selectedNotifications.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markSelectedAsRead}
                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    <FiCheck size={14} />
                    Mark as read
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    <FiTrash2 size={14} />
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectedNotifications(new Set())
                      setShowBulkActions(false)
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-500 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm font-medium"
                  >
                    <FiX size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden backdrop-blur-sm">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiBell className="text-3xl text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {filter === 'all' 
                  ? 'No notifications yet' 
                  : `No ${filter} notifications`
                }
              </h3>
              <p className="text-slate-500 max-w-md mx-auto">
                {filter === 'all' 
                  ? "You'll see updates here when they arrive. Start exploring to get notified about likes, saves, and trip invitations!"
                  : `Switch to other filters to see more notifications`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredNotifications.map((notification) => {
                // Use different icons for proximity alerts based on trigger type
                const IconComponent = notification.type === 'proximity_alert' && notification.metadata?.trigger_type
                  ? getProximityIcon(notification.metadata.trigger_type)
                  : (notificationIcons[notification.type] || FiBell)
                
                const iconStyles = notificationColors[notification.type] || 'text-blue-500 bg-blue-50'
                const isSelected = selectedNotifications.has(notification.id)
                
                return (
                  <div
                    key={notification.id}
                    className={`group transition-all duration-200 hover:bg-slate-50 relative ${
                      !notification.is_read 
                        ? 'bg-gradient-to-r from-blue-50/50 to-transparent border-l-4 border-l-blue-500' 
                        : ''
                    } ${isSelected ? 'bg-blue-50 border-l-4 border-l-blue-400' : ''}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                          <div className={`p-3 rounded-2xl ${iconStyles} flex-shrink-0 shadow-sm`}>
                            <IconComponent size={20} />
                          </div>
                        </div>
                        
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-slate-800 text-lg">
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full animate-pulse shadow-sm"></div>
                            )}
                            <div className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                              {notificationTypes[notification.type]}
                            </div>
                          </div>
                          
                          <p className="text-slate-600 mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {/* Enhanced metadata display for proximity alerts */}
                          {notification.type === 'proximity_alert' && notification.metadata && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 mb-3">
                              <div className="flex items-center gap-2 text-blue-800 font-medium text-sm">
                                <FiMapPin size={16} />
                                <span>
                                  {notification.metadata.location_name && (
                                    <>📍 {notification.metadata.location_name}</>
                                  )}
                                  {notification.metadata.distance_km && (
                                    <> • {notification.metadata.distance_km}km away</>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {/* Enhanced metadata display for nearby wishlist location */}
                          {notification.type === 'nearby_wishlist_location' && notification.metadata && (
                            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-3 mb-3">
                              <div className="flex items-center gap-2 text-pink-800 font-medium text-sm">
                                <FiHeart size={16} />
                                <span>
                                  {notification.metadata.wishlist_item_name && (
                                    <>💖 {notification.metadata.wishlist_item_name}</>
                                  )}
                                  {notification.metadata.location_name && (
                                    <> • 📍 {notification.metadata.location_name}</>
                                  )}
                                  {notification.metadata.distance_km && (
                                    <> • {notification.metadata.distance_km}km away</>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                          
                          {notification.metadata?.post_title && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 mb-3">
                              <p className="text-blue-800 font-medium text-sm">
                                📝 Related Post: {notification.metadata.post_title}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between text-sm">
                            <p className="text-slate-500 font-medium">
                              {formatRelativeTime(notification.created_at)}
                            </p>
                            
                            {notification.metadata?.user_name && (
                              <p className="text-slate-500">
                                by <span className="font-medium">{notification.metadata.user_name}</span>
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="p-2 hover:bg-green-100 rounded-xl transition-colors"
                              title="Mark as read"
                            >
                              <FiCheck size={18} className="text-green-600" />
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="p-2 hover:bg-red-100 rounded-xl transition-colors"
                            title="Delete notification"
                          >
                            <FiTrash2 size={18} className="text-red-600" />
                            </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}