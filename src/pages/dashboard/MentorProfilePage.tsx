import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { BookSession } from "@/components/BookSession";
import { MentorScheduler } from "@/components/MentorScheduler";
import {
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Github,
  Linkedin,
  Mail,
  MessageCircle,
  Calendar,
  Award,
} from "lucide-react";

interface MentorProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  bio?: string;
  expertise?: string[];
  availability?: string;
  linkedin_url?: string;
  github_url?: string;
  years_of_experience?: number;
  created_at: string;
}

export function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMentorProfile();
    }
  }, [id]);

  const fetchMentorProfile = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;

      const { data: mentorData } = await supabase
        .from("mentor_profiles")
        .select("*")
        .eq("id", id)
        .single();

      setMentor({
        ...profileData,
        ...mentorData,
      });
    } catch (error) {
      console.error("Error fetching mentor profile:", error);
      toast({
        title: "Error",
        description: "Failed to load mentor profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorship = async () => {
    if (!profile || !id) return;

    try {
      const { error } = await supabase.from("mentorship_requests").insert({
        student_id: profile.id,
        mentor_id: id,
        topic: "General Mentorship Request",
        message: `Hi ${mentor?.full_name}, I would like to connect with you for mentorship.`,
        status: "pending",
      });

      if (error) throw error;

      // Create notification for mentor
      await supabase.from("notifications").insert({
        user_id: id,
        title: "New Mentorship Request",
        message: `${profile.full_name} has requested mentorship from you.`,
      });

      toast({
        title: "Success",
        description: "Mentorship request sent successfully!",
      });
    } catch (error) {
      console.error("Error requesting mentorship:", error);
      toast({
        title: "Error",
        description: "Failed to send mentorship request",
        variant: "destructive",
      });
    }
  };

  const handleStartConversation = async () => {
    if (!profile || !id) return;

    try {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from("chat_conversations")
        .select("id")
        .or(`mentor_id.eq.${id},student_id.eq.${id}`)
        .or(`mentor_id.eq.${profile.id},student_id.eq.${profile.id}`)
        .single();

      if (existingConv) {
        navigate("/dashboard/messages");
        return;
      }

      // Create new conversation
      const { error } = await supabase.from("chat_conversations").insert({
        mentor_id: profile.role === "mentor" ? profile.id : id,
        student_id: profile.role === "student" ? profile.id : id,
      });

      if (error) throw error;

      navigate("/dashboard/messages");
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Mentor not found</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Profile Header Card */}
      <Card className="p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <Avatar className="w-32 h-32">
            <div className="w-full h-full bg-primary/10 flex items-center justify-center">
              <span className="text-4xl font-bold text-primary">
                {mentor.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          </Avatar>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{mentor.full_name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="capitalize">{mentor.role}</span>
                </div>
                {mentor.years_of_experience && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="w-4 h-4" />
                    <span>{mentor.years_of_experience}+ years of experience</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {profile?.role === "student" && (
                  <>
                    <Button onClick={handleRequestMentorship}>
                      <Mail className="w-4 h-4 mr-2" />
                      Request Mentorship
                    </Button>
                    <BookSession mentorId={id!} mentorName={mentor.full_name} />
                    <Button variant="outline" onClick={handleStartConversation}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              {mentor.linkedin_url && (
                <a
                  href={mentor.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {mentor.github_url && (
                <a
                  href={mentor.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-gray-900"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* About Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          About
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {mentor.bio || "No bio available"}
        </p>
      </Card>

      {/* Expertise Section */}
      {mentor.expertise && mentor.expertise.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Expertise & Skills</h2>
          <div className="flex flex-wrap gap-2">
            {mentor.expertise.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Availability Section */}
      <MentorScheduler mentorId={id} />
    </div>
  );
}
