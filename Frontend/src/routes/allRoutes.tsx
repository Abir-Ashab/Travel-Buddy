import { Route, Routes } from 'react-router-dom';
import FrontPage from '../components/globalFiles/frontPage';
import RegisterPage from '../components/auth/registerPage';
import LoginPage from '../components/auth/loginPage';
import PostsList from '../components/posts/postsList';
import CreatePost from '../components/posts/createPost';

export default function AllRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FrontPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/posts" element={<PostsList />} />
      <Route path="/create-post" element={<CreatePost />} />
    </Routes>
  );
}
