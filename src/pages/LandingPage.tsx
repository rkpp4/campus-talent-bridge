import { Link } from "react-router-dom";
import { Users, Briefcase, GraduationCap, Award } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">TalentBridge</h1>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Connect, Learn, and Grow
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              TalentBridge connects students, mentors, startups, and campus
              clubs in one professional ecosystem. Showcase your skills, find
              opportunities, and build your future.
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-md hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </section>

        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Features for Everyone
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  For Students
                </h4>
                <p className="text-gray-600">
                  Build your portfolio, showcase projects, apply for
                  internships, and connect with mentors.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Users className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  For Mentors
                </h4>
                <p className="text-gray-600">
                  Share your expertise, guide aspiring professionals, and make a
                  lasting impact.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Briefcase className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  For Startups
                </h4>
                <p className="text-gray-600">
                  Find talented students, post internships, and recruit from a
                  pool of motivated candidates.
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <Award className="w-12 h-12 text-blue-600 mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  For Clubs
                </h4>
                <p className="text-gray-600">
                  Manage memberships, organize events, and create a vibrant
                  campus community.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
