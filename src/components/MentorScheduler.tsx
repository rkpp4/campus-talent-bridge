import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface AvailabilitySlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface MentorSchedulerProps {
  mentorId?: string;
  isEditable?: boolean;
}

export function MentorScheduler({ mentorId, isEditable = false }: MentorSchedulerProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({
    day_of_week: "1",
    start_time: "09:00",
    end_time: "10:00",
  });

  const targetMentorId = mentorId || profile?.id;

  useEffect(() => {
    if (targetMentorId) {
      fetchAvailability();
    }
  }, [targetMentorId]);

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from("mentor_availability")
      .select("*")
      .eq("mentor_id", targetMentorId)
      .eq("is_available", true)
      .order("day_of_week")
      .order("start_time");

    if (!error) {
      setSlots(data || []);
    }
    setLoading(false);
  };

  const handleAddSlot = async () => {
    if (!profile?.id) return;

    try {
      const { error } = await supabase.from("mentor_availability").insert({
        mentor_id: profile.id,
        day_of_week: parseInt(newSlot.day_of_week),
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        is_available: true,
      });

      if (error) throw error;

      toast({ title: "Availability slot added" });
      setShowAddSlot(false);
      fetchAvailability();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await supabase.from("mentor_availability").delete().eq("id", slotId);
      toast({ title: "Slot removed" });
      fetchAvailability();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const groupedSlots = slots.reduce((acc, slot) => {
    const day = slot.day_of_week;
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {} as Record<number, AvailabilitySlot[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Availability Schedule
        </CardTitle>
        {isEditable && (
          <Dialog open={showAddSlot} onOpenChange={setShowAddSlot}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Availability Slot</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Day</label>
                  <Select
                    value={newSlot.day_of_week}
                    onValueChange={(v) => setNewSlot({ ...newSlot, day_of_week: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map((day, i) => (
                        <SelectItem key={i} value={i.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <Input
                      type="time"
                      value={newSlot.start_time}
                      onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <Input
                      type="time"
                      value={newSlot.end_time}
                      onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddSlot} className="w-full">
                  Add Slot
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {slots.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            {isEditable ? "No availability slots set. Add your first slot!" : "No availability set by mentor."}
          </p>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedSlots).map(([day, daySlots]) => (
              <div key={day} className="space-y-2">
                <h4 className="font-medium text-sm">{DAYS[parseInt(day)]}</h4>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <Badge
                      key={slot.id}
                      variant="secondary"
                      className="flex items-center gap-2"
                    >
                      <Clock className="w-3 h-3" />
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                      {isEditable && (
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
