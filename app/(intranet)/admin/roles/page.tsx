'use client';

// ═══════════════════════════════════════════════════════════════
// Page Administration — Design Épuré, Intuitif & Professionnel
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Search,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Mail,
  Trash2,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';
import type { UserRoleRecord } from '@/lib/roles';

export default function AdminRolesPage() {
  const { refreshPermissions } = useUser();
  const [users, setUsers] = useState<UserRoleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Modal d'ajout d'utilisateur
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'EMPLOYE' as UserRoleRecord['role'],
    managerEmail: '',
    isRH: false,
    isCom: false,
  });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/roles');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.roles || []);
      }
    } catch (err) {
      console.error('Erreur chargement rôles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateUser = async (userToUpdate: UserRoleRecord) => {
    setSavingId(userToUpdate.id);
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userToUpdate),
      });

      const data = await res.json();

      if (res.ok) {
        setNotification({
          message: `Modifications enregistrées pour ${userToUpdate.name}`,
          type: 'success',
        });
        refreshPermissions();
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error(data.error || 'Échec de la mise à jour');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.';
      setNotification({ message: msg, type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteUser = async (email: string, name: string) => {
    if (!confirm(`Voulez-vous vraiment supprimer ${name} (${email}) ?`)) return;

    setDeletingEmail(email);
    try {
      const res = await fetch(`/api/roles?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setNotification({
          message: `Utilisateur ${name} supprimé.`,
          type: 'success',
        });
        await loadUsers();
        refreshPermissions();
        setTimeout(() => setNotification(null), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Erreur de suppression.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression.';
      setNotification({ message: msg, type: 'error' });
    } finally {
      setDeletingEmail(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.email || !newUser.name) return;

    setSavingId('new');
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (res.ok) {
        setNotification({
          message: `Utilisateur ${newUser.name} créé avec succès.`,
          type: 'success',
        });
        setIsAddModalOpen(false);
        setNewUser({ name: '', email: '', role: 'EMPLOYE', managerEmail: '', isRH: false, isCom: false });
        await loadUsers();
        refreshPermissions();
        setTimeout(() => setNotification(null), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Échec de la création');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la création.';
      setNotification({ message: msg, type: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header : Simple & Professionnel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Gestion des Utilisateurs & Rôles
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez les autorisations d'accès, les administrateurs, les accès RH, Com et les supérieurs N+1.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadUsers}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Ajouter un utilisateur</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2.5 text-sm font-medium shadow-xs ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Barre de recherche épurée */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un collaborateur par nom, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-transparent text-sm focus:outline-none text-slate-800"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500 pr-2 hidden sm:block">
          {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Tableau d'administration clean & sobre */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
            <span className="text-xs font-medium">Chargement des données...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-10 text-center text-slate-500 text-sm">
            Aucun utilisateur trouvé.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Utilisateur</th>
                  <th className="py-3 px-5">Rôle</th>
                  <th className="py-3 px-5">Manager Direct (N+1)</th>
                  <th className="py-3 px-3 text-center">Accès RH</th>
                  <th className="py-3 px-3 text-center">Publi. Com</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Collaborateur */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center text-xs border border-slate-200 shrink-0">
                          {user.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{user.name}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sélection du rôle */}
                    <td className="py-3.5 px-5">
                      <select
                        value={user.role}
                        onChange={(e) => {
                          const updatedRole = e.target.value as UserRoleRecord['role'];
                          setUsers((prev) =>
                            prev.map((u) => (u.id === user.id ? { ...u, role: updatedRole } : u))
                          );
                        }}
                        className="py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-colors"
                      >
                        <option value="EMPLOYE">Employé</option>
                        <option value="MANAGER">Manager (N+1)</option>
                        <option value="RH">Ressources Humaines</option>
                        <option value="ADMIN">Administrateur</option>
                      </select>
                    </td>

                    {/* Manager N+1 */}
                    <td className="py-3.5 px-5">
                      <select
                        value={user.managerEmail || ''}
                        onChange={(e) => {
                          const selectedManagerEmail = e.target.value;
                          setUsers((prev) =>
                            prev.map((u) =>
                              u.id === user.id ? { ...u, managerEmail: selectedManagerEmail } : u
                            )
                          );
                        }}
                        className="w-full min-w-[180px] py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:bg-white transition-colors"
                      >
                        <option value="">-- Aucun Manager --</option>
                        {users
                          .filter((candidate) => candidate.email !== user.email)
                          .map((candidate) => (
                            <option key={candidate.id} value={candidate.email}>
                              {candidate.name} ({candidate.email})
                            </option>
                          ))}
                      </select>
                    </td>

                    {/* Accès RH Toggle */}
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={user.isRH}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setUsers((prev) =>
                            prev.map((u) => (u.id === user.id ? { ...u, isRH: checked } : u))
                          );
                        }}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      />
                    </td>

                    {/* Accès Com (Publication) Toggle */}
                    <td className="py-3.5 px-3 text-center">
                      <input
                        type="checkbox"
                        checked={user.isCom}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setUsers((prev) =>
                            prev.map((u) => (u.id === user.id ? { ...u, isCom: checked } : u))
                          );
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                      />
                    </td>

                    {/* Enregistrer & Supprimer */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateUser(user)}
                          disabled={savingId === user.id}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          {savingId === user.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Save className="w-3 h-3" />
                          )}
                          <span>Enregistrer</span>
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.email, user.name)}
                          disabled={deletingEmail === user.email}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors"
                          title="Supprimer"
                        >
                          {deletingEmail === user.email ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal d'ajout d'utilisateur épuré */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-lg border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Ajouter un utilisateur</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom et Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean Dupont"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Adresse Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="ex: j.dupont@compel-toil.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle</label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value as UserRoleRecord['role'] })
                    }
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800"
                  >
                    <option value="EMPLOYE">Employé</option>
                    <option value="MANAGER">Manager (N+1)</option>
                    <option value="RH">RH</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Autorisations</label>
                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={newUser.isRH}
                        onChange={(e) => setNewUser({ ...newUser, isRH: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 accent-emerald-600"
                      />
                      <span>Accès RH</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={newUser.isCom}
                        onChange={(e) => setNewUser({ ...newUser, isCom: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 accent-blue-600"
                      />
                      <span>Publication Com</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Manager N+1</label>
                <select
                  value={newUser.managerEmail}
                  onChange={(e) => setNewUser({ ...newUser, managerEmail: e.target.value })}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800"
                >
                  <option value="">-- Aucun --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingId === 'new'}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  {savingId === 'new' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Créer l'utilisateur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
