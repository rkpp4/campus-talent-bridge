import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, X, HelpCircle, Users } from "lucide-react";

interface EventRSVPProps {
  eventId: string;
  showCount?: boolean;
}

interface RSVPData {
  id: string;
  status: string;
  user_id: string;
  profiles?: { full_name: string };
}

export function EventRSVP({ eventId, showCount = true }: EventRSVPProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [rsvps, setRsvps] = useState<RSVPData[]>([]);
  const [userRsvp, setUserRsvp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRsvps();
  }, [eventId]);

  const fetchRsvps = async () => {
    const { data, error } = await supabase
      .from("event_rsvps")
      .select("*, profiles(full_name)")
      .eq("event_id", eventId);

    if (!error && data) {
      setRsvps(data);
      const myRsvp = data.find((r) => r.user_id === profile?.id);
      setUserRsvp(myRsvp?.status || null);
    }
  };

  const handleRsvp = async (status: string) => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "Please log in to RSVP",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (userRsvp === status) {
        // Remove RSVP
        await supabase
          .from("event_rsvps")
          .delete()
          .eq("event_id", eventId)
          .eq("user_id", profile.id);
        setUserRsvp(null);
        toast({ title: "RSVP removed" });
      } else {
        // Upsert RSVP
        await supabase.from("event_rsvps").upsert(
          {
            event_id: eventId,
            user_id: profile.id,
            status,
          },
          { onConflict: "event_id,user_id" }
        );
        setUserRsvp(status);
        toast({ title: `RSVP updated to ${status}` });
      }
      fetchRsvps();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const goingCount = rsvps.filter((r) => r.status === "going").length;
  const maybeCount = rsvps.filter((r) => r.status === "maybe").length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={userRsvp === "going" ? "default" : "outline"}
          onClick={() => handleRsvp("going")}
          disabled={loading}
          className="gap-1"
        >
          <Check className="w-4 h-4" />
          Going
        </Button>
        <Button
          size="sm"
          variant={userRsvp === "maybe" ? "secondary" : "outline"}
          onClick={() => handleRsvp("maybe")}
          disabled={loading}
          className="gap-1"
        >
          <HelpCircle className="w-4 h-4" />
          Maybe
        </Button>
        <Button
          size="sm"
          variant={userRsvp === "not_going" ? "destructive" : "outline"}
          onClick={() => handleRsvp("not_going")}
          disabled={loading}
          className="gap-1"
        >
          <X className="w-4 h-4" />
          Can't Go
        </Button>
      </div>
      {showCount && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{goingCount} going</span>
          {maybeCount > 0 && <span>• {maybeCount} maybe</span>}
        </div>
      )}
    </div>
  );
}
