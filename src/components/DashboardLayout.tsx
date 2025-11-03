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
    <div className="min-h-screen bg-muted/30">
      {/* Top Navigation */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-foreground">TalentBridge</span>
            </Link>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard/notifications"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5" />
              </Link>
              <Link
                to="/dashboard/profile"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <User className="w-5 h-5" />
              </Link>
              <button
                onClick={handleSignOut}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Side Navigation */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="bg-card rounded-lg border border-border p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info Card */}
            <div className="mt-4 bg-card rounded-lg border border-border p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
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
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-card rounded-lg border border-border p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
