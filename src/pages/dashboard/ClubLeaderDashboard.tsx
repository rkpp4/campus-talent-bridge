import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { Users, CheckCircle, XCircle, Calendar, Plus } from "lucide-react";

export function ClubLeaderDashboard() {
  const { profile } = useAuth();
  const [club, setClub] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
  });

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  const fetchData = async () => {
    const { data: clubData } = await supabase
      .from("clubs")
      .select("*")
      .eq("leader_id", profile?.id || "")
      .maybeSingle();
    setClub(clubData);

    if (clubData) {
      const [membersRes, eventsRes] = await Promise.all([
        supabase
          .from("club_members")
          .select("*, profiles(full_name)")
          .eq("club_id", clubData.id),
        supabase
          .from("club_events")
          .select("*")
          .eq("club_id", clubData.id)
          .order("event_date", { ascending: true }),
      ]);
      setMembers(membersRes.data || []);
      setEvents(eventsRes.data || []);
    }
  };

  const handleMemberStatus = async (
    memberId: string,
    status: "approved" | "rejected"
  ) => {
    await supabase.from("club_members").update({ status }).eq("id", memberId);
    fetchData();
  };

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("club_events").insert({
      ...eventData,
      club_id: club?.id,
      created_by: profile?.id,
    });
    setShowEventForm(false);
    setEventData({ title: "", description: "", event_date: "", location: "" });
    fetchData();
  };

  if (!club) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 mb-4">You don't have a club yet</p>
        <p className="text-sm text-gray-500">Contact admin to create a club</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{club.name}</h1>
      <p className="text-gray-600 mb-6">{club.description}</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Members</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {members.filter((m) => m.status === "approved").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Pending Requests</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {members.filter((m) => m.status === "pending").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Upcoming Events</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {events.length}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Membership Requests
            </h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {members.filter((m) => m.status === "pending").length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No pending requests
              </div>
            ) : (
              members
                .filter((m) => m.status === "pending")
                .map((member) => (
                  <div
                    key={member.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <span className="font-medium text-gray-900">
                      {member.profiles?.full_name}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          handleMemberStatus(member.id, "approved")
                        }
                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          handleMemberStatus(member.id, "rejected")
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Events</h2>
            <button
              onClick={() => setShowEventForm(true)}
              className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="p-6 text-center text-gray-600">
                No events scheduled
              </div>
            ) : (
              events.map((event) => (
                <div key={event.id} className="p-4">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {event.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                    </span>
                    {event.location && <span>{event.location}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showEventForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Create Event
            </h2>
            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={eventData.title}
                  onChange={(e) =>
                    setEventData({ ...eventData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={eventData.description}
                  onChange={(e) =>
                    setEventData({ ...eventData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventData.event_date}
                  onChange={(e) =>
                    setEventData({ ...eventData, event_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={eventData.location}
                  onChange={(e) =>
                    setEventData({ ...eventData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
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
