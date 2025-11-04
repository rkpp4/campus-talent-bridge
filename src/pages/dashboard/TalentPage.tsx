import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Mail, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Talent {
  id: string;
  full_name: string;
  avatar_url: string | null;
  student_profile: {
    bio: string | null;
    skills: string[] | null;
    github_url: string | null;
    linkedin_url: string | null;
  } | null;
  projects_count: number;
}

export default function TalentPage() {
  const { toast } = useToast();
  const [talents, setTalents] = useState<Talent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const allSkills = Array.from(
    new Set(
      talents.flatMap((t) => t.student_profile?.skills || [])
    )
  ).sort();

  useEffect(() => {
    fetchTalents();
  }, []);

  const fetchTalents = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (error) throw error;

      const talentsWithDetails = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: studentProfile } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('id', profile.id)
            .single();

          const { count } = await supabase
            .from('micro_projects')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', profile.id);

          return {
            ...profile,
            student_profile: studentProfile,
            projects_count: count || 0,
          };
        })
      );

      setTalents(talentsWithDetails);
    } catch (error) {
      console.error('Error fetching talents:', error);
      toast({
        title: 'Error',
        description: 'Failed to load talent profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteToApply = (talent: Talent) => {
    toast({
      title: 'Invitation Sent',
      description: `Invitation sent to ${talent.full_name}`,
    });
  };

  const filteredTalents = talents.filter((talent) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = talent.full_name.toLowerCase().includes(searchLower);
    const skillsMatch = talent.student_profile?.skills?.some((skill) =>
      skill.toLowerCase().includes(searchLower)
    );
    
    const skillFilterMatch = skillFilter === 'all' || 
      talent.student_profile?.skills?.includes(skillFilter);

    return (nameMatch || skillsMatch) && skillFilterMatch;
  });

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
        <h1 className="text-3xl font-bold">Find Talent</h1>
        <p className="text-muted-foreground">
          Discover skilled students for your internship opportunities
        </p>
      </div>

      <div className="flex gap-4 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={skillFilter} onValueChange={setSkillFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by skill" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Skills</SelectItem>
            {allSkills.map((skill) => (
              <SelectItem key={skill} value={skill}>
                {skill}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredTalents.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No students found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTalents.map((talent) => (
            <Card key={talent.id} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {talent.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{talent.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {talent.projects_count} projects
                  </p>
                </div>
              </div>

              {talent.student_profile?.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {talent.student_profile.bio}
                </p>
              )}

              {talent.student_profile?.skills && talent.student_profile.skills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {talent.student_profile.skills.slice(0, 5).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {talent.student_profile.skills.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{talent.student_profile.skills.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => inviteToApply(talent)}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Invite
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
