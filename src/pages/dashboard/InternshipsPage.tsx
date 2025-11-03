import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Search, MapPin, Clock, DollarSign, Briefcase } from "lucide-react";

export function InternshipsPage() {
  const { profile } = useAuth();
  const [internships, setInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedInternship, setSelectedInternship] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  const fetchData = async () => {
    const [internshipsRes, applicationsRes] = await Promise.all([
      supabase
        .from("internships")
        .select("*, startup_profiles(company_name)")
        .eq("is_active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("internship_applications")
        .select("internship_id, status")
        .eq("student_id", profile?.id || ""),
    ]);
    setInternships(internshipsRes.data || []);
    setApplications(applicationsRes.data || []);
    setLoading(false);
  };

  const handleApply = async () => {
    if (!selectedInternship || !profile?.id) return;
    await supabase.from("internship_applications").insert({
      internship_id: selectedInternship.id,
      student_id: profile.id,
      cover_letter: coverLetter,
    });
    setSelectedInternship(null);
    setCoverLetter("");
    fetchData();
  };

  const hasApplied = (internshipId: string) => {
    return applications.some((app) => app.internship_id === internshipId);
  };

  const filtered = internships.filter(
    (i) =>
      i.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Internships</h1>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((internship) => {
          const applied = hasApplied(internship.id);
          return (
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
                {applied ? (
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                    Applied
                  </span>
                ) : (
                  <button
                    onClick={() => setSelectedInternship(internship)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Apply Now
                  </button>
                )}
              </div>
              <p className="text-gray-700 mb-4">{internship.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                {internship.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{internship.location}</span>
                  </div>
                )}
                {internship.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{internship.duration}</span>
                  </div>
                )}
                {internship.stipend && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{internship.stipend}</span>
                  </div>
                )}
              </div>
              {internship.skills_required?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {internship.skills_required.map(
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
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No internships found</p>
        </div>
      )}

      {selectedInternship && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Apply for {selectedInternship.title}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter
              </label>
              <textarea
                rows={6}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're interested in this position..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit Application
              </button>
              <button
                onClick={() => {
                  setSelectedInternship(null);
                  setCoverLetter("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
