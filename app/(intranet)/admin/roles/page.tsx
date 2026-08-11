'use client';

// ═══════════════════════════════════════════════════════════════
// Page Administration — Gestion Utilisateurs & Configuration E-mails
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
  Send,
  Sliders,
  Users,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useUser } from '@/context/UserContext';
import type { UserRoleRecord } from '@/lib/roles';

export default function AdminRolesPage() {
  const { isAdmin, refreshPermissions } = useUser();
  const [activeTab, setActiveTab] = useState<'users' | 'settings'>('users');

  // ── État Utilisateurs & Rôles ──
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

  // ── État Configuration E-mails & Notifications ──
  const [settings, setSettings] = useState({
    senderEmail: 'it.helpdesk@togosh.com',
    rhEmail: 'rh@compel-toil.com',
    enableEmailNotifications: true,
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');
  const [sendingTestMail, setSendingTestMail] = useState(false);
  const [testMailResult, setTestMailResult] = useState<{ success: boolean; message: string } | null>(null);

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

  const loadSettings = async () => {
    setLoadingSettings(true);
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings({
          senderEmail: data.senderEmail || 'it.helpdesk@togosh.com',
          rhEmail: data.rhEmail || 'rh@compel-toil.com',
          enableEmailNotifications: data.enableEmailNotifications !== undefined ? data.enableEmailNotifications : true,
        });
      }
    } catch (err) {
      console.error('Erreur chargement paramètres:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadSettings();
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setNotification({
          message: 'Configuration des e-mails mise à jour avec succès.',
          type: 'success',
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Erreur d’enregistrement');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur sauvegarde paramètres';
      setNotification({ message: msg, type: 'error' });
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTestMail(true);
    setTestMailResult(null);
    try {
      const res = await fetch('/api/admin/settings/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: testRecipient }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestMailResult({ success: true, message: data.message });
      } else {
        setTestMailResult({ success: false, message: data.error || 'Échec d’envoi du mail de test' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur envoi de test';
      setTestMailResult({ success: false, message: msg });
    } finally {
      setSendingTestMail(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-200 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accès Réservé aux Administrateurs</h1>
          <p className="text-slate-500 text-sm mt-2">
            Cette page d&apos;administration nécessite d&apos;être connecté avec un compte disposant du rôle{' '}
            <strong className="text-slate-800">Administrateur</strong>.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm text-left">
          <button
            onClick={() => signIn('azure-ad')}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Connexion Microsoft 365 (Sélectionner un compte Admin)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            Panneau d&apos;Administration T-OIL
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Gérez les autorisations des collaborateurs et la configuration des notifications e-mails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadUsers();
              loadSettings();
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-1.5"
            title="Rafraîchir les données"
          >
            <RefreshCw className={`w-4 h-4 ${loading || loadingSettings ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Utilisateurs & Rôles ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Configuration E-mails & System</span>
        </button>
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

      {/* TAB 1: GESTION DES UTILISATEURS */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un collaborateur par nom, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-transparent text-sm focus:outline-none text-slate-800"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2 flex-shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ajouter un utilisateur</span>
            </button>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                <p className="text-xs">Chargement des autorisations...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                Aucun utilisateur trouvé.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Utilisateur / Email</th>
                      <th className="py-3 px-4">Rôle Système</th>
                      <th className="py-3 px-4">Supérieur N+1 (Manager)</th>
                      <th className="py-3 px-4 text-center">Accès RH</th>
                      <th className="py-3 px-4 text-center">Accès Com</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{user.name}</div>
                          <div className="text-[11px] text-slate-400">{user.email}</div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => {
                              const updated = { ...user, role: e.target.value as UserRoleRecord['role'] };
                              setUsers(users.map((u) => (u.id === user.id ? updated : u)));
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          >
                            <option value="EMPLOYE">EMPLOYE</option>
                            <option value="MANAGER">MANAGER</option>
                            <option value="RH">RH</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={user.managerEmail || ''}
                            onChange={(e) => {
                              const updated = { ...user, managerEmail: e.target.value };
                              setUsers(users.map((u) => (u.id === user.id ? updated : u)));
                            }}
                            className="w-full max-w-[200px] px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20 outline-none truncate"
                          >
                            <option value="">-- Aucun N+1 --</option>
                            {users
                              .filter((m) => m.email !== user.email)
                              .map((m) => (
                                <option key={m.id} value={m.email}>
                                  {m.name} ({m.email})
                                </option>
                              ))}
                          </select>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={user.isRH}
                            onChange={(e) => {
                              const updated = { ...user, isRH: e.target.checked };
                              setUsers(users.map((u) => (u.id === user.id ? updated : u)));
                            }}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                        </td>

                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={user.isCom}
                            onChange={(e) => {
                              const updated = { ...user, isCom: e.target.checked };
                              setUsers(users.map((u) => (u.id === user.id ? updated : u)));
                            }}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                        </td>

                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleUpdateUser(user)}
                            disabled={savingId === user.id}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                          >
                            {savingId === user.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            <span>Enregistrer</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(user.email, user.name)}
                            disabled={deletingEmail === user.email}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                            title="Supprimer l'utilisateur"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CONFIGURATION DES E-MAILS & NOTIFICATIONS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Card 1 : Formulaire de configuration des e-mails */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Adresses E-mails système T-OIL</h2>
                <p className="text-xs text-slate-500">
                  Définissez la boîte expéditrice Microsoft 365 et l&apos;adresse de réception des alertes RH.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expéditeur Microsoft 365 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Email Expéditeur Microsoft 365 (Microsoft Graph) :
                  </label>
                  <input
                    type="email"
                    value={settings.senderEmail}
                    onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                    required
                    placeholder="ex: it.helpdesk@togosh.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Cette boîte doit exister dans votre tenant Microsoft 365 et posséder la permission{' '}
                    <strong className="text-slate-700">Mail.Send</strong> dans Azure AD.
                  </p>
                </div>

                {/* Destinataire RH */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Email Destinataire des Notifications RH :
                  </label>
                  <input
                    type="email"
                    value={settings.rhEmail}
                    onChange={(e) => setSettings({ ...settings, rhEmail: e.target.value })}
                    required
                    placeholder="ex: rh@compel-toil.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Adresse qui recevra une alerte lorsqu&apos;un congé est approuvé par un supérieur N+1.
                  </p>
                </div>
              </div>

              {/* Toggle activation */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="toggle-notifications"
                  checked={settings.enableEmailNotifications}
                  onChange={(e) => setSettings({ ...settings, enableEmailNotifications: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="toggle-notifications" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Activer les envois d&apos;e-mails automatiques (N+1, RH, Relances)
                </label>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  {savingSettings ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Enregistrer la Configuration</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2 : Outil de Test d'Envoi d'E-mail Immédiat */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Tester l&apos;envoi d&apos;un e-mail (Validation Graph API)</h2>
                <p className="text-xs text-slate-400">
                  Envoyez un message de test réel pour valider la communication entre Microsoft 365 et l&apos;intranet.
                </p>
              </div>
            </div>

            <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="email"
                placeholder="Adresse du destinataire (ex: votre.email@togosh.com)..."
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                required
                className="flex-1 px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={sendingTestMail || !testRecipient}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 flex-shrink-0"
              >
                {sendingTestMail ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Envoyer le mail de test</span>
              </button>
            </form>

            {/* Résultat du test */}
            {testMailResult && (
              <div
                className={`p-4 rounded-xl text-xs leading-relaxed border ${
                  testMailResult.success
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/60 border-red-500/40 text-red-200'
                }`}
              >
                <div className="font-bold flex items-center gap-2 mb-1">
                  {testMailResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{testMailResult.success ? 'Succès Graph API !' : 'Erreur d’envoi'}</span>
                </div>
                <p>{testMailResult.message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Ajout Utilisateur */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Ajouter un utilisateur</h2>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Jean Dupont"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse Email</label>
                <input
                  type="email"
                  required
                  placeholder="ex: j.dupont@togosh.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rôle Principal</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value as UserRoleRecord['role'] })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none"
                >
                  <option value="EMPLOYE">EMPLOYE</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="RH">RH</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Supérieur N+1</label>
                <select
                  value={newUser.managerEmail}
                  onChange={(e) => setNewUser({ ...newUser, managerEmail: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none"
                >
                  <option value="">-- Aucun --</option>
                  {users.map((m) => (
                    <option key={m.id} value={m.email}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={newUser.isRH}
                    onChange={(e) => setNewUser({ ...newUser, isRH: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  Droits RH
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={newUser.isCom}
                    onChange={(e) => setNewUser({ ...newUser, isCom: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  Droits Com
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingId === 'new'}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  {savingId === 'new' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Créer l&apos;utilisateur</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
