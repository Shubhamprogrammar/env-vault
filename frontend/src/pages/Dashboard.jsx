import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound, FolderPlus, LogOut, Terminal,
  Settings, ArrowRight, Folder, RefreshCw, ExternalLink, HelpCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await api.get('/project');
      setProjects(res.data);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      const res = await api.post('/project', { name, description });
      setProjects([...projects, res.data]);
      setName('');
      setDescription('');
      setShowCreateModal(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navbar */}
      <header className="border-b border-gray-800 bg-[#070c09]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 select-none">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md">
            <KeyRound className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-wider text-white">ENV<span className="text-secondary font-light">-VAULT</span></span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs text-gray-400">Authenticated as</span>
            <span className="text-sm font-semibold text-white">{user?.email || 'User'}</span>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-800 hover:border-red-500/40 hover:bg-red-950/20 text-gray-400 hover:text-red-400 transition-all text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-12">
        {/* Banner Section */}
        <div className="premium-card rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border-primary/20">
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-primary/10 blur-3xl -z-10" />
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none">Secure Environment Management</h1>
            <p className="text-gray-300 max-w-xl text-base">
              Sync passwords, API credentials, and application keys securely across environments using the companion CLI tool.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold"
              >
                <FolderPlus className="w-4 h-4" />
                <span>New Vault Project</span>
              </button>
              <a
                href="#cli-guide"
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-5 py-3 rounded-xl flex items-center gap-2 text-sm font-semibold transition-all"
              >
                <Terminal className="w-4 h-4 text-secondary" />
                <span>CLI Operations Guide</span>
              </a>
            </div>
          </div>
          <div className="bg-[#0b130e]/80 border border-gray-800 rounded-2xl p-6 font-mono text-sm max-w-md w-full shadow-2xl relative">
            <div className="flex items-center gap-1.5 mb-3 border-b border-gray-800 pb-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-gray-500 ml-2">env-vault CLI</span>
            </div>
            <div className="space-y-1.5 text-gray-300">
              <p><span className="text-secondary">$</span> env-vault login</p>
              <p className="text-gray-500"># Link directory to Project ID</p>
              <p><span className="text-secondary">$</span> env-vault init &lt;project-id&gt;</p>
              <p className="text-gray-500"># Pull development env to local .env</p>
              <p><span className="text-secondary">$</span> env-vault pull development</p>
              <p className="text-gray-500"># Push local .env securely to vault</p>
              <p><span className="text-secondary">$</span> env-vault push development</p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-white">Your Vault Projects</h2>
              <p className="text-xs text-gray-400">Total {projects.length} secure workspaces configured</p>
            </div>
            <button
              onClick={fetchProjects}
              className="p-2 rounded-lg border border-gray-800 hover:border-gray-700 hover:bg-white/5 transition-all text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="premium-card rounded-2xl h-56 animate-pulse bg-gray-900/20 border-gray-800" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="premium-card rounded-2xl p-12 text-center border-dashed border-2 border-gray-800 flex flex-col items-center justify-center max-w-xl mx-auto space-y-4">
              <Folder className="w-16 h-16 text-primary opacity-50" />
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white">No projects here yet</h3>
                <p className="text-sm text-gray-400">Create a secure vault project to configure environment keys</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                <span>Create a Project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div
                  key={project._id}
                  className="premium-card rounded-2xl p-6 flex flex-col justify-between h-56 border-primary/20 hover:border-primary/50 relative overflow-hidden group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                        <Folder className="w-5 h-5" />
                      </div>

                      <button
                        onClick={() => navigate(`/project/${project._id}`)}
                        title="Open Project Vault"
                        className="p-1.5 rounded-lg bg-primary hover:bg-primary/95 text-white transition-all shadow-sm"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors flex items-center gap-2">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {project.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-gray-800/80">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-gray-500 tracking-wide uppercase mr-1">Envs:</span>
                      {['development', 'staging', 'production'].map(env => {
                        const configured = project.environments?.some(e => e.name === env && e.variables?.length > 0);
                        return (
                          <span
                            key={env}
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              configured
                                ? 'bg-secondary/15 border border-secondary/20 text-secondary'
                                : 'bg-gray-900 border border-gray-800 text-gray-500'
                            }`}
                          >
                            {env.slice(0, 3)}
                          </span>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 bg-[#0b130e]/40 p-2 rounded-lg border border-gray-900 font-mono">
                      <span className="truncate max-w-[200px]" title={project._id}>ID: {project._id}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(project._id);
                          alert('Project ID copied to clipboard!');
                        }}
                        className="text-[10px] text-secondary hover:text-white transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CLI Operations Section */}
        <section id="cli-guide" className="premium-card rounded-2xl p-8 border-gray-800/80 bg-[#070c09]/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-secondary/5 blur-3xl" />
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-6 h-6 text-secondary" />
            <h2 className="text-2xl font-bold text-white">CLI Operations Guide</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  1. Login to CLI
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Open a terminal in your workspace and authenticate using your web vault account:
                </p>
              </div>
              <div className="bg-[#0b130e] border border-gray-800 rounded-xl p-3.5 font-mono text-[11px] text-gray-300">
                <span className="text-gray-500"># Authenticate terminal session</span><br />
                <span className="text-secondary">$</span> env-vault login
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  2. Link Workspace (Once)
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Link your local directory workspace to your Project ID (copied from the card above):
                </p>
              </div>
              <div className="bg-[#0b130e] border border-gray-800 rounded-xl p-3.5 font-mono text-[11px] text-gray-300">
                <span className="text-gray-500"># Link directory to project vault</span><br />
                <span className="text-secondary">$</span> env-vault init &lt;project-id&gt;
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-secondary" />
                  3. Daily Push & Pull
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Daily syncing is now incredibly short and elegant!
                </p>
              </div>
              <div className="bg-[#0b130e] border border-gray-800 rounded-xl p-3.5 font-mono text-[11px] text-gray-300 space-y-2">
                <div>
                  <span className="text-gray-500"># Pull env fully to local .env</span><br />
                  <span className="text-secondary">$</span> env-vault pull development
                </div>
                <div>
                  <span className="text-gray-500"># Push local .env variables fully</span><br />
                  <span className="text-secondary">$</span> env-vault push production
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-lg premium-card rounded-2xl p-8 border-primary/30 relative">
            <h3 className="text-2xl font-bold text-white mb-2">Create New Vault Project</h3>
            <p className="text-sm text-gray-400 mb-6">Enter details below to establish a secure project vault workspace.</p>

            {formError && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-500/35 rounded-xl text-red-200 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My NextJS App"
                  className="w-full px-4 py-3 rounded-xl input-premium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows="3"
                  placeholder="Brief summary describing the project workspace..."
                  className="w-full px-4 py-3 rounded-xl input-premium"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 btn-primary rounded-xl font-semibold text-white disabled:opacity-50"
                >
                  {creating ? 'Creating Workspace...' : 'Create Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
