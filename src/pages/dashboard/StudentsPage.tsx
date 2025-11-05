import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Github, Linkedin, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Student {
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

export default function StudentsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student');

      if (error) throw error;

      const studentsWithDetails = await Promise.all(
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

      setStudents(studentsWithDetails);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = student.full_name.toLowerCase().includes(searchLower);
    const skillsMatch = student.student_profile?.skills?.some((skill) =>
      skill.toLowerCase().includes(searchLower)
    );
    return nameMatch || skillsMatch;
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
        <h1 className="text-3xl font-bold">Students</h1>
        <p className="text-muted-foreground">
          Discover talented students and their work
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by name or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredStudents.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">No students found</h3>
          <p className="text-muted-foreground">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'No students have registered yet'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold text-lg">
                    {student.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">{student.full_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {student.projects_count} projects
                  </p>
                </div>
              </div>

              {student.student_profile?.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {student.student_profile.bio}
                </p>
              )}

              {student.student_profile?.skills && student.student_profile.skills.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {student.student_profile.skills.slice(0, 4).map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {student.student_profile.skills.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{student.student_profile.skills.length - 4}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2 items-center">
                {student.student_profile?.github_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(student.student_profile.github_url, '_blank')}
                  >
                    <Github className="w-4 h-4" />
                  </Button>
                )}
                {student.student_profile?.linkedin_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(student.student_profile.linkedin_url, '_blank')}
                  >
                    <Linkedin className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-auto"
                  onClick={() => navigate(`/dashboard/student/${student.id}`)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Full Profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
