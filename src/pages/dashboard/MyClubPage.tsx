import { useClub } from "@/contexts/ClubContext";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, CheckCircle, Edit, Globe, Mail, Instagram, Twitter, Linkedin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function MyClubPage() {
  const { club, members, events, loading } = useClub();
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
        <h2 className="text-2xl font-bold text-foreground mb-2">No Club Created</h2>
        <p className="text-muted-foreground">Create your club from the dashboard to get started.</p>
      </div>
    );
  }

  const approvedMembers = members.filter(m => m.status === "approved");
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.event_date) < new Date());

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            {club.logo_url && (
              <img
                src={club.logo_url}
                alt={club.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">{club.name}</h1>
              {club.category && (
                <Badge variant="secondary" className="mt-1">
                  {club.category}
                </Badge>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">{club.description}</p>
        </div>
        <Button onClick={() => navigate("/dashboard/edit-club-profile")}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Events</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Past activities
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Club Information */}
      <Card>
        <CardHeader>
          <CardTitle>Club Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
              {club.is_approved ? (
                <Badge className="bg-green-100 text-green-800">Approved</Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Created On</h3>
              <p className="text-base text-foreground">
                {new Date(club.created_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {club.meeting_schedule && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Meeting Schedule
                </h3>
                <p className="text-base text-foreground">{club.meeting_schedule}</p>
              </div>
            </>
          )}

          {(club.contact_email || club.website_url) && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Contact</h3>
                <div className="space-y-2">
                  {club.contact_email && (
                    <a
                      href={`mailto:${club.contact_email}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {club.contact_email}
                    </a>
                  )}
                  {club.website_url && (
                    <a
                      href={club.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>
            </>
          )}

          {(club.instagram_url || club.twitter_url || club.linkedin_url) && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Social Media</h3>
                <div className="flex gap-4">
                  {club.instagram_url && (
                    <a
                      href={club.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {club.twitter_url && (
                    <a
                      href={club.twitter_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {club.linkedin_url && (
                    <a
                      href={club.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Club Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No announcements at this time. Check back later for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
