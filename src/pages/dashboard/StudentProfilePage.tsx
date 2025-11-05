import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowLeft, 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink,
  FileText,
  Code,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface StudentProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  student_profile: {
    bio: string | null;
    skills: string[] | null;
    github_url: string | null;
    linkedin_url: string | null;
    resume_url: string | null;
    portfolio_links: string[] | null;
  } | null;
}

interface Project {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[] | null;
  github_url: string | null;
  live_demo_url: string | null;
  rating: number | null;
  created_at: string;
}

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentProfile();
  }, [id]);

  const fetchStudentProfile = async () => {
    if (!id) return;

    try {
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          student_profile:student_profiles(
            bio,
            skills,
            github_url,
            linkedin_url,
            resume_url,
            portfolio_links
          )
        `)
        .eq("id", id)
        .single();

      if (profileError) throw profileError;

      const { data: projectsData, error: projectsError } = await supabase
        .from("micro_projects")
        .select("*")
        .eq("student_id", id)
        .order("created_at", { ascending: false });

      if (projectsError) throw projectsError;

      setStudent(profileData as any);
      setProjects(projectsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load student profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteToApply = async () => {
    toast({
      title: "Invitation Sent",
      description: `${student?.full_name} has been notified about your opportunity`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Student not found</p>
        <Button onClick={() => navigate(-1)} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Header Section */}
      <Card className="p-8 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
              {student.avatar_url ? (
                <img
                  src={student.avatar_url}
                  alt={student.full_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-primary">
                  {student.full_name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </div>

          <div className="flex-grow">
            <h1 className="text-3xl font-bold mb-2">{student.full_name}</h1>
            <p className="text-muted-foreground mb-4">
              {student.student_profile?.bio || "No bio available"}
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              {student.student_profile?.github_url && (
                <a
                  href={student.student_profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:text-primary"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {student.student_profile?.linkedin_url && (
                <a
                  href={student.student_profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:text-primary"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
              {student.student_profile?.resume_url && (
                <a
                  href={student.student_profile.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm hover:text-primary"
                >
                  <FileText className="w-4 h-4" />
                  Resume
                </a>
              )}
            </div>

            {(profile?.role === 'startup' || profile?.role === 'mentor') && (
              <Button onClick={handleInviteToApply} className="mt-2">
                <Mail className="w-4 h-4 mr-2" />
                {profile.role === 'startup' ? 'Invite to Apply' : 'Request Mentorship'}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Skills Section */}
      {student.student_profile?.skills && student.student_profile.skills.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Skills & Expertise
          </h2>
          <div className="flex flex-wrap gap-2">
            {student.student_profile.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Portfolio Links */}
      {student.student_profile?.portfolio_links && student.student_profile.portfolio_links.length > 0 && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Portfolio Links
          </h2>
          <div className="space-y-2">
            {student.student_profile.portfolio_links.map((link, idx) => (
              <a
                key={idx}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-primary hover:underline"
              >
                {link}
              </a>
            ))}
          </div>
        </Card>
      )}

      {/* Projects Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5" />
          Projects ({projects.length})
        </h2>
        {projects.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No projects yet</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{project.title}</h3>
                  {project.rating && (
                    <Badge variant="outline" className="ml-2">
                      ⭐ {project.rating}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {project.description}
                </p>
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tech_stack.slice(0, 4).map((tech, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-3 text-sm">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Github className="w-4 h-4" />
                      Code
                    </a>
                  )}
                  {project.live_demo_url && (
                    <a
                      href={project.live_demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
