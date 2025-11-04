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
import { useToast } from '@/hooks/use-toast';
import { Building2, Check, X, Mail } from 'lucide-react';

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
  const [newClub, setNewClub] = useState({
    name: '',
    description: '',
    leader_email: '',
  });

  useEffect(() => {
    fetchClubs();
  }, []);

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
            Approve club requests and manage existing clubs
          </p>
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
