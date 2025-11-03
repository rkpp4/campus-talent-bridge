import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { Search, Users, Calendar } from "lucide-react";

export function ClubsPage() {
  const { profile } = useAuth();
  const [clubs, setClubs] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [profile?.id]);

  const fetchData = async () => {
    const [clubsRes, myClubsRes] = await Promise.all([
      supabase
        .from("clubs")
        .select("*, profiles(full_name)")
        .eq("is_approved", true),
      supabase
        .from("club_members")
        .select("*, clubs(*)")
        .eq("student_id", profile?.id || ""),
    ]);
    setClubs(clubsRes.data || []);
    setMyClubs(myClubsRes.data || []);
  };

  const handleJoin = async (clubId: string) => {
    await supabase.from("club_members").insert({
      club_id: clubId,
      student_id: profile?.id,
    });
    fetchData();
  };

  const isMember = (clubId: string) => {
    return myClubs.some((m) => m.club_id === clubId);
  };

  const filtered = clubs.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Clubs</h1>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clubs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {myClubs.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Clubs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myClubs.map((membership) => (
              <div
                key={membership.id}
                className="bg-white p-6 rounded-lg shadow-sm border"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {membership.clubs?.name}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {membership.clubs?.description}
                </p>
                <span
                  className={`inline-block text-xs px-2 py-1 rounded ${
                    membership.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : membership.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {membership.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <h2 className="text-xl font-semibold text-gray-900 mb-4">All Clubs</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((club) => {
          const joined = isMember(club.id);
          return (
            <div
              key={club.id}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {club.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Led by {club.profiles?.full_name}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                {club.description}
              </p>
              {club.category && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mb-4 inline-block">
                  {club.category}
                </span>
              )}
              <button
                onClick={() => !joined && handleJoin(club.id)}
                disabled={joined}
                className={`w-full px-4 py-2 rounded-md ${
                  joined
                    ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {joined ? "Joined" : "Join Club"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
