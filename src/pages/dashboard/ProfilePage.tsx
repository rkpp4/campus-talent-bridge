import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "../../contexts/AuthContext";
import { Save, User, Upload, FileText, Video, Loader2, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  studentProfileSchema,
  mentorProfileSchema,
  startupProfileSchema,
} from "@/lib/validations";

export function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profileData, setProfileData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const { toast } = useToast();

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Delete old avatar if exists
      if (profile.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      await refreshProfile();
      
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingResume(true);

    try {
      // Delete old resume if exists
      if (profileData?.resume_url) {
        const oldPath = profileData.resume_url.split('/').slice(-2).join('/');
        await supabase.storage.from('chat-files').remove([oldPath]);
      }

      // Upload new resume
      const fileName = `resumes/${profile.id}/${Date.now()}_${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      // Update student profile
      const { error: updateError } = await supabase
        .from('student_profiles')
        .upsert({ id: profile.id, resume_url: publicUrl });

      if (updateError) throw updateError;

      setProfileData({ ...profileData, resume_url: publicUrl });
      
      toast({
        title: "Success",
        description: "Resume uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Error",
        description: "Failed to upload resume",
        variant: "destructive",
      });
    } finally {
      setUploadingResume(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile?.id) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a video smaller than 50MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingVideo(true);

    try {
      // Delete old video if exists
      if (profileData?.video_intro_url) {
        const oldPath = profileData.video_intro_url.split('/').slice(-2).join('/');
        await supabase.storage.from('chat-files').remove([oldPath]);
      }

      // Upload new video
      const fileExt = file.name.split('.').pop();
      const fileName = `videos/${profile.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      // Update student profile
      const { error: updateError } = await supabase
        .from('student_profiles')
        .upsert({ id: profile.id, video_intro_url: publicUrl });

      if (updateError) throw updateError;

      setProfileData({ ...profileData, video_intro_url: publicUrl });
      
      toast({
        title: "Success",
        description: "Video introduction uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Error",
        description: "Failed to upload video",
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const removeResume = async () => {
    if (!profile?.id || !profileData?.resume_url) return;

    try {
      const oldPath = profileData.resume_url.split('/').slice(-3).join('/');
      await supabase.storage.from('chat-files').remove([oldPath]);

      await supabase
        .from('student_profiles')
        .update({ resume_url: null })
        .eq('id', profile.id);

      setProfileData({ ...profileData, resume_url: null });
      
      toast({
        title: "Success",
        description: "Resume removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove resume",
        variant: "destructive",
      });
    }
  };

  const removeVideo = async () => {
    if (!profile?.id || !profileData?.video_intro_url) return;

    try {
      const oldPath = profileData.video_intro_url.split('/').slice(-3).join('/');
      await supabase.storage.from('chat-files').remove([oldPath]);

      await supabase
        .from('student_profiles')
        .update({ video_intro_url: null })
        .eq('id', profile.id);

      setProfileData({ ...profileData, video_intro_url: null });
      
      toast({
        title: "Success",
        description: "Video removed",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove video",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (profile?.role === "student") {
        const dataToValidate = {
          ...profileData,
          skills:
            typeof profileData.skills === "string"
              ? profileData.skills
              : profileData.skills?.join(", ") || "",
        };
        const validatedData = studentProfileSchema.parse(dataToValidate);

        await supabase.from("student_profiles").upsert({
          id: profile.id,
          ...validatedData,
          skills: validatedData.skills
            ? validatedData.skills.split(",").map((s: string) => s.trim())
            : [],
        });
      } else if (profile?.role === "mentor") {
        const dataToValidate = {
          ...profileData,
          expertise:
            typeof profileData.expertise === "string"
              ? profileData.expertise
              : profileData.expertise?.join(", ") || "",
        };
        const validatedData = mentorProfileSchema.parse(dataToValidate);

        await supabase.from("mentor_profiles").upsert({
          id: profile.id,
          ...validatedData,
          expertise: validatedData.expertise
            ? validatedData.expertise.split(",").map((s: string) => s.trim())
            : [],
        });
      } else if (profile?.role === "startup") {
        const validatedData = startupProfileSchema.parse(profileData);
        
        const { company_name, description, location, website_url } = validatedData;
        await supabase.from("startup_profiles").upsert({
          id: profile.id,
          company_name,
          description,
          location,
          website_url,
        });
      }

      await refreshProfile();
      setMessage("Profile updated successfully!");
    } catch (error: any) {
      if (error.errors) {
        setMessage(error.errors[0]?.message || "Validation error");
      } else {
        setMessage("Error updating profile");
      }
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
          <div className="flex flex-col items-center">
            <Avatar className="w-24 h-24 mb-4">
              <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            
            <div className="mb-4">
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploading}
              />
              <label htmlFor="avatar-upload">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  asChild
                >
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? "Uploading..." : "Change Photo"}
                  </span>
                </Button>
              </label>
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

              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume (PDF)
                </label>
                {profileData?.resume_url ? (
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-gray-50">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <a
                      href={profileData.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex-1 truncate"
                    >
                      View Resume
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeResume}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleResumeUpload}
                      disabled={uploadingResume}
                    />
                    <label htmlFor="resume-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingResume}
                        asChild
                      >
                        <span className="cursor-pointer">
                          {uploadingResume ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <FileText className="w-4 h-4 mr-2" />
                          )}
                          {uploadingResume ? "Uploading..." : "Upload Resume"}
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PDF only, max 5MB</p>
                  </div>
                )}
              </div>

              {/* Video Introduction Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video Introduction
                </label>
                {profileData?.video_intro_url ? (
                  <div className="space-y-2">
                    <video
                      src={profileData.video_intro_url}
                      controls
                      className="w-full max-h-48 rounded-md bg-black"
                    />
                    <div className="flex items-center gap-2">
                      <a
                        href={profileData.video_intro_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Open in new tab
                      </a>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeVideo}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      id="video-upload"
                      accept="video/*"
                      className="hidden"
                      onChange={handleVideoUpload}
                      disabled={uploadingVideo}
                    />
                    <label htmlFor="video-upload">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploadingVideo}
                        asChild
                      >
                        <span className="cursor-pointer">
                          {uploadingVideo ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Video className="w-4 h-4 mr-2" />
                          )}
                          {uploadingVideo ? "Uploading..." : "Upload Video"}
                        </span>
                      </Button>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Introduce yourself! Max 50MB, 2 minutes recommended
                    </p>
                  </div>
                )}
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
