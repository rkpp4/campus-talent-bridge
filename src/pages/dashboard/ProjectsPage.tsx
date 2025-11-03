import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import { Plus, Edit, Trash2, ExternalLink, Github } from "lucide-react";

export function ProjectsPage() {
  const { profile } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tech_stack: "",
    github_url: "",
    live_demo_url: "",
  });

  useEffect(() => {
    fetchProjects();
  }, [profile?.id]);

  const fetchProjects = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from("micro_projects")
      .select("*")
      .eq("student_id", profile.id)
      .order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      tech_stack: formData.tech_stack.split(",").map((s) => s.trim()),
      student_id: profile?.id,
    };

    if (editingProject) {
      await supabase
        .from("micro_projects")
        .update(projectData)
        .eq("id", editingProject.id);
    } else {
      await supabase.from("micro_projects").insert(projectData);
    }

    setShowForm(false);
    setEditingProject(null);
    setFormData({
      title: "",
      description: "",
      tech_stack: "",
      github_url: "",
      live_demo_url: "",
    });
    fetchProjects();
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack.join(", "),
      github_url: project.github_url || "",
      live_demo_url: project.live_demo_url || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      await supabase.from("micro_projects").delete().eq("id", id);
      fetchProjects();
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingProject ? "Edit Project" : "Create New Project"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tech Stack (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.tech_stack}
                  onChange={(e) =>
                    setFormData({ ...formData, tech_stack: e.target.value })
                  }
                  placeholder="React, Node.js, MongoDB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub URL
                </label>
                <input
                  type="url"
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData({ ...formData, github_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Live Demo URL
                </label>
                <input
                  type="url"
                  value={formData.live_demo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, live_demo_url: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingProject ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProject(null);
                    setFormData({
                      title: "",
                      description: "",
                      tech_stack: "",
                      github_url: "",
                      live_demo_url: "",
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                {project.title}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(project)}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="text-gray-600 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tech_stack?.map((tech: string, idx: number) => (
                <span
                  key={idx}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex space-x-3">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Github className="w-4 h-4" />
                  <span>Code</span>
                </a>
              )}
              {project.live_demo_url && (
                <a
                  href={project.live_demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Demo</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">
            You haven't created any projects yet
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Project</span>
          </button>
        </div>
      )}
    </div>
  );
}
