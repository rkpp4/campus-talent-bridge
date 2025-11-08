import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, Check, X, UserPlus, Plus } from 'lucide-react';

interface Club {
  id: string;
  name: string;
  description: string;
  leader_id: string;
  is_approved: boolean;
  created_at: string;
  leader: {
    full_name: string;
    email?: string;
  };
  members_count: number;
}

export default function AdminClubsPage() {
  const { toast } = useToast();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState('');
  const [clubLeaders, setClubLeaders] = useState<any[]>([]);
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
  });
  const [selectedLeaderId, setSelectedLeaderId] = useState('');

  useEffect(() => {
    fetchClubs();
    fetchClubLeaders();
  }, []);

  const fetchClubLeaders = async () => {
    try {
      // Fetch users who have the club_leader role from user_roles table
      const { data, error } = await supabase
        .from('user_roles')
        .select('user_id, profiles!inner(id, full_name)')
        .eq('role', 'club_leader');

      if (error) throw error;
      
      // Transform the data to match expected format
      const leaders = (data || []).map((item: any) => ({
        id: item.user_id,
        full_name: item.profiles.full_name
      }));
      
      setClubLeaders(leaders);
    } catch (error) {
      console.error('Error fetching club leaders:', error);
      toast({
        title: 'Error',
        description: 'Failed to load club leaders',
        variant: 'destructive',
      });
    }
  };

  const fetchClubs = async () => {
    try {
      const { data: clubsData, error } = await supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const clubsWithDetails = await Promise.all(
        (clubsData || []).map(async (club) => {
          const { data: leaderData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', club.leader_id)
            .single();

          const { count } = await supabase
            .from('club_members')
            .select('*', { count: 'exact', head: true })
            .eq('club_id', club.id)
            .eq('status', 'approved');

          return {
            ...club,
            leader: leaderData || { full_name: 'Unknown' },
            members_count: count || 0,
          };
        })
      );

      setClubs(clubsWithDetails);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load clubs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const approveClub = async (clubId: string) => {
    try {
      const { error } = await supabase
        .from('clubs')
        .update({ is_approved: true })
        .eq('id', clubId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Club approved successfully',
      });

      fetchClubs();
    } catch (error) {
      console.error('Error approving club:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve club',
        variant: 'destructive',
      });
    }
  };

  const rejectClub = async (clubId: string) => {
    try {
      const { error } = await supabase.from('clubs').delete().eq('id', clubId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Club rejected and removed',
      });

      fetchClubs();
    } catch (error) {
      console.error('Error rejecting club:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject club',
        variant: 'destructive',
      });
    }
  };

  const handleCreateClub = async () => {
    if (!newClub.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter club name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.from('clubs').insert({
        name: newClub.name,
        description: newClub.description,
        is_approved: true,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Club created successfully',
      });

      setShowCreateDialog(false);
      setNewClub({ name: '', description: '' });
      fetchClubs();
    } catch (error) {
      console.error('Error creating club:', error);
      toast({
        title: 'Error',
        description: 'Failed to create club',
        variant: 'destructive',
      });
    }
  };

  const handleAssignLeader = async () => {
    if (!selectedLeaderId || !selectedClubId) {
      toast({
        title: 'Error',
        description: 'Please select both club and leader',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('clubs')
        .update({ leader_id: selectedLeaderId })
        .eq('id', selectedClubId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Leader assigned successfully',
      });

      setShowAssignDialog(false);
      setSelectedClubId('');
      setSelectedLeaderId('');
      fetchClubs();
    } catch (error) {
      console.error('Error assigning leader:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign leader',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Manage Clubs</h1>
          <p className="text-muted-foreground">
            Create clubs and assign leaders
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
              <div className="space-y-4">
                <div>
                  <Label htmlFor="club-name">Club Name</Label>
                  <Input
                    id="club-name"
                    value={newClub.name}
                    onChange={(e) =>
                      setNewClub({ ...newClub, name: e.target.value })
                    }
                    placeholder="Enter club name"
                  />
                </div>
                <div>
                  <Label htmlFor="club-description">Description</Label>
                  <Textarea
                    id="club-description"
                    value={newClub.description}
                    onChange={(e) =>
                      setNewClub({ ...newClub, description: e.target.value })
                    }
                    placeholder="Enter club description"
                    rows={4}
                  />
                </div>
                <Button onClick={handleCreateClub} className="w-full">
                  Create Club
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Assign Leader
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Assign Club Leader</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Club</Label>
                  <Select value={selectedClubId} onValueChange={setSelectedClubId}>
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
                <div>
                  <Label>Select Leader</Label>
                  <Select value={selectedLeaderId} onValueChange={setSelectedLeaderId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {clubLeaders.map((leader) => (
                        <SelectItem key={leader.id} value={leader.id}>
                          {leader.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAssignLeader} className="w-full">
                  Assign Leader
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4">
        {clubs.length === 0 ? (
          <Card className="p-8 text-center">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No clubs yet</h3>
            <p className="text-muted-foreground">
              No clubs have been created yet
            </p>
          </Card>
        ) : (
          clubs.map((club) => (
            <Card key={club.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{club.name}</h3>
                    <Badge variant={club.is_approved ? 'default' : 'secondary'}>
                      {club.is_approved ? 'Approved' : 'Pending'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{club.description}</p>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Leader:</span>{' '}
                      <span className="font-medium">{club.leader.full_name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Members:</span>{' '}
                      <span className="font-medium">{club.members_count}</span>
                    </div>
                  </div>
                </div>
                {!club.is_approved && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveClub(club.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => rejectClub(club.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
