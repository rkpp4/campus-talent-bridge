import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Award,
  Home,
  FileText,
  Briefcase,
  Users,
  Building2,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  BarChart3,
  MessageCircle,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getNavItems = () => {
    const common = [
      { icon: Home, label: 'Dashboard', path: '/dashboard' },
      { icon: Bell, label: 'Notifications', path: '/dashboard/notifications' },
      { icon: Settings, label: 'Profile', path: '/dashboard/profile' },
    ];

    switch (profile?.role) {
      case 'student':
        return [
          ...common.slice(0, 1),
          { icon: FileText, label: 'My Projects', path: '/dashboard/projects' },
          { icon: Briefcase, label: 'Internships', path: '/dashboard/internships' },
          { icon: Users, label: 'Mentorship', path: '/dashboard/mentorship' },
          { icon: MessageCircle, label: 'Messages', path: '/dashboard/messages' },
          { icon: Building2, label: 'Clubs', path: '/dashboard/clubs' },
          { icon: Search, label: 'Explore', path: '/dashboard/explore' },
          ...common.slice(1),
        ];
      case 'mentor':
        return [
          ...common.slice(0, 1),
          { icon: Users, label: 'Mentees', path: '/dashboard/mentees' },
          { icon: MessageCircle, label: 'Messages', path: '/dashboard/messages' },
          { icon: FileText, label: 'Projects', path: '/dashboard/projects' },
          { icon: Search, label: 'Students', path: '/dashboard/students' },
          ...common.slice(1),
        ];
      case 'startup':
        return [
          ...common.slice(0, 1),
          { icon: Briefcase, label: 'Internships', path: '/dashboard/post-internship' },
          { icon: FileText, label: 'Applications', path: '/dashboard/applications' },
          { icon: Search, label: 'Find Talent', path: '/dashboard/talent' },
          ...common.slice(1),
        ];
      case 'club_leader':
        return [
          ...common.slice(0, 1),
          { icon: Building2, label: 'My Club', path: '/dashboard/club' },
          { icon: Users, label: 'Members', path: '/dashboard/members' },
          { icon: FileText, label: 'Events', path: '/dashboard/events' },
          { icon: Search, label: 'Explore', path: '/dashboard/explore' },
          ...common.slice(1),
        ];
      case 'admin':
        return [
          ...common.slice(0, 1),
          { icon: Users, label: 'Users', path: '/dashboard/users' },
          { icon: Building2, label: 'Clubs', path: '/dashboard/admin-clubs' },
          { icon: FileText, label: 'Projects', path: '/dashboard/projects' },
          { icon: Briefcase, label: 'Internships', path: '/dashboard/internships' },
          { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
          ...common.slice(1),
        ];
      default:
        return common;
    }
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card border-b z-20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl text-foreground">TalentBridge</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-muted"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-10 lg:hidden transition-opacity ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-card border-r border-border z-30 transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo - Desktop Only */}
        <div className="p-6 border-b border-border hidden lg:block">
          <div className="flex items-center space-x-2">
            <Award className="w-8 h-8 text-primary" />
            <span className="font-bold text-xl text-foreground">TalentBridge</span>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border mt-16 lg:mt-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold">
                {profile?.full_name?.charAt(0).toUpperCase()}
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

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-3 px-3 py-2 rounded-md text-foreground hover:bg-muted w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
