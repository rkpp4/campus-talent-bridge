import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { Save, User } from "lucide-react";

export function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    fetchProfileData();
  }, [profile?.id, profile?.role]);

  const fetchProfileData = async () => {
    if (!profile?.id) return;

    if (profile.role === "student") {
      const { data } = await supabase
        .from("student_profiles")
        .select("*")
        .eq("id", profile.id)
        .maybeSingle();
      setProfileData(data || {});
    } else if (profile.role === "mentor") {
      const { data } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("id", profile.id)
        .maybeSingle();
      setProfileData(data || {});
    } else if (profile.role === "startup") {
      const { data } = await supabase
        .from("startup_profiles")
        .select("*")
        .eq("id", profile.id)
        .maybeSingle();
      setProfileData(data || {});
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (profile?.role === "student") {
        await supabase.from("student_profiles").upsert({
          id: profile.id,
          ...profileData,
          skills:
            typeof profileData.skills === "string"
              ? profileData.skills.split(",").map((s: string) => s.trim())
              : profileData.skills,
        });
      } else if (profile?.role === "mentor") {
        await supabase.from("mentor_profiles").upsert({
          id: profile.id,
          ...profileData,
          expertise:
            typeof profileData.expertise === "string"
              ? profileData.expertise.split(",").map((s: string) => s.trim())
              : profileData.expertise,
        });
      } else if (profile?.role === "startup") {
        await supabase.from("startup_profiles").upsert({
          id: profile.id,
          ...profileData,
        });
      }

      await refreshProfile();
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Profile Settings
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {profile?.full_name}
            </h2>
            <p className="text-gray-600 capitalize">
              {profile?.role?.replace("_", " ")}
            </p>
          </div>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded ${
              message.includes("Error")
                ? "bg-red-50 text-red-700"
                : "bg-green-50 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {profile?.role === "student" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={profileData?.bio || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(profileData?.skills)
                      ? profileData.skills.join(", ")
                      : profileData?.skills || ""
                  }
                  onChange={(e) =>
                    setProfileData({ ...profileData, skills: e.target.value })
                  }
                  placeholder="React, Node.js, Python"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Major
                </label>
                <input
                  type="text"
                  value={profileData?.major || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, major: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={profileData?.graduation_year || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      graduation_year: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {profile?.role === "mentor" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={profileData?.bio || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expertise (comma-separated)
                </label>
                <input
                  type="text"
                  value={
                    Array.isArray(profileData?.expertise)
                      ? profileData.expertise.join(", ")
                      : profileData?.expertise || ""
                  }
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      expertise: e.target.value,
                    })
                  }
                  placeholder="Web Development, Machine Learning"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={profileData?.years_of_experience || 0}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      years_of_experience: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={profileData?.linkedin_url || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      linkedin_url: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          {profile?.role === "startup" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={profileData?.company_name || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      company_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={profileData?.description || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={profileData?.industry || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, industry: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={profileData?.location || ""}
                  onChange={(e) =>
                    setProfileData({ ...profileData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  value={profileData?.website_url || ""}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      website_url: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? "Saving..." : "Save Changes"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
