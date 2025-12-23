import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationProgress } from "@/components/ApplicationProgress";
import { Briefcase, Building2, Calendar, MapPin } from "lucide-react";

interface Application {
  id: string;
  status: string;
  cover_letter: string;
  created_at: string;
  internships: {
    id: string;
    title: string;
    description: string;
    location: string;
    duration: string;
    profiles: {
      full_name: string;
    };
  };
}

export function MyApplicationsPage() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchApplications();
    }
  }, [profile?.id]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("internship_applications")
      .select(`
        *,
        internships (
          id,
          title,
          description,
          location,
          duration,
          profiles (full_name)
        )
      `)
      .eq("student_id", profile?.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setApplications(data as Application[]);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">My Applications</h1>
        <p className="text-muted-foreground">Track the progress of your internship applications</p>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Applications Yet</h3>
            <p className="text-muted-foreground">
              Start applying to internships to see your applications here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">{app.internships?.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Building2 className="w-4 h-4" />
                      <span>{app.internships?.profiles?.full_name}</span>
                    </div>
                  </div>
                  <ApplicationProgress status={app.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ApplicationProgress status={app.status} showSteps />

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{app.internships?.location || "Remote"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Applied {new Date(app.created_at).toLocaleDateString()}</span>
                  </div>
                  {app.internships?.duration && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                      <span>{app.internships.duration}</span>
                    </div>
                  )}
                </div>

                {app.cover_letter && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Your Cover Letter</h4>
                    <p className="text-sm text-muted-foreground">{app.cover_letter}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
