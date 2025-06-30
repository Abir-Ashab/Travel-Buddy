import { useState } from 'react'
import { login } from '../../services/auth'
import { useNavigate } from 'react-router-dom'

interface LoginData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [form, setForm] = useState<LoginData>({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await login(form);
      console.log("res: ", res);
      
      localStorage.setItem('token', res.data.accessToken);
      navigate('/posts');
    } catch (err) {
      console.error(err);
      alert('Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">Login</h2>
        <input
          name="email"
          placeholder="Email"
          type="email"
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
        />
        <button className="bg-green-600 text-white px-4 py-2 rounded w-full">Login</button>
      </form>
    </div>
  )
}
