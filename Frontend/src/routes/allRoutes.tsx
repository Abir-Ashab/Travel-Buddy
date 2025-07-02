import { Route, Routes } from 'react-router-dom';
import Layout from '../components/layout/Layout';
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
// import TravelPlansPage from '../components/travelPlans/travelPlansPage';

export default function AllRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/features" element={<FeaturedPosts />} />

      <Route element={<Layout />}>
        <Route path="/posts" element={<PostsList />} />
        <Route path="/posts/:id" element={<PostDetails />} /> 
        <Route path="/create-post" element={<CreatePost onPostCreated={() => {}} />} />
        <Route path="/edit-post/:id" element={<EditPost />} /> 
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/upgrade" element={<UpgradeTraveler />} />
        <Route path='/edit-profile' element={<EditProfile/>}/>
        <Route path="/wishlists" element={<WishlistDashboard />} />
        {/* <Route path="/travel-plans" element={<TravelPlansPage />} />  */}
      </Route>
    </Routes>
  );
}