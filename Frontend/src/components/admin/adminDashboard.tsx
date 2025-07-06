import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  MapPin, 
  AlertTriangle, 
  Bell, 
  TrendingUp,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Star,
  Flag
} from 'lucide-react';
import api from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalReports: number;
  totalLocations: number;
  activeUsers: number;
  blockedUsers: number;
  featuredPosts: number;
  pendingReports: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  contact_number?: string;
  bio?: string;
}

interface Post {
  id: number;
  title: string;
  user_id: number;
  location_id: number;
  status: string;
  is_featured: boolean;
  likes_count: number;
  saves_count: number;
  shares_count: number;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
  location?: {
    name: string;
    country: string;
  };
}

interface Report {
  id: number;
  reporter_id: number;
  post_id: number;
  reason: string;
  description: string;
  status: string;
  created_at: string;
  reporter?: {
    name: string;
    email: string;
  };
  post?: {
    title: string;
  };
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'posts' | 'reports'>('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalReports: 0,
    totalLocations: 0,
    activeUsers: 0,
    blockedUsers: 0,
    featuredPosts: 0,
    pendingReports: 0
  });
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchUsers(),
        fetchPosts(),
        fetchReports(),
        fetchLocations()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Note: You might need to create a specific admin endpoint for user management
      const response = await api.get('/users/all'); // Assuming this endpoint exists
      if (response.data.success) {
        const usersData = response.data.data || [];
        setUsers(usersData);
        
        // Calculate stats
        const activeUsers = usersData.filter((user: User) => user.status === 'active').length;
        const blockedUsers = usersData.filter((user: User) => user.status === 'blocked').length;
        
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          activeUsers,
          blockedUsers
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await api.get('/posts');
      if (response.data.success) {
        const postsData = response.data.data.posts || [];
        setPosts(postsData);
        
        const featuredPosts = postsData.filter((post: Post) => post.is_featured).length;
        
        setStats(prev => ({
          ...prev,
          totalPosts: postsData.length,
          featuredPosts
        }));
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.get('/users/reports');
      if (response.data.success) {
        const reportsData = response.data.data.reports || [];
        setReports(reportsData);
        
        const pendingReports = reportsData.filter((report: Report) => report.status === 'pending').length;
        
        setStats(prev => ({
          ...prev,
          totalReports: reportsData.length,
          pendingReports
        }));
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations');
      if (response.data.success) {
        const locationsData = response.data.data || [];
        setStats(prev => ({
          ...prev,
          totalLocations: locationsData.length
        }));
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const handleUserStatusToggle = async (userId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
      const response = await api.put('/users/status', {
        user_id: userId,
        status: newStatus
      });
      
      if (response.data.success) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ));
        await fetchUsers(); // Refresh stats
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

  const handlePostFeatureToggle = async (postId: number, currentFeatured: boolean) => {
    try {
      const response = await api.patch(`/posts/${postId}/feature`);
      
      if (response.data.success) {
        setPosts(posts.map(post => 
          post.id === postId ? { ...post, is_featured: !currentFeatured } : post
        ));
        await fetchPosts(); // Refresh stats
      }
    } catch (error) {
      console.error('Error toggling post feature:', error);
      setError('Failed to toggle post feature');
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await api.delete(`/posts/${postId}`);
      
      if (response.data.success) {
        setPosts(posts.filter(post => post.id !== postId));
        await fetchPosts(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  };

  const handleReportAction = async (reportId: number, action: 'resolve' | 'delete') => {
    try {
      let response;
      if (action === 'resolve') {
        response = await api.put(`/users/reports/${reportId}`, { status: 'resolved' });
      } else {
        response = await api.delete(`/users/reports/${reportId}`);
      }
      
      if (response.data.success) {
        if (action === 'resolve') {
          setReports(reports.map(report => 
            report.id === reportId ? { ...report, status: 'resolved' } : report
          ));
        } else {
          setReports(reports.filter(report => report.id !== reportId));
        }
        await fetchReports(); // Refresh stats
      }
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      setError(`Failed to ${action} report`);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: { 
    title: string; 
    value: number; 
    icon: React.ElementType; 
    color: string; 
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button onClick={() => setError(null)} className="float-right">×</button>
        </div>
      )}

      <div className="bg-white shadow">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'users', label: 'Users', icon: Users },
              { key: 'posts', label: 'Posts', icon: FileText },
              { key: 'reports', label: 'Reports', icon: AlertTriangle },
            //   { key: 'locations', label: 'Locations', icon: MapPin }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-500" />
              <StatCard title="Active Users" value={stats.activeUsers} icon={UserCheck} color="bg-green-500" />
              <StatCard title="Total Posts" value={stats.totalPosts} icon={FileText} color="bg-purple-500" />
              <StatCard title="Pending Reports" value={stats.pendingReports} icon={AlertTriangle} color="bg-red-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Blocked Users" value={stats.blockedUsers} icon={UserX} color="bg-red-500" />
              <StatCard title="Featured Posts" value={stats.featuredPosts} icon={Star} color="bg-yellow-500" />
              <StatCard title="Total Reports" value={stats.totalReports} icon={Flag} color="bg-orange-500" />
              <StatCard title="Locations" value={stats.totalLocations} icon={MapPin} color="bg-indigo-500" />
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'traveler' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleUserStatusToggle(user.id, user.status)}
                          className={`text-indigo-600 hover:text-indigo-900 mr-4 ${
                            user.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {user.status === 'active' ? 'Block' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Post Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Engagement</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{post.title}</div>
                          <div className="text-sm text-gray-500">
                            {post.location?.name}, {post.location?.country}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{post.user?.name}</div>
                        <div className="text-sm text-gray-500">{post.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {post.status}
                          </span>
                          {post.is_featured && (
                            <Star className="h-4 w-4 text-yellow-400 ml-2" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>👍 {post.likes_count} 💾 {post.saves_count} 📤 {post.shares_count}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handlePostFeatureToggle(post.id, post.is_featured)}
                          className="text-yellow-600 hover:text-yellow-900 mr-4"
                        >
                          {post.is_featured ? 'Unfeature' : 'Feature'}
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Report Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{report.reason}</div>
                          <div className="text-sm text-gray-500">{report.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.reporter?.name}</div>
                        <div className="text-sm text-gray-500">{report.reporter?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.post?.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {report.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleReportAction(report.id, 'resolve')}
                              className="text-green-600 hover:text-green-900 mr-4"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleReportAction(report.id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;