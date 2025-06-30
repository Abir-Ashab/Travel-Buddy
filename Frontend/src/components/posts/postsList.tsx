import { useEffect, useState } from 'react'
import api from '../../services/api'

interface Post {
  id: number;
  title: string;
  content: string;
}

export default function PostsList() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    api.get('/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Posts</h1>
      {posts.map(post => (
        <div key={post.id} className="border p-4 mb-4 rounded shadow">
          <h2 className="text-xl font-semibold">{post.title}</h2>
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  )
}
