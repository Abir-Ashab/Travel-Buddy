import { Link, useNavigate } from 'react-router-dom'
import { FiCompass, FiMap, FiCamera, FiUsers, FiLogIn } from 'react-icons/fi'

export default function FrontPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <FiCompass className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">TravelBuddy</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/features" className="text-gray-600 hover:text-indigo-600">
                Features
              </Link>
              <Link to="/community" className="text-gray-600 hover:text-indigo-600">
                Community
              </Link>
              <button 
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
              >
                <FiLogIn className="mr-2" />
                Join Now
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Share Your Travel Adventures
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Connect with fellow travelers, share experiences, and discover hidden gems around the world.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-lg"
          >
            Get Started - It's Free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 text-lg"
          >
            Log In
          </button>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why TravelBuddy?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FiMap className="h-10 w-10 text-indigo-600" />,
                title: "Track Your Journeys",
                description: "Document your travels with photos, stories, and locations."
              },
              {
                icon: <FiUsers className="h-10 w-10 text-indigo-600" />,
                title: "Connect with Travelers",
                description: "Find like-minded explorers and share tips."
              },
              {
                icon: <FiCamera className="h-10 w-10 text-indigo-600" />,
                title: "Showcase Your Adventures",
                description: "Build a beautiful profile of your travel experiences."
              }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-gray-50">
                <div className="mx-auto h-12 w-12 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}