import { Link } from 'react-router-dom';

const FrontPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Your Next Adventure
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Plan, share, and explore travel experiences with a community of passionate travelers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition duration-300"
            >
              Join Now
            </Link>
            <Link
              to="/explore"
              className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:bg-opacity-10 transition duration-300"
            >
              Browse Destinations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FrontPage;
