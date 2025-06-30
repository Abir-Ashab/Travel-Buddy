import { useState } from 'react'
import api from '../../services/api'
import { useNavigate } from 'react-router-dom'

interface PostData {
  title: string;
  content: string;
}

export default function CreatePost() {
  const [form, setForm] = useState<PostData>({ title: '', content: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/posts', form);
      alert('Post created!');
      navigate('/posts');
    } catch (err) {
      console.error(err);
      alert('Failed to create post.');
    }
  };

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <h1 className="text-2xl mb-4">Create Post</h1>
        <input
          name="title"
          placeholder="Title"
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
        />
        <textarea
          name="content"
          placeholder="Content"
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Create</button>
      </form>
    </div>
  )
}
