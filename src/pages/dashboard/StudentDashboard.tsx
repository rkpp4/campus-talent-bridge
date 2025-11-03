import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import {
  FileText,
  Briefcase,
  Users,
  Building2,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";

export function StudentDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    projects: 0,
    applications: 0,
    mentorships: 0,
    clubs: 0,
  });
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [recentInternships, setRecentInternships] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [mentorshipStatus, setMentorshipStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.id) return;

      const [
        projectsRes,
        applicationsRes,
        mentorshipsRes,
        clubsRes,
        recentProjectsRes,
        internshipsRes,
      ] = await Promise.all([
        supabase
          .from("micro_projects")
          .select("id", { count: "exact", head: true })
          .eq("student_id", profile.id),
        supabase
          .from("internship_applications")
          .select("id", { count: "exact", head: true })
          .eq("student_id", profile.id),
        supabase
          .from("mentorship_requests")
          .select("id", { count: "exact", head: true })
          .eq("student_id", profile.id),
        supabase
          .from("club_members")
          .select("id", { count: "exact", head: true })
          .eq("student_id", profile.id)
          .eq("status", "approved"),
        supabase
          .from("micro_projects")
          .select("*")
          .eq("student_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("internships")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(3),
      ]);

      setStats({
        projects: projectsRes.count || 0,
        applications: applicationsRes.count || 0,
        mentorships: mentorshipsRes.count || 0,
        clubs: clubsRes.count || 0,
      });

      setRecentProjects(recentProjectsRes.data || []);
      setRecentInternships(internshipsRes.data || []);

      const { data: mentorshipData } = await supabase
        .from("mentorship_requests")
        .select("status")
        .eq("student_id", profile.id);
      setMentorshipStatus(mentorshipData || []);

      const activities = [
        ...(recentProjectsRes.data?.map((p: any) => ({
          type: "project",
          ...p,
        })) || []),
        ...(applicationsRes.data?.map((a: any) => ({
          type: "application",
          ...a,
        })) || []),
      ]
        .sort(
          (a, b) =>
            new Date(b.created_at || b.applied_at).getTime() -
            new Date(a.created_at || a.applied_at).getTime()
        )
        .slice(0, 5);
      setRecentActivity(activities);

      setLoading(false);
    };

    fetchData();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const pendingMentorships = mentorshipStatus.filter(
    (m) => m.status === "pending"
  ).length;
  const approvedMentorships = mentorshipStatus.filter(
    (m) => m.status === "approved"
  ).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's your activity overview and latest opportunities
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.projects}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Applications</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.applications}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Mentorships</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.mentorships}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clubs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.clubs}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Mentorship Status
            </h3>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-sm font-semibold text-green-600">
                {approvedMentorships}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Pending</span>
              <span className="text-sm font-semibold text-yellow-600">
                {pendingMentorships}
              </span>
            </div>
          </div>
          <Link
            to="/dashboard/mentorship"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            View all →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Quick Actions</h3>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-2">
            <Link
              to="/dashboard/projects"
              className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
            >
              + Create Project
            </Link>
            <Link
              to="/dashboard/internships"
              className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
            >
              + Browse Internships
            </Link>
            <Link
              to="/dashboard/clubs"
              className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded transition-colors"
            >
              + Join Clubs
            </Link>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">
              Profile Completion
            </h3>
            <CheckCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Profile</span>
              <span className="text-sm font-semibold text-blue-600">
                {stats.projects > 0 ? "75%" : "50%"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: stats.projects > 0 ? "75%" : "50%" }}
              ></div>
            </div>
          </div>
          <Link
            to="/dashboard/profile"
            className="block mt-4 text-sm text-blue-600 hover:text-blue-700"
          >
            Complete Profile →
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Projects
            </h2>
            <Link
              to="/dashboard/projects"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">No projects yet</p>
              <Link
                to="/dashboard/projects"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="p-3 border rounded-lg hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">{project.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tech_stack
                      ?.slice(0, 3)
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
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Latest Internships
            </h2>
            <Link
              to="/dashboard/internships"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          {recentInternships.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No internships available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentInternships.map((internship) => (
                <Link
                  key={internship.id}
                  to={`/dashboard/internships/${internship.id}`}
                  className="block p-3 border rounded-lg hover:bg-gray-50"
                >
                  <h3 className="font-medium text-gray-900">
                    {internship.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {internship.description}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {internship.location || "Remote"}
                    </span>
                    <span className="text-xs font-medium text-blue-600">
                      {internship.stipend || "Unpaid"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
