import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Briefcase,
  FileText,
  Building2,
  TrendingUp,
} from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    mentors: 0,
    startups: 0,
    clubs: 0,
    projects: 0,
    internships: 0,
    applications: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [
      usersRes,
      studentsRes,
      mentorsRes,
      startupsRes,
      clubsRes,
      projectsRes,
      internshipsRes,
      applicationsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "mentor"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "startup"),
      supabase.from("clubs").select("id", { count: "exact", head: true }),
      supabase
        .from("micro_projects")
        .select("id", { count: "exact", head: true }),
      supabase.from("internships").select("id", { count: "exact", head: true }),
      supabase
        .from("internship_applications")
        .select("id", { count: "exact", head: true }),
    ]);

    setStats({
      users: usersRes.count || 0,
      students: studentsRes.count || 0,
      mentors: mentorsRes.count || 0,
      startups: startupsRes.count || 0,
      clubs: clubsRes.count || 0,
      projects: projectsRes.count || 0,
      internships: internshipsRes.count || 0,
      applications: applicationsRes.count || 0,
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-600 mb-8">Platform overview and analytics</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.users}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

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
              <p className="text-sm text-gray-600">Internships</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.internships}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-600" />
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

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Students</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.students}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mentors</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.mentors}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Startups</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.startups}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activity Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Projects</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.projects}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Applications</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.applications}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Clubs</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.clubs}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Health
          </h3>
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">All systems operational</span>
          </div>
          <p className="text-sm text-gray-600">
            Platform is running smoothly with active engagement across all user
            types.
          </p>
        </div>
      </div>
    </div>
  );
}
