import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

const categories = [
  { name: 'Digital', icon: '💻' },
  { name: 'Engineering', icon: '🛠️' },
  { name: 'Management', icon: '📈' },
  { name: 'Finance', icon: '💰' },
  { name: 'Marketing', icon: '📣' },
  { name: 'Design', icon: '🎨' },
];

const features = [
  {
    icon: '⚡',
    title: 'Ultra Performance',
    desc: 'Lightning-fast load times and seamless experience for all users.',
  },
  {
    icon: '🔍',
    title: 'Smart Search',
    desc: 'Advanced filters and AI-powered recommendations for jobs and candidates.',
  },
  {
    icon: '💼',
    title: 'Role-Based Dashboards',
    desc: 'Tailored experiences for both job seekers and recruiters.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    desc: 'Your data is protected with industry-leading security.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { role, loading } = useUserRole();

  useEffect(() => {
    if (user && !loading) {
      if (role === 'recruiter') navigate('/dashboard');
      else if (role === 'candidate') navigate('/candidate');
    }
  }, [user, role, loading, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white/80 shadow-lg backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="JobBoard Logo" className="h-8 w-8" />
          <span className="text-2xl font-bold text-blue-700 tracking-tight">JobBoard</span>
        </div>
        <div className="flex gap-6 items-center">
          <a href="#features" className="text-gray-700 hover:text-blue-700 font-medium transition">Features</a>
          <a href="#categories" className="text-gray-700 hover:text-blue-700 font-medium transition">Categories</a>
          <a href="#about" className="text-gray-700 hover:text-blue-700 font-medium transition">About</a>
          <button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:scale-105 transition"
            onClick={() => navigate('/auth')}
          >
            Login / Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-1 flex-col items-center justify-center text-center px-4 py-20 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="absolute top-0 left-0 w-full h-full opacity-10" viewBox="0 0 800 400" fill="none">
            <ellipse cx="400" cy="200" rx="400" ry="200" fill="#3b82f6" />
          </svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 mb-4 leading-tight drop-shadow-lg">
            The Modern Job Board<br />for Candidates & Recruiters
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover your next opportunity or top talent. Fast, beautiful, and built for the future of work.
          </p>
          <button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-xl text-xl font-semibold shadow-lg hover:scale-105 hover:shadow-2xl transition"
            onClick={() => navigate('/auth')}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat) => (
              <div key={cat.name} className="bg-blue-50 rounded-2xl p-6 text-center shadow hover:shadow-lg transition flex flex-col items-center">
                <span className="text-3xl mb-2">{cat.icon}</span>
                <span className="text-lg font-semibold text-blue-700">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-r from-blue-100 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-8 shadow hover:shadow-xl transition flex flex-col items-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-blue-700">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-gray-400 text-sm bg-white border-t mt-8">
        <div className="mb-2 flex justify-center gap-4">
          <a href="https://jobboard-128.webflow.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Inspired by JobBoard 128</a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">LinkedIn</a>
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">Twitter</a>
        </div>
        © {new Date().getFullYear()} JobBoard. All rights reserved.
      </footer>
    </div>
  );
} 