import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Users,
  Building2,
  Award,
  Bell,
  User,
  LogOut,
  Search,
  Settings,
  Calendar,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getNavItems = () => {
    switch (profile?.role) {
      case 'student':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/dashboard/projects', label: 'My Projects', icon: FileText },
          { path: '/dashboard/internships', label: 'Internships', icon: Briefcase },
          { path: '/dashboard/mentorship', label: 'Mentorship', icon: Users },
          { path: '/dashboard/clubs', label: 'Clubs', icon: Building2 },
          { path: '/dashboard/explore', label: 'Explore', icon: Search },
        ];
      case 'mentor':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/dashboard/mentees', label: 'Mentees', icon: Users },
          { path: '/dashboard/explore', label: 'Explore', icon: Search },
        ];
      case 'startup':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/dashboard/post-internship', label: 'Post Internship', icon: Briefcase },
          { path: '/dashboard/applications', label: 'Applications', icon: FileText },
          { path: '/dashboard/talent', label: 'Find Talent', icon: Search },
        ];
      case 'club_leader':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/dashboard/club', label: 'My Club', icon: Building2 },
          { path: '/dashboard/members', label: 'Members', icon: Users },
          { path: '/dashboard/events', label: 'Events', icon: Calendar },
        ];
      case 'admin':
        return [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/dashboard/users', label: 'Users', icon: Users },
          { path: '/dashboard/analytics', label: 'Analytics', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Side Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r border-border flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">TalentBridge</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {profile?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {profile?.full_name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors text-foreground hover:bg-muted w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
