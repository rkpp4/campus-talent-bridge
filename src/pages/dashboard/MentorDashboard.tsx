import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import {
  Users,
  CheckCircle,
  XCircle,
  MessageSquare,
  TrendingUp,
} from "lucide-react";

export function MentorDashboard() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, completed: 0 });
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  const fetchData = async () => {
    const { data } = await supabase
      .from("mentorship_requests")
      .select("*, profiles!mentorship_requests_student_id_fkey(full_name)")
      .eq("mentor_id", profile?.id || "")
      .order("created_at", { ascending: false });

    setRequests(data || []);
    setStats({
      pending: data?.filter((r) => r.status === "pending").length || 0,
      approved: data?.filter((r) => r.status === "approved").length || 0,
      completed: data?.filter((r) => r.status === "completed").length || 0,
    });
    setLoading(false);
  };

  const handleRequest = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("mentorship_requests").update({ status }).eq("id", id);
    fetchData();
  };

  const filteredRequests =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

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
        <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your mentorship connections and guide students
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Pending Requests</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.pending}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Active Mentorships</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.approved}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats.completed}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Mentorship Requests
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === "pending"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  filter === "approved"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
            </div>
          </div>
        </div>
        <div className="divide-y">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No requests yet</p>
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div key={req.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {req.profiles?.full_name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          req.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : req.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : req.status === "completed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Topic: {req.topic}
                    </p>
                    <p className="text-sm text-gray-600">{req.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {req.status === "pending" && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleRequest(req.id, "approved")}
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRequest(req.id, "rejected")}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                  {req.status === "approved" && (
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="View details"
                    >
                      <MessageSquare className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Session with {selectedRequest.profiles?.full_name}
            </h2>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Topic:</strong> {selectedRequest.topic}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Message:</strong>
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                {selectedRequest.message}
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-900">
                Active mentorship session. Coordinate with the student to
                schedule regular check-ins and provide guidance.
              </p>
            </div>
            <button
              onClick={() => setSelectedRequest(null)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
