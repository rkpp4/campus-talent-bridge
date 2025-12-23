import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, CalendarCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface BookSessionProps {
  mentorId: string;
  mentorName: string;
}

export function BookSession({ mentorId, mentorName }: BookSessionProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [sessionDate, setSessionDate] = useState("");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    fetchAvailability();
  }, [mentorId]);

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from("mentor_availability")
      .select("*")
      .eq("mentor_id", mentorId)
      .eq("is_available", true)
      .order("day_of_week")
      .order("start_time");

    if (!error) {
      setSlots(data || []);
    }
    setLoading(false);
  };

  const handleBook = async () => {
    if (!profile?.id || !selectedSlot || !sessionDate) return;

    setBooking(true);
    try {
      const { error } = await supabase.from("mentorship_sessions").insert({
        mentor_id: mentorId,
        student_id: profile.id,
        session_date: sessionDate,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        notes,
        status: "scheduled",
      });

      if (error) throw error;

      // Create notification for mentor
      await supabase.from("notifications").insert({
        user_id: mentorId,
        title: "New Session Booked",
        message: `${profile.full_name} has booked a session with you on ${sessionDate}.`,
      });

      toast({ title: "Session booked successfully!" });
      setShowBooking(false);
      setSelectedSlot(null);
      setSessionDate("");
      setNotes("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBooking(false);
    }
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    const day = slot.day_of_week;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {} as Record<number, AvailabilitySlot[]>);

  if (loading) {
    return null;
  }

  if (slots.length === 0) {
    return null;
  }

  return (
    <Dialog open={showBooking} onOpenChange={setShowBooking}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CalendarCheck className="w-4 h-4 mr-2" />
          Book Session
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Book a Session with {mentorName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select a Time Slot</label>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {Object.entries(groupedSlots).map(([day, daySlots]) => (
                <div key={day}>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {DAYS[parseInt(day)]}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((slot) => (
                      <Badge
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedSlot && (
            <>
              <div>
                <label className="text-sm font-medium">Session Date</label>
                <Input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Choose a {DAYS[selectedSlot.day_of_week]}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="What would you like to discuss?"
                  rows={3}
                />
              </div>
              <Button
                onClick={handleBook}
                disabled={booking || !sessionDate}
                className="w-full"
              >
                {booking ? "Booking..." : "Confirm Booking"}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
