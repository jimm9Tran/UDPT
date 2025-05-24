import { useState } from 'react';
import axios from 'axios';

export default function LoginPage() {
  const [form, setForm] = useState({
    username: '',
    password: ''
  });

  const [token, setToken] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/auth/login', form);
      setToken(res.data.access_token);
    } catch (error) {
      setToken('Đăng nhập thất bại');
    }
  };

  return (
    <div>
      <h2>Đăng nhập</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          onChange={handleChange}
        /><br />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
        /><br />
        <button type="submit">Đăng nhập</button>
      </form>
      <p>Token: {token}</p>
    </div>
  );
}
