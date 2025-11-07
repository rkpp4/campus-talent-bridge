import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Club {
  id: string;
  name: string;
  description: string;
  leader_id: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface Member {
  id: string;
  student_id: string;
  club_id: string;
  status: string;
  joined_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Event {
  id: string;
  club_id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  created_by: string;
  created_at: string;
}

interface ClubContextType {
  club: Club | null;
  members: Member[];
  events: Event[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth();
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      // Fetch club where user is the leader
      const { data: clubData, error: clubError } = await supabase
        .from("clubs")
        .select("*")
        .eq("leader_id", profile.id)
        .maybeSingle();

      if (clubError) {
        console.error("Error fetching club:", clubError);
      }
      
      setClub(clubData);

      if (clubData) {
        // Fetch members and events for this club
        const [membersRes, eventsRes] = await Promise.all([
          supabase
            .from("club_members")
            .select("*, profiles(full_name, avatar_url)")
            .eq("club_id", clubData.id)
            .order("joined_at", { ascending: false }),
          supabase
            .from("club_events")
            .select("*")
            .eq("club_id", clubData.id)
            .order("event_date", { ascending: true }),
        ]);
        
        setMembers(membersRes.data || []);
        setEvents(eventsRes.data || []);
      } else {
        setMembers([]);
        setEvents([]);
      }
    } catch (error) {
      console.error("Error in refreshData:", error);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return (
    <ClubContext.Provider value={{ club, members, events, loading, refreshData }}>
      {children}
    </ClubContext.Provider>
  );
}

export function useClub() {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
}
