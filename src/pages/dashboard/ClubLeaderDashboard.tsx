import { useClub } from "@/contexts/ClubContext";
import { useAuth } from "../../contexts/AuthContext";
import { Users, Calendar, Plus, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function ClubLeaderDashboard() {
  const { club, members, events, loading } = useClub();
  const { profile } = useAuth();
  const navigate = useNavigate();

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
        <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">No Club Assigned</h2>
        <p className="text-muted-foreground">Contact admin to get assigned to a club.</p>
      </div>
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
