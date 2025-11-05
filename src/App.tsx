import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./components/DashboardLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import {
  StudentDashboard,
  ProjectsPage,
  InternshipsPage,
  MentorshipPage,
  ClubsPage,
  ProfilePage,
  NotificationsPage,
  MentorDashboard,
  StartupDashboard,
  ClubLeaderDashboard,
  AdminDashboard,
  ExplorePage,
  MessagesPage,
  MenteesPage,
  StudentsPage,
  TalentPage,
  AdminClubsPage,
  AdminUsersPage,
  StudentProfilePage,
  MentorProfilePage,
} from "./pages/dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function DashboardRouter() {
  const { profile } = useAuth();

  const getDashboardComponent = () => {
    switch (profile?.role) {
      case "student":
        return <StudentDashboard />;
      case "mentor":
        return <MentorDashboard />;
      case "startup":
        return <StartupDashboard />;
      case "club_leader":
        return <ClubLeaderDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={getDashboardComponent()} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/internships" element={<InternshipsPage />} />
        <Route path="/mentorship" element={<MentorshipPage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/mentees" element={<MenteesPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/post-internship" element={<StartupDashboard />} />
        <Route path="/applications" element={<StartupDashboard />} />
        <Route path="/talent" element={<TalentPage />} />
        <Route path="/club" element={<ClubLeaderDashboard />} />
        <Route path="/members" element={<ClubLeaderDashboard />} />
        <Route path="/events" element={<ClubLeaderDashboard />} />
        <Route path="/clubs" element={<ClubsPage />} />
        <Route path="/users" element={<AdminUsersPage />} />
        <Route path="/admin-clubs" element={<AdminClubsPage />} />
        <Route path="/analytics" element={<AdminDashboard />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/student/:id" element={<StudentProfilePage />} />
        <Route path="/mentor/:id" element={<MentorProfilePage />} />
      </Routes>
    </DashboardLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
