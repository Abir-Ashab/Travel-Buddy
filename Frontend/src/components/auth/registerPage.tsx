import { useState } from 'react'
import { register } from '../../services/auth'
import { useNavigate } from 'react-router-dom'

interface FormData {
  name: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [form, setForm] = useState<FormData>({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
      alert('Registered! Now login.');
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert('Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl mb-4">Register</h2>
        <input
          name="name"
          placeholder="name"
          onChange={handleChange}
          className="border p-2 mb-4 w-full"
        />
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
        <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">Register</button>
      </form>
    </div>
  )
}
