import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Search, Users, Briefcase, FileText, Building2 } from "lucide-react";

export function ExplorePage() {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<
    "mentors" | "internships" | "projects" | "clubs"
  >("mentors");
  const [mentors, setMentors] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [mentorsRes, internshipsRes, projectsRes, clubsRes] =
      await Promise.all([
        supabase.from("mentor_profiles").select("*, profiles(id, full_name)"),
        supabase
          .from("internships")
          .select("*, startup_profiles(company_name)")
          .eq("is_active", true),
        supabase.from("micro_projects").select("*, profiles(full_name)"),
        supabase
          .from("clubs")
          .select("*, profiles(full_name)")
          .eq("is_approved", true),
      ]);

    setMentors(mentorsRes.data || []);
    setInternships(internshipsRes.data || []);
    setProjects(projectsRes.data || []);
    setClubs(clubsRes.data || []);
    setLoading(false);
  };

  const filteredMentors = mentors.filter(
    (m) =>
      m.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.expertise?.some((e: string) =>
        e.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  const filteredInternships = internships.filter(
    (i) =>
      i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProjects = projects.filter(
    (p) =>
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredClubs = clubs.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
        <p className="text-gray-600">
          Discover opportunities, mentors, projects, and clubs
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="mb-6 flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("mentors")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
            activeTab === "mentors"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mentors ({filteredMentors.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("internships")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
            activeTab === "internships"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Internships ({filteredInternships.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
            activeTab === "projects"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Projects ({filteredProjects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("clubs")}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md whitespace-nowrap transition-colors ${
            activeTab === "clubs"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border hover:bg-gray-50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Clubs ({filteredClubs.length})</span>
        </button>
      </div>

      {activeTab === "mentors" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <div
              key={mentor.id}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-semibold">
                    {mentor.profiles?.full_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {mentor.profiles?.full_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {mentor.years_of_experience} years experience
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                {mentor.bio}
              </p>
              <div className="flex flex-wrap gap-2">
                {mentor.expertise
                  ?.slice(0, 3)
                  .map((exp: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      {exp}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "internships" && (
        <div className="space-y-4">
          {filteredInternships.map((internship) => (
            <div
              key={internship.id}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {internship.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {internship.startup_profiles?.company_name}
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded">
                  {internship.stipend || "Unpaid"}
                </span>
              </div>
              <p className="text-gray-700 mb-4 line-clamp-2">
                {internship.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {internship.skills_required?.map(
                  (skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "projects" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {project.title}
              </h3>
              <p className="text-sm text-gray-600 mb-1">
                by {project.profiles?.full_name}
              </p>
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {project.tech_stack
                  ?.slice(0, 4)
                  .map((tech: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "clubs" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClubs.map((club) => (
            <div
              key={club.id}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {club.name}
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Led by {club.profiles?.full_name}
              </p>
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {club.description}
              </p>
              {club.category && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {club.category}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {((activeTab === "mentors" && filteredMentors.length === 0) ||
        (activeTab === "internships" && filteredInternships.length === 0) ||
        (activeTab === "projects" && filteredProjects.length === 0) ||
        (activeTab === "clubs" && filteredClubs.length === 0)) && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No results found</p>
        </div>
      )}
    </div>
  );
}
