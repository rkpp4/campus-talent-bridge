import { useClub } from "@/contexts/ClubContext";
import { useAuth } from "../../contexts/AuthContext";
import { Users, Calendar, Plus, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ClubLeaderDashboard() {
  const { club, members, events, loading, refreshData } = useClub();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [clubData, setClubData] = useState({
    name: "",
    description: ""
  });

  const handleCreateClub = async () => {
    if (!clubData.name.trim()) {
      toast.error("Club name is required");
      return;
    }

    setCreating(true);
    try {
      const { error } = await supabase
        .from("clubs")
        .insert({
          name: clubData.name,
          description: clubData.description,
          leader_id: profile?.id,
          is_approved: true
        });

      if (error) throw error;

      toast.success("Club created successfully!");
      setShowCreateDialog(false);
      setClubData({ name: "", description: "" });
      await refreshData();
    } catch (error) {
      console.error("Error creating club:", error);
      toast.error("Failed to create club");
    } finally {
      setCreating(false);
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
      <>
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Create Your Club</h2>
          <p className="text-muted-foreground mb-6">Start by creating your club to manage members and events.</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Club
          </Button>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Your Club</DialogTitle>
              <DialogDescription>
                Enter the details of your club to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Club Name</Label>
                <Input
                  id="name"
                  value={clubData.name}
                  onChange={(e) => setClubData({ ...clubData, name: e.target.value })}
                  placeholder="e.g., Tech Innovation Club"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={clubData.description}
                  onChange={(e) => setClubData({ ...clubData, description: e.target.value })}
                  placeholder="Describe your club's mission and activities..."
                  rows={4}
                />
              </div>
              <Button onClick={handleCreateClub} disabled={creating} className="w-full">
                {creating ? "Creating..." : "Create Club"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const approvedMembers = members.filter(m => m.status === "approved");
  const pendingMembers = members.filter(m => m.status === "pending");
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date());

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">{club.name}</h1>
        <p className="text-muted-foreground">{club.description}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active club members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingMembers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Scheduled activities
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <Button className="w-full" onClick={() => navigate('/dashboard/events')}>
            <Plus className="w-4 h-4 mr-2" />
            Add New Event
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/members')}>
            <UserPlus className="w-4 h-4 mr-2" />
            Manage Members
          </Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard/events')}>
            <Calendar className="w-4 h-4 mr-2" />
            View All Events
          </Button>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Membership Requests</span>
              {pendingMembers.length > 0 && (
                <Button variant="link" size="sm" onClick={() => navigate('/dashboard/members')}>
                  View All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingMembers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No pending requests
              </p>
            ) : (
              <div className="space-y-3">
                {pendingMembers.slice(0, 3).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium text-foreground">
                      {member.profiles?.full_name || "Unknown"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming Events</span>
              {upcomingEvents.length > 0 && (
                <Button variant="link" size="sm" onClick={() => navigate('/dashboard/events')}>
                  View All
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No events scheduled
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="p-3 bg-muted/50 rounded-lg">
                    <h4 className="font-medium text-foreground">{event.title}</h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(event.event_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
