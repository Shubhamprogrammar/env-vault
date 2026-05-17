import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { 
  ArrowLeft, KeyRound, Terminal, Copy, Check, Save, 
  Trash2, Plus, Eye, EyeOff, Code, AlignLeft, Info, RefreshCw
} from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('development');
  
  // Decrypted variables for the selected env (list of { key, value })
  const [variables, setVariables] = useState([]);
  const [loadingVars, setLoadingVars] = useState(false);

  // Structured variable creator/editor state
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [addingVar, setAddingVar] = useState(false);

  // Full env text editor state (the standard .env raw text format)
  const [rawText, setRawText] = useState('');
  const [editingRaw, setEditingRaw] = useState(false);
  const [pushingRaw, setPushingRaw] = useState(false);

  // UI interaction states
  const [copiedKey, setCopiedKey] = useState(null);
  const [copiedFull, setCopiedFull] = useState(false);
  const [visibleValues, setVisibleValues] = useState({}); // maps key -> boolean

  useEffect(() => {
    fetchProjectDetail();
  }, [id]);

  useEffect(() => {
    if (project) {
      fetchEnvVariables(activeTab);
    }
  }, [project, activeTab]);

  async function fetchProjectDetail() {
    setLoading(true);
    try {
      const res = await api.get(`/project/${id}`);
      setProject(res.data);
    } catch (err) {
      console.error('Error fetching project:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  }

  async function fetchEnvVariables(envName) {
    setLoadingVars(true);
    try {
      const res = await api.get(`/env/${id}/envs/${envName}`);
      const vars = res.data.variables || [];
      setVariables(vars);
      
      // Also construct raw text representation
      let rawLines = '';
      vars.forEach(v => {
        rawLines += `${v.key}=${v.value}\n`;
      });
      setRawText(rawLines);
    } catch (err) {
      console.error('Error fetching vars:', err);
    } finally {
      setLoadingVars(false);
    }
  }

  // Toggle value visibility
  function toggleVisibility(key) {
    setVisibleValues(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  // Save/Update single variable
  async function handleSaveVar(e) {
    e.preventDefault();
    if (!newKey.trim()) return;
    setAddingVar(true);
    try {
      await api.post(`/env/${id}/envs/${activeTab}/var`, {
        key: newKey.trim().toUpperCase(),
        value: newValue
      });
      setNewKey('');
      setNewValue('');
      fetchEnvVariables(activeTab);
    } catch (err) {
      alert('Error saving variable: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddingVar(false);
    }
  }

  // Delete single variable
  async function handleDeleteVar(key) {
    if (!confirm(`Are you sure you want to delete variable ${key}?`)) return;
    try {
      await api.delete(`/env/${id}/envs/${activeTab}/var/${key}`);
      fetchEnvVariables(activeTab);
    } catch (err) {
      alert('Error deleting variable: ' + (err.response?.data?.message || err.message));
    }
  }

  // Push full environment text block
  async function handlePushFullEnv() {
    setPushingRaw(true);
    try {
      // Parse raw text block into key-value map
      const lines = rawText.split('\n');
      const variablesMap = {};
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const index = trimmed.indexOf('=');
          if (index > 0) {
            const k = trimmed.slice(0, index).trim().toUpperCase();
            const v = trimmed.slice(index + 1);
            variablesMap[k] = v;
          }
        }
      });

      await api.post(`/env/${id}/envs/${activeTab}/push`, {
        variables: variablesMap
      });

      setEditingRaw(false);
      fetchEnvVariables(activeTab);
      alert('✅ Secure environment uploaded & fully sync\'d!');
    } catch (err) {
      alert('Error pushing full environment: ' + (err.response?.data?.message || err.message));
    } finally {
      setPushingRaw(false);
    }
  }

  // Copy full env to clipboard
  function handleCopyFull() {
    navigator.clipboard.writeText(rawText);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  }

  // Copy particular key-value pair or key/value individually
  function handleCopyPair(key, value) {
    navigator.clipboard.writeText(`${key}=${value}`);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navbar */}
      <header className="border-b border-gray-800 bg-[#070c09]/80 backdrop-blur-md sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 rounded-lg border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-md">
              <KeyRound className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-wider text-white">ENV<span className="text-secondary font-light">-VAULT</span></span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-semibold">
          <span>Project ID:</span>
          <span className="font-mono text-gray-300 select-all">{project._id}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 space-y-8">
        
        {/* Project Branding Banner */}
        <div className="premium-card rounded-2xl p-6 border-primary/25 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{project.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[10px] uppercase font-bold text-primary tracking-wide">
                Vault Active
              </span>
            </div>
            <p className="text-sm text-gray-400 max-w-2xl">{project.description || 'Secure credential management environment.'}</p>
          </div>
          
          <div className="bg-[#0b130e]/80 border border-gray-800 rounded-xl p-4 font-mono text-[11px] text-gray-300 w-full md:w-auto shadow-lg space-y-2 min-w-[280px]">
            <div className="flex items-center gap-2 text-secondary pb-1 border-b border-gray-800/50">
              <Terminal className="w-4 h-4" />
              <span className="font-bold">Sync CLI Workspace</span>
            </div>
            <div>
              <span className="text-gray-500"># 1. Link this directory (once)</span>
              <p className="text-gray-300"><span className="text-secondary">$</span> env-vault init {project._id}</p>
            </div>
            <div>
              <span className="text-gray-500"># 2. Pull secrets to local .env</span>
              <p className="text-gray-300"><span className="text-secondary">$</span> env-vault pull {activeTab}</p>
            </div>
          </div>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-gray-800">
          {['development', 'staging', 'production'].map((env) => (
            <button
              key={env}
              onClick={() => {
                setActiveTab(env);
                setEditingRaw(false);
              }}
              className={`px-6 py-4 font-bold text-sm border-b-2 uppercase tracking-wider transition-all ${
                activeTab === env 
                  ? 'border-primary text-primary bg-primary/5' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {env}
            </button>
          ))}
        </div>

        {/* Grid layout for structured form and env values */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Editor & values */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Editor Selector bar */}
            <div className="flex items-center justify-between bg-[#070c09]/80 border border-gray-800 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingRaw(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    !editingRaw 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                  <span>Structured Table</span>
                </button>
                <button
                  onClick={() => setEditingRaw(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    editingRaw 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Full .env Block</span>
                </button>
              </div>

              {/* Copy Full Env Button */}
              <button
                onClick={handleCopyFull}
                className="flex items-center gap-1.5 text-xs text-secondary hover:text-white transition-colors"
                title="Copy Full Environment file variables"
              >
                {copiedFull ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied full .env!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Full Env</span>
                  </>
                )}
              </button>
            </div>

            {loadingVars ? (
              <div className="premium-card rounded-2xl h-96 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              </div>
            ) : editingRaw ? (
              /* Raw textblock editor view */
              <div className="premium-card rounded-2xl p-6 border-primary/20 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-bold text-white">Full .env Text Sync</h3>
                    <p className="text-xs text-gray-400">Edit values as standard key-value string blocks</p>
                  </div>
                  <button
                    onClick={handlePushFullEnv}
                    disabled={pushingRaw}
                    className="btn-primary px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 font-semibold disabled:opacity-50 text-white"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{pushingRaw ? 'Pushing Env...' : 'Push Full Env'}</span>
                  </button>
                </div>
                <textarea
                  rows="12"
                  className="w-full p-4 bg-[#0b130e] border border-gray-800 rounded-xl font-mono text-sm text-green-300 focus:border-primary focus:outline-none leading-relaxed"
                  placeholder="PORT=5000&#10;DATABASE_URL=mongodb://...&#10;SECRET=value"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
                <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg text-[11px] text-yellow-200">
                  <Info className="w-4 h-4 shrink-0 text-yellow-400" />
                  <span>
                    <strong>Warning:</strong> Pushing this block replaces the environment variables completely with this set. Lines starting with <code>#</code> or lacking <code>=</code> will be ignored.
                  </span>
                </div>
              </div>
            ) : (
              /* Structured Table View */
              <div className="premium-card rounded-2xl overflow-hidden border-primary/20">
                {variables.length === 0 ? (
                  <div className="p-12 text-center text-gray-500 space-y-2">
                    <AlignLeft className="w-12 h-12 mx-auto opacity-30 text-primary" />
                    <h4 className="text-white font-semibold">No environment variables here yet</h4>
                    <p className="text-xs">Add variables using the panel on the right or upload via CLI.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-800 bg-[#070c09]/30">
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Key</th>
                          <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Value</th>
                          <th className="p-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/60">
                        {variables.map((variable) => {
                          const isVisible = visibleValues[variable.key];
                          return (
                            <tr key={variable.key} className="hover:bg-[#070c09]/20 transition-colors">
                              <td className="p-4 font-mono text-sm text-white font-bold select-all">{variable.key}</td>
                              <td className="p-4 font-mono text-sm">
                                {isVisible ? (
                                  <span className="text-secondary select-all">{variable.value}</span>
                                ) : (
                                  <span className="text-gray-600 tracking-wider">••••••••••••••••</span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  {/* Toggle visible */}
                                  <button
                                    onClick={() => toggleVisibility(variable.key)}
                                    className="p-1.5 rounded bg-white/5 border border-white/10 hover:border-gray-600 text-gray-400 hover:text-white transition-all"
                                    title={isVisible ? "Hide Value" : "Show Value"}
                                  >
                                    {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>

                                  {/* Copy individual pair */}
                                  <button
                                    onClick={() => handleCopyPair(variable.key, variable.value)}
                                    className="p-1.5 rounded bg-white/5 border border-white/10 hover:border-secondary/50 text-gray-400 hover:text-secondary transition-all"
                                    title="Copy Key=Value pair"
                                  >
                                    {copiedKey === variable.key ? (
                                      <Check className="w-3.5 h-3.5 text-secondary" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  {/* Delete key */}
                                  <button
                                    onClick={() => handleDeleteVar(variable.key)}
                                    className="p-1.5 rounded bg-red-950/20 border border-red-950 hover:border-red-500/50 hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all"
                                    title="Delete Variable"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Structured Add Variable block */}
          <div className="lg:col-span-4 space-y-6">
            <div className="premium-card rounded-2xl p-6 border-primary/20">
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-primary" />
                <span>Add Variable</span>
              </h3>
              <p className="text-xs text-gray-400 mb-4">Inject a single key-value credential pair into active environment.</p>

              <form onSubmit={handleSaveVar} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Variable Key</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MONGO_URI"
                    className="w-full px-3.5 py-2.5 rounded-lg input-premium font-mono text-xs"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Variable Value</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. mongodb://..."
                    className="w-full px-3.5 py-2.5 rounded-lg input-premium font-mono text-xs"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={addingVar}
                  className="w-full py-2.5 btn-primary rounded-lg font-semibold text-xs text-white flex items-center justify-center gap-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{addingVar ? 'Injecting...' : 'Save Pair'}</span>
                </button>
              </form>
            </div>

            {/* Quick guide card */}
            <div className="premium-card rounded-2xl p-6 border-gray-800 bg-[#070c09]/30">
              <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Info className="w-4 h-4 text-secondary" />
                <span>Format Rules</span>
              </h4>
              <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
                <li>Key names will be auto-capitalized.</li>
                <li>Avoid spaces in key names.</li>
                <li>Values will be encrypted instantly on saving using AES-256-GCM.</li>
                <li>Decryption happens only on demand during viewing or CLI pull.</li>
              </ul>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
