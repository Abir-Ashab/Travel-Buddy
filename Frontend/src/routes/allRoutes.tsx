import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AdminLayout from '../components/layout/adminLayout'; 
import FrontPage from '../components/globalFiles/frontPage';
import RegisterPage from '../components/auth/registerPage';
import LoginPage from '../components/auth/loginPage';
import PostsList from '../components/posts/postsList';
import CreatePost from '../components/posts/createPost';
import EditPost from '../components/posts/editPosts'; 
import UpgradeTraveler from '../components/profile/upgradeTraveller';
import FeaturedPosts from '../components/posts/featurePosts';
import MyPosts from '../components/posts/myPost';
import EditProfile from '../components/profile/editProfile';
import PostDetails from '../components/posts/postDetail';
import WishlistDashboard from '../components/wishlists/wishlistDashboard';
import TripPlansDashboard from '../components/trip/tripDashboard';
import TripDetailsPage from '../components/trip/tripDetails';
import ProximitySettings from '../components/profile/proximitySettings';
import TravelExplorer from '../components/travelPlace/travelExplorer';
import SavedLikedPosts from '../components/posts/savedLikedPosts';
import AdminDashboard from '../components/admin/adminDashboard';
import ProtectedRoute from '../components/auth/protectedRoute';
import Notifications from '../components/notifications/fetchNotification';
import TripInvitesComponent from '../components/trip/tripInvites';
import CommunityMembers from '../components/globalFiles/communityMembers';
export default function AllRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/features" element={<FeaturedPosts />} />
      <Route path="/community" element={< CommunityMembers/>} />

      <Route element={<Layout />}>
        <Route path="/posts" element={<PostsList />} />
        <Route path="/posts/:id" element={<PostDetails />} /> 
        <Route path="/create-post" element={<CreatePost onPostCreated={() => {}} />} />
        <Route path="/edit-post/:id" element={<EditPost />} /> 
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/upgrade" element={<UpgradeTraveler />} />
        <Route path='/edit-profile' element={<EditProfile/>}/>
        <Route path="/wishlists" element={<WishlistDashboard />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/travel-plans" element={<TripPlansDashboard />} />
        <Route path="/travel-plans/:id" element={<TripDetailsPage />} />
        <Route path='/proximity-settings' element={<ProximitySettings/>}/>
        <Route path="/travel-places" element={<TravelExplorer />} />
        <Route path="/travel-places/invites" element={<TripInvitesComponent />} />
        <Route path="/saved-liked-posts" element={<SavedLikedPosts />} />
      </Route>

      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}