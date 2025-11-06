import { useState } from "react";
import { useClub } from "@/contexts/ClubContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, MapPin, Plus, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function ClubEventsPage() {
  const { club, events, loading, refreshData } = useClub();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    event_date: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!club?.id || !profile?.id) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("club_events").insert({
        ...eventData,
        club_id: club.id,
        created_by: profile.id,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event created successfully",
      });
      
      setShowEventForm(false);
      setEventData({ title: "", description: "", event_date: "", location: "" });
      await refreshData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">No Club Assigned</h2>
        <p className="text-muted-foreground">Contact admin to get assigned to a club.</p>
      </div>
    );
  }

  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= now);
  const pastEvents = events.filter(e => new Date(e.event_date) < now);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Club Events</h1>
          <p className="text-muted-foreground">Manage your club's activities and schedules</p>
        </div>
        <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEventSubmit} className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium">Event Title</label>
                <Input
                  required
                  value={eventData.title}
                  onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                  placeholder="Enter event title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={eventData.description}
                  onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date & Time</label>
                <Input
                  type="datetime-local"
                  required
                  value={eventData.event_date}
                  onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={eventData.location}
                  onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
                  placeholder="Enter event location"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Event"}
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowEventForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {upcomingEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Upcoming Events</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{event.title}</span>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">Upcoming</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(event.event_date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Past Events</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pastEvents.map((event) => (
              <Card key={event.id} className="opacity-75">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span>{event.title}</span>
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Completed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(event.event_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Events Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first event to get started
            </p>
            <Button onClick={() => setShowEventForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
