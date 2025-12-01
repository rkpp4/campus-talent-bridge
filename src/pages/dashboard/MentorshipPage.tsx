import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { mentorshipRequestSchema } from "@/lib/validations";
import { Search, Users, Send } from "lucide-react";

export function MentorshipPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [formData, setFormData] = useState({ topic: "", message: "" });

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  const fetchData = async () => {
    if (!profile?.id) return;
    
    const [mentorsRes, requestsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .eq("role", "mentor"),
      supabase
        .from("mentorship_requests")
        .select("*, profiles!mentorship_requests_mentor_id_fkey(full_name)")
        .eq("student_id", profile.id),
    ]);
    
    // Fetch mentor profiles for each mentor
    const mentorIds = mentorsRes.data?.map(m => m.id) || [];
    const { data: mentorProfiles } = await supabase
      .from("mentor_profiles")
      .select("*")
      .in("id", mentorIds);
    
    // Combine mentor data with profiles
    const mentorsWithProfiles = (mentorsRes.data || []).map(mentor => {
      const profile = mentorProfiles?.find(mp => mp.id === mentor.id);
      return {
        ...profile,
        profiles: mentor,
        id: mentor.id
      };
    });
    
    setMentors(mentorsWithProfiles);
    setRequests(requestsRes.data || []);
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor || !profile?.id) return;

    try {
      const validatedData = mentorshipRequestSchema.parse(formData);

      const { error } = await supabase.from("mentorship_requests").insert({
        student_id: profile.id,
        mentor_id: selectedMentor.id,
        topic: validatedData.topic,
        message: validatedData.message,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Mentorship request sent successfully",
      });
      setSelectedMentor(null);
      setFormData({ topic: "", message: "" });
      fetchData();
    } catch (error: any) {
      if (error.errors) {
        toast({
          title: "Validation Error",
          description: error.errors[0]?.message || "Invalid input",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send request",
          variant: "destructive",
        });
      }
    }
  };

  const filtered = mentors.filter(
    (m) =>
      m.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.expertise?.some((e: string) =>
        e.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mentorship</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search mentors by name or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filtered.length === 0 ? (
              <div className="col-span-2 text-center py-12 bg-white rounded-lg border">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Mentors Found
                </h3>
                <p className="text-gray-600">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "No mentors are currently available. Check back later!"}
                </p>
              </div>
            ) : (
              filtered.map((mentor) => (
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
                        {mentor.years_of_experience || 0} years experience
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">
                    {mentor.bio || "No bio available"}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {mentor.expertise && mentor.expertise.length > 0 ? (
                      mentor.expertise
                        ?.slice(0, 3)
                        .map((exp: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {exp}
                          </span>
                        ))
                    ) : (
                      <span className="text-xs text-gray-500">
                        No expertise listed
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/dashboard/mentor/${mentor.id}`)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => setSelectedMentor(mentor)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Request
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm border sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              My Requests
            </h2>
            <div className="space-y-3">
              {requests.length === 0 ? (
                <p className="text-sm text-gray-600">No requests yet</p>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm text-gray-900">
                        {req.profiles?.full_name}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          req.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : req.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{req.topic}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedMentor && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Request Mentorship from {selectedMentor.profiles?.full_name}
            </h2>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  required
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  placeholder="What do you want to learn?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Tell the mentor why you're interested..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Request</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMentor(null);
                    setFormData({ topic: "", message: "" });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
