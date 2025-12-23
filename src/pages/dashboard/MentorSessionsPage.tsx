import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MentorScheduler } from "@/components/MentorScheduler";
import { Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";

interface Session {
  id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string | null;
  mentor_id: string;
  student_id: string;
  student_profile?: { full_name: string };
  mentor_profile?: { full_name: string };
}

export function MentorSessionsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const isMentor = profile?.role === "mentor";

  useEffect(() => {
    if (profile?.id) {
      fetchSessions();
    }
  }, [profile?.id]);

  const fetchSessions = async () => {
    const query = supabase
      .from("mentorship_sessions")
      .select("*")
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (isMentor) {
      query.eq("mentor_id", profile?.id);
    } else {
      query.eq("student_id", profile?.id);
    }

    const { data, error } = await query;

    if (!error && data) {
      // Fetch profile names
      const sessionsWithNames = await Promise.all(
        data.map(async (session) => {
          const otherId = isMentor ? session.student_id : session.mentor_id;
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", otherId)
            .single();

          return {
            ...session,
            [isMentor ? "student_profile" : "mentor_profile"]: profileData,
          };
        })
      );
      setSessions(sessionsWithNames);
    }
    setLoading(false);
  };

  const updateSessionStatus = async (sessionId: string, status: string) => {
    try {
      await supabase
        .from("mentorship_sessions")
        .update({ status })
        .eq("id", sessionId);

      toast({ title: `Session marked as ${status}` });
      fetchSessions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const upcomingSessions = sessions.filter(
    (s) => s.status === "scheduled" && new Date(s.session_date) >= new Date()
  );
  const pastSessions = sessions.filter(
    (s) => s.status !== "scheduled" || new Date(s.session_date) < new Date()
  );

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
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isMentor ? "My Sessions" : "My Mentoring Sessions"}
        </h1>
        <p className="text-muted-foreground">
          {isMentor
            ? "Manage your availability and upcoming mentoring sessions"
            : "View your scheduled sessions with mentors"}
        </p>
      </div>

      {isMentor && (
        <MentorScheduler isEditable />
      )}

      {upcomingSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Sessions</h2>
          <div className="space-y-4">
            {upcomingSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {isMentor
                            ? session.student_profile?.full_name
                            : session.mentor_profile?.full_name}
                        </span>
                        <Badge variant="secondary">Scheduled</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(session.session_date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                        </div>
                      </div>
                      {session.notes && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    {isMentor && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateSessionStatus(session.id, "completed")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateSessionStatus(session.id, "cancelled")}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pastSessions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Past Sessions</h2>
          <div className="space-y-4">
            {pastSessions.map((session) => (
              <Card key={session.id} className="opacity-75">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">
                          {isMentor
                            ? session.student_profile?.full_name
                            : session.mentor_profile?.full_name}
                        </span>
                        <Badge
                          variant={session.status === "completed" ? "default" : "destructive"}
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(session.session_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {sessions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Sessions Yet</h3>
            <p className="text-muted-foreground">
              {isMentor
                ? "Set your availability above to allow students to book sessions"
                : "Book a session with a mentor to get started"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
