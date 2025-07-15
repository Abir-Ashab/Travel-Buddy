import { Link, useNavigate } from 'react-router-dom'
import { FiCompass, FiMap, FiCamera, FiUsers, FiLogIn, FiStar, FiTrendingUp, FiGlobe } from 'react-icons/fi'
import { useState, useEffect } from 'react'

export default function FrontPage() {
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    const handleMouseMove = (e: any) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 opacity-20 transition-all duration-700"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
            rgba(99, 102, 241, 0.8) 0%, 
            rgba(168, 85, 247, 0.6) 25%, 
            rgba(236, 72, 153, 0.4) 50%, 
            rgba(0, 0, 0, 0.9) 100%)`
        }}
      />
   
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          >
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-60" />
          </div>
        ))}
      </div>

      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-purple-500/20' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center group">
              <div className="relative">
                <FiCompass className="h-10 w-10 text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text transform group-hover:rotate-180 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-lg group-hover:opacity-40 transition-opacity duration-300" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Travel-Buddy
              </span>
            </div>
            <div className="flex items-center space-x-8">
              <Link 
                to="/features" 
                className="text-gray-300 hover:text-purple-400 transition-colors duration-300 relative group"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
              </Link>
              <Link 
                to="/community" 
                className="text-gray-300 hover:text-purple-400 transition-colors duration-300 relative group"
              >
                Community
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 group-hover:w-full transition-all duration-300" />
              </Link>
              <button 
                onClick={() => navigate('/register')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 flex items-center shadow-lg hover:shadow-purple-500/25"
              >
                <FiLogIn className="mr-2" />
                Join Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-500/30 mb-8">
              <FiStar className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm text-purple-300">Joined Many Travel Enthusiasts</span>
            </div>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-black mb-8 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
              Share Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Adventures
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Connect with fellow travelers, share epic experiences, and discover 
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold"> hidden gems </span>
            around the world in a community that celebrates wanderlust.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <button
              onClick={() => navigate('/register')}
              className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 text-lg font-semibold shadow-2xl hover:shadow-purple-500/30 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center">
                <FiTrendingUp className="mr-2" />
                Start Your Journey
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 border-2 border-purple-500 text-purple-400 rounded-full hover:bg-purple-500/10 hover:border-purple-400 transform hover:scale-105 transition-all duration-300 text-lg font-semibold backdrop-blur-sm"
            >
              Sign In
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { number: "50K+", label: "Active Travelers" },
              { number: "200+", label: "Countries Covered" },
              { number: "1M+", label: "Photos Shared" }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.number}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Why Travel-Buddy?
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Experience travel sharing like never before with our cutting-edge platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiMap className="h-12 w-12" />,
                title: "Track Your Journeys",
                description: "Document your travels with stunning photos, compelling stories, and precise locations using our advanced mapping technology.",
                color: "from-blue-500 to-purple-500"
              },
              {
                icon: <FiUsers className="h-12 w-12" />,
                title: "Connect with Travelers",
                description: "Find like-minded explorers from around the globe and share insider tips, hidden gems, and unforgettable experiences.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <FiCamera className="h-12 w-12" />,
                title: "Showcase Adventures",
                description: "Build a stunning visual portfolio of your travel experiences with our professional-grade photo sharing tools.",
                color: "from-pink-500 to-red-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="relative p-8 rounded-2xl bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6 transform group-hover:rotate-12 transition-transform duration-500`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-32 bg-gradient-to-r from-purple-900 to-pink-900">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FiGlobe className="w-20 h-20 mx-auto mb-8 text-purple-400 animate-spin" style={{ animationDuration: '20s' }} />
          <h2 className="text-5xl font-bold mb-6 text-white">
            Ready to Share Your Story?
          </h2>
          <p className="text-xl text-purple-100 mb-12 leading-relaxed">
            Join thousands of travelers who are already sharing their adventures and discovering new destinations every day.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-12 py-6 bg-white text-purple-900 rounded-full hover:bg-purple-100 transform hover:scale-105 transition-all duration-300 text-xl font-bold shadow-2xl hover:shadow-white/20"
          >
            Start Your Adventure Today
          </button>
        </div>
      </div>
    </div>
  )
}