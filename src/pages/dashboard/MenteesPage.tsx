import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface Mentee {
  id: string;
  student_id: string;
  topic: string;
  status: string;
  created_at: string;
  student: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  student_profile?: {
    bio: string | null;
    skills: string[] | null;
  };
}

export default function MenteesPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchMentees();
    }
  }, [profile]);

  const fetchMentees = async () => {
    try {
      const { data: requests, error } = await supabase
        .from('mentorship_requests')
        .select('*')
        .eq('mentor_id', profile?.id)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const menteesWithProfiles = await Promise.all(
        (requests || []).map(async (request) => {
          const { data: studentData } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .eq('id', request.student_id)
            .single();

          const { data: profileData } = await supabase
            .from('student_profiles')
            .select('bio, skills')
            .eq('id', request.student_id)
            .single();

          return {
            ...request,
            student: studentData,
            student_profile: profileData,
          };
        })
      );

      setMentees(menteesWithProfiles);
    } catch (error) {
      console.error('Error fetching mentees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load mentees',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const startChat = async (mentee: Mentee) => {
    try {
      // Check if conversation exists
      const { data: existingConv } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('mentor_id', profile?.id)
        .eq('student_id', mentee.student_id)
        .single();

      if (!existingConv) {
        // Create new conversation
        await supabase.from('chat_conversations').insert({
          mentor_id: profile?.id,
          student_id: mentee.student_id,
          mentorship_request_id: mentee.id,
        });
      }

      navigate('/dashboard/messages');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to start chat',
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
      <div>
        <h1 className="text-3xl font-bold">My Mentees</h1>
        <p className="text-muted-foreground">Students you're currently mentoring</p>
      </div>

      {mentees.length === 0 ? (
        <Card className="p-8 text-center">
          <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No mentees yet</h3>
          <p className="text-muted-foreground">
            You haven't accepted any mentorship requests yet
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mentees.map((mentee) => (
            <Card key={mentee.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-primary font-semibold text-lg">
                      {mentee.student?.full_name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{mentee.student?.full_name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Topic</p>
                  <p className="text-sm">{mentee.topic}</p>
                </div>

                {mentee.student_profile?.bio && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bio</p>
                    <p className="text-sm line-clamp-2">{mentee.student_profile.bio}</p>
                  </div>
                )}

                {mentee.student_profile?.skills && mentee.student_profile.skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {mentee.student_profile.skills.slice(0, 3).map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {mentee.student_profile.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{mentee.student_profile.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button onClick={() => startChat(mentee)} className="w-full" variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
