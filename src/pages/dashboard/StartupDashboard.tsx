import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Briefcase, Users, Eye, Edit, TrendingUp } from "lucide-react";

export function StartupDashboard() {
  const { profile } = useAuth();
  const [internships, setInternships] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    skills_required: "",
    duration: "",
    stipend: "",
    location: "",
    is_remote: false,
  });

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  const fetchData = async () => {
    const { data: internshipsData } = await supabase
      .from("internships")
      .select("*")
      .eq("startup_id", profile?.id || "")
      .order("created_at", { ascending: false });
    setInternships(internshipsData || []);

    if (internshipsData && internshipsData.length > 0) {
      const internshipIds = internshipsData.map((i) => i.id);
      const { data: appsData } = await supabase
        .from("internship_applications")
        .select("*, profiles(full_name), internships(title)")
        .in("internship_id", internshipIds);
      setApplications(appsData || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("internships").insert({
      ...formData,
      skills_required: formData.skills_required.split(",").map((s) => s.trim()),
      startup_id: profile?.id,
    });
    setShowForm(false);
    setFormData({
      title: "",
      description: "",
      skills_required: "",
      duration: "",
      stipend: "",
      location: "",
      is_remote: false,
    });
    fetchData();
  };

  const updateApplicationStatus = async (appId: string, status: string) => {
    await supabase
      .from("internship_applications")
      .update({ status })
      .eq("id", appId);
    fetchData();
  };

  const filteredApplications =
    statusFilter === "all"
      ? applications
      : applications.filter((app) => app.status === statusFilter);

  const stats = {
    applied: applications.filter((a) => a.status === "applied").length,
    shortlisted: applications.filter((a) => a.status === "shortlisted").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Startup Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage internships and recruit top talent
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Post Internship</span>
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Internships</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {internships.filter((i) => i.is_active).length}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {applications.length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.applied}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.accepted}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Post New Internship
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills Required (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills_required}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      skills_required: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: e.target.value })
                    }
                    placeholder="e.g. 3 months"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stipend
                  </label>
                  <input
                    type="text"
                    value={formData.stipend}
                    onChange={(e) =>
                      setFormData({ ...formData, stipend: e.target.value })
                    }
                    placeholder="e.g. $1000/month"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_remote}
                  onChange={(e) =>
                    setFormData({ ...formData, is_remote: e.target.checked })
                  }
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Remote Position</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Post Internship
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Your Internship Postings
            </h2>
          </div>
        </div>
        <div className="p-6">
          {internships.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No internships posted yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {internships.map((internship) => (
                <div key={internship.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {internship.title}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        internship.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {internship.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {internship.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {
                        applications.filter(
                          (a) => a.internship_id === internship.id
                        ).length
                      }{" "}
                      applications
                    </span>
                    <span className="text-blue-600">
                      {internship.stipend || "Unpaid"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Applications
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  statusFilter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStatusFilter("applied")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  statusFilter === "applied"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                New
              </button>
              <button
                onClick={() => setStatusFilter("shortlisted")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  statusFilter === "shortlisted"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Shortlisted
              </button>
              <button
                onClick={() => setStatusFilter("accepted")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  statusFilter === "accepted"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Accepted
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y">
          {filteredApplications.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No applications yet</p>
            </div>
          ) : (
            filteredApplications.map((app) => (
              <div key={app.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {app.profiles?.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Applied for: {app.internships?.title}
                    </p>
                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                      {app.cover_letter}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(app.applied_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="View details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <select
                      value={app.status}
                      onChange={(e) =>
                        updateApplicationStatus(app.id, e.target.value)
                      }
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="accepted">Accepted</option>
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Application Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Applicant</p>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedApp.profiles?.full_name}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Position</p>
                <p className="text-gray-900">
                  {selectedApp.internships?.title}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Applied On</p>
                <p className="text-gray-900">
                  {new Date(selectedApp.applied_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Cover Letter
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedApp.cover_letter}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">
                  Application Status
                </p>
                <select
                  value={selectedApp.status}
                  onChange={(e) => {
                    updateApplicationStatus(selectedApp.id, e.target.value);
                    setSelectedApp(null);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="applied">Applied</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                  <option value="accepted">Accepted</option>
                </select>
              </div>
            </div>
            <button
              onClick={() => setSelectedApp(null)}
              className="w-full mt-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
