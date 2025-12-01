import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clubSchema, clubLeaderSchema } from "@/lib/validations";
import {
  Users,
  Briefcase,
  FileText,
  Building2,
  TrendingUp,
  Plus,
  UserPlus,
} from "lucide-react";

interface Club {
  id: string;
  name: string;
  description: string | null;
  leader_id: string | null;
}

export function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    users: 0,
    students: 0,
    mentors: 0,
    startups: 0,
    clubs: 0,
    clubLeaders: 0,
    projects: 0,
    internships: 0,
    applications: 0,
  });
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [isAssignLeaderOpen, setIsAssignLeaderOpen] = useState(false);
  const [newClub, setNewClub] = useState({ name: "", description: "" });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [leaderData, setLeaderData] = useState({
    fullName: "",
    email: "",
    password: "",
    clubId: "",
  });

  useEffect(() => {
    fetchStats();
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    const { data, error } = await supabase
      .from("clubs")
      .select("id, name, description, leader_id")
      .order("name");

    if (!error && data) {
      setClubs(data);
    }
  };

  const fetchStats = async () => {
    const [
      usersRes,
      studentsRes,
      mentorsRes,
      startupsRes,
      clubLeadersRes,
      clubsRes,
      projectsRes,
      internshipsRes,
      applicationsRes,
    ] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "student"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "mentor"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "startup"),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "club_leader"),
      supabase.from("clubs").select("id", { count: "exact", head: true }),
      supabase
        .from("micro_projects")
        .select("id", { count: "exact", head: true }),
      supabase.from("internships").select("id", { count: "exact", head: true }),
      supabase
        .from("internship_applications")
        .select("id", { count: "exact", head: true }),
    ]);

    setStats({
      users: usersRes.count || 0,
      students: studentsRes.count || 0,
      mentors: mentorsRes.count || 0,
      startups: startupsRes.count || 0,
      clubLeaders: clubLeadersRes.count || 0,
      clubs: clubsRes.count || 0,
      projects: projectsRes.count || 0,
      internships: internshipsRes.count || 0,
      applications: applicationsRes.count || 0,
    });
  };

  const handleCreateClub = async () => {
    try {
      const validatedData = clubSchema.parse(newClub);

      const { error } = await supabase.from("clubs").insert({
        name: validatedData.name,
        description: validatedData.description,
        is_approved: true,
      });

      if (error) throw error;

      toast({ title: "Success", description: "Club created successfully" });
      setNewClub({ name: "", description: "" });
      setIsCreateClubOpen(false);
      fetchStats();
      fetchClubs();
    } catch (error: any) {
      if (error.errors) {
        toast({
          title: "Validation Error",
          description: error.errors[0]?.message || "Invalid input",
          variant: "destructive",
        });
      } else {
        toast({ title: "Error", description: "Failed to create club", variant: "destructive" });
      }
    }
  };

  const handleAssignLeader = async () => {
    try {
      const validatedData = clubLeaderSchema.parse(leaderData);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.fullName,
            role: "club_leader",
          },
        },
      });

      if (authError) throw authError;

      // Update club with leader_id
      const { error: clubError } = await supabase
        .from("clubs")
        .update({ leader_id: authData.user?.id })
        .eq("id", validatedData.clubId);

      if (clubError) throw clubError;

      const clubName = clubs.find(c => c.id === validatedData.clubId)?.name || "Club";

      toast({
        title: "Success",
        description: `✅ Club Leader assigned successfully to ${clubName}`,
      });
      
      setLeaderData({ fullName: "", email: "", password: "", clubId: "" });
      setIsAssignLeaderOpen(false);
      fetchStats();
      fetchClubs();
    } catch (error: any) {
      if (error.errors) {
        toast({
          title: "Validation Error",
          description: error.errors[0]?.message || "Invalid input",
          variant: "destructive",
        });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Platform overview and analytics</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateClubOpen} onOpenChange={setIsCreateClubOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Club
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Club</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Club Name</label>
                  <Input
                    value={newClub.name}
                    onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                    placeholder="Enter club name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newClub.description}
                    onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                    placeholder="Enter club description"
                  />
                </div>
                <Button onClick={handleCreateClub} className="w-full">
                  Create Club
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAssignLeaderOpen} onOpenChange={setIsAssignLeaderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Club Leader
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Club Leader</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <Input
                    value={leaderData.fullName}
                    onChange={(e) => setLeaderData({ ...leaderData, fullName: e.target.value })}
                    placeholder="Leader's full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={leaderData.email}
                    onChange={(e) => setLeaderData({ ...leaderData, email: e.target.value })}
                    placeholder="leader@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="text"
                    value={leaderData.password}
                    onChange={(e) => setLeaderData({ ...leaderData, password: e.target.value })}
                    placeholder="Create a password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Select Club</label>
                  <Select
                    value={leaderData.clubId}
                    onValueChange={(value) => setLeaderData({ ...leaderData, clubId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a club" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubs.map((club) => (
                        <SelectItem key={club.id} value={club.id}>
                          {club.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssignLeader} className="w-full">
                  Create Leader Account
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.users}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Projects</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.projects}
              </p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Internships</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.internships}
              </p>
            </div>
            <Briefcase className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clubs</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.clubs}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Students</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.students}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Mentors</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.mentors}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Startups</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.startups}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Club Leaders</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.clubLeaders}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activity Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Projects</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.projects}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Applications</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.applications}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Clubs</span>
              <span className="text-sm font-medium text-gray-900">
                {stats.clubs}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Health
          </h3>
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">All systems operational</span>
          </div>
          <p className="text-sm text-gray-600">
            Platform is running smoothly with active engagement across all user
            types.
          </p>
        </div>
      </div>
    </div>
  );
}
