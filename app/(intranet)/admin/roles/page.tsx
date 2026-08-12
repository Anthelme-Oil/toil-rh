'use client';

// ═══════════════════════════════════════════════════════════════
// Page Administration — Gestion Utilisateurs, Privilèges & Workflows
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
  Settings as SettingsIcon,
  Check,
  X,
  FileText,
  Laptop
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useUser } from '@/context/UserContext';
import type { UserRoleRecord } from '@/lib/roles';

export default function AdminRolesPage() {
  const { isAdmin, refreshPermissions } = useUser();
  const [activeTab, setActiveTab] = useState<'users' | 'workflows' | 'settings'>('users');

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
    isDRH: false,
    isRHPrint: false,
    isRoomManager: false,
  });

  // ── État Configuration E-mails & Notifications ──
  const [settings, setSettings] = useState({
    senderEmail: 'it.helpdesk@togosh.com',
    rhEmail: 'rh@compel-toil.com',
    rhPrintEmail: 'rh.attestation@compel-toil.com',
    drhEmail: 'drh@compel-toil.com',
    itRespEmail: 'it.responsable@togosh.com',
    itSupportEmail: 'it.support@togosh.com',
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
      const res = await fetch(`/api/admin/settings?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSettings({
          senderEmail: data.senderEmail || 'it.helpdesk@togosh.com',
          rhEmail: data.rhEmail || 'rh@compel-toil.com',
          rhPrintEmail: data.rhPrintEmail || 'rh.attestation@compel-toil.com',
          drhEmail: data.drhEmail || 'drh@compel-toil.com',
          itRespEmail: data.itRespEmail || 'it.responsable@togosh.com',
          itSupportEmail: data.itSupportEmail || 'it.support@togosh.com',
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
        setNewUser({
          name: '',
          email: '',
          role: 'EMPLOYE',
          managerEmail: '',
          isRH: false,
          isCom: false,
          isDRH: false,
          isRHPrint: false,
          isRoomManager: false,
        });
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
          message: 'Configuration des workflows et e-mails mise à jour avec succès.',
          type: 'success',
        });
        await loadSettings();
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
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200/60 shadow-sm">
          <ShieldCheck className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Accès Réservé aux Administrateurs</h1>
          <p className="text-slate-500 text-sm mt-2">
            Cette page d&apos;administration nécessite d&apos;être connecté avec un compte disposant du rôle{' '}
            <strong className="text-slate-800">Administrateur</strong>.
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm text-left">
          <button
            onClick={() => signIn('azure-ad')}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span>Connexion Microsoft 365 (Sélectionner un compte Admin)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            Panneau d&apos;Administration T-OIL
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Gérez les privilèges des collaborateurs, configurez les workflows et les notifications e-mails.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadUsers();
              loadSettings();
            }}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all text-xs font-semibold flex items-center gap-1.5"
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
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'users'
              ? 'border-primary text-primary bg-primary-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Membres & Privilèges ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('workflows')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'workflows'
              ? 'border-primary text-primary bg-primary-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Membres des Workflows</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
            activeTab === 'settings'
              ? 'border-primary text-primary bg-primary-50/40 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Configuration E-mails & Graph</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold shadow-xs transition-all animate-fade-in ${
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

      {/* TAB 1: GESTION DES MEMBRES ET PRIVILEGES */}
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
                className="w-full pl-9 pr-4 py-2 bg-transparent text-xs focus:outline-none text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 flex-shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ajouter un utilisateur</span>
            </button>
          </div>

          {/* Tableau des utilisateurs */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            {loading ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                <p className="text-xs font-medium">Chargement des autorisations...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-medium">
                Aucun utilisateur trouvé.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/70 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4 w-[22%]">Utilisateur / Email</th>
                      <th className="py-3.5 px-4 w-[13%]">Rôle Système</th>
                      <th className="py-3.5 px-4 w-[18%]">Supérieur N+1 (Manager)</th>
                      <th className="py-3.5 px-4 text-center w-[8%]" title="Validation Congés (RH)">RH</th>
                      <th className="py-3.5 px-4 text-center w-[8%]" title="Droit de Publication SharePoint">Pub. Com</th>
                      <th className="py-3.5 px-4 text-center w-[8%]" title="Validation Congés DRH">DRH</th>
                      <th className="py-3.5 px-4 text-center w-[8%]" title="Télécharger/Imprimer historique PDF">RH Print</th>
                      <th className="py-3.5 px-4 text-center w-[8%]" title="Gérer réservations de salles">Gest. Salles</th>
                      <th className="py-3.5 px-4 text-right w-[15%]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 leading-tight">{user.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{user.email}</div>
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={user.role}
                            onChange={(e) => {
                              const updated = { ...user, role: e.target.value as UserRoleRecord['role'] };
                              setUsers(users.map((u) => (u.id === user.id ? updated : u)));
                            }}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none"
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
                            className="w-full max-w-[180px] px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-primary/20 outline-none truncate"
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

                        {/* RH checkbox */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={user.isRH}
                            onChange={(e) => {
                              const updated = { ...user, isRH: e.target.checked };
                              setUsers(users.map((u) => (u.id === user.id ? updated : u)));
                            }}
                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                          />
                        </td>

                        {/* Com / Pub checkbox */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={user.isCom}
                            onChange={(e) => {
                              const updated = { ...user, isCom: e.target.checked };
                              setUsers(users.map((u) => (u.id === user.id ? updated : u)));
                            }}
                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                          />
                        </td>

                        {/* DRH validation checkbox */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={user.isDRH}
                            onChange={(e) => {
                              const updated = { ...user, isDRH: e.target.checked };
                              setUsers(users.map((u) => (u.id === user.id ? updated : u)));
                            }}
                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                          />
                        </td>

                        {/* RH Print checkbox */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={user.isRHPrint}
                            onChange={(e) => {
                              const updated = { ...user, isRHPrint: e.target.checked };
                              setUsers(users.map((u) => (u.id === user.id ? updated : u)));
                            }}
                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                          />
                        </td>

                        {/* Room Manager checkbox */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={user.isRoomManager}
                            onChange={(e) => {
                              const updated = { ...user, isRoomManager: e.target.checked };
                              setUsers(users.map((u) => (u.id === user.id ? updated : u)));
                            }}
                            className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                          />
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => handleUpdateUser(user)}
                            disabled={savingId === user.id}
                            className="px-2.5 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-[11px] font-extrabold transition-colors inline-flex items-center gap-1"
                          >
                            {savingId === user.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Save className="w-3 h-3" />
                            )}
                            <span>Sauver</span>
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

      {/* TAB 2: MEMBRES DE CHAQUE WORKFLOW */}
      {activeTab === 'workflows' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Membres et emails des Workflows</h2>
                <p className="text-xs text-slate-500">
                  Définissez les adresses e-mails responsables de chaque étape des processus administratifs et informatiques.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              {/* SECTION: WORKFLOW CONGES & SERVICES ADMINISTRATIFS */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <FileText className="w-4 h-4 text-amber-500" />
                  Workflow Demande Administrative / Congés
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* DRH validation email */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Email de la Direction des Ressources Humaines (DRH) :
                    </label>
                    <input
                      type="email"
                      value={settings.drhEmail}
                      onChange={(e) => setSettings({ ...settings, drhEmail: e.target.value })}
                      required
                      placeholder="ex: drh@compel-toil.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Cet email valide les congés après l&apos;approbation du Manager N+1 et reçoit les notifications d&apos;alertes.
                    </p>
                  </div>

                  {/* RH attestation print email */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Email RH Responsable Impression Attestations :
                    </label>
                    <input
                      type="email"
                      value={settings.rhPrintEmail}
                      onChange={(e) => setSettings({ ...settings, rhPrintEmail: e.target.value })}
                      required
                      placeholder="ex: rh.attestation@compel-toil.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Ce membre reçoit l&apos;historique complet validé en PDF pour l&apos;impression papier des attestations officielles.
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION: WORKFLOW IT / DEPARTEMENT IT */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Laptop className="w-4 h-4 text-blue-500" />
                  Workflow Services Informatiques (IT)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Responsable IT */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Responsable IT (Chef de Service) :
                    </label>
                    <input
                      type="email"
                      value={settings.itRespEmail}
                      onChange={(e) => setSettings({ ...settings, itRespEmail: e.target.value })}
                      required
                      placeholder="ex: it.responsable@togosh.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Reçoit et valide les demandes de matériels informatiques ou d&apos;accès sensibles à l&apos;échelle du service.
                    </p>
                  </div>

                  {/* IT Support */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Email Support IT / Techniciens de maintenance :
                    </label>
                    <input
                      type="email"
                      value={settings.itSupportEmail}
                      onChange={(e) => setSettings({ ...settings, itSupportEmail: e.target.value })}
                      required
                      placeholder="ex: it.support@togosh.com"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                    <p className="text-[10px] text-slate-400 leading-normal">
                      Reçoit les tickets de dépannage informatique généraux pour traitement rapide.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="pt-4 flex justify-end border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  {savingSettings ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Enregistrer les adresses des workflows</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURATION DES E-MAILS & NOTIFICATIONS */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Card 1 : Configuration Microsoft Graph */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Envoi d&apos;E-mails & Graph API</h2>
                <p className="text-xs text-slate-500">
                  Définissez l&apos;expéditeur SSO et le comportement général d&apos;envoi de courriels.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expéditeur Microsoft 365 */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Email Expéditeur Microsoft 365 (SSO) :
                  </label>
                  <input
                    type="email"
                    value={settings.senderEmail}
                    onChange={(e) => setSettings({ ...settings, senderEmail: e.target.value })}
                    required
                    placeholder="ex: it.helpdesk@togosh.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Cette adresse doit posséder des autorisations d&apos;envoi actives via Graph API (Mail.Send) dans votre Tenant.
                  </p>
                </div>

                {/* Email de copie d'alerte RH */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">
                    Email de réception des alertes générales RH :
                  </label>
                  <input
                    type="email"
                    value={settings.rhEmail}
                    onChange={(e) => setSettings({ ...settings, rhEmail: e.target.value })}
                    required
                    placeholder="ex: rh@compel-toil.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Adresse générique du service RH notifiée par défaut pour les alertes transversales.
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
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
                />
                <label htmlFor="toggle-notifications" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                  Activer l&apos;envoi d&apos;e-mails automatiques de validation et de suivi
                </label>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="pt-3 flex justify-end border-t border-slate-100">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2"
                >
                  {savingSettings ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Enregistrer la Configuration Système</span>
                </button>
              </div>
            </form>
          </div>

          {/* Card 2 : Outil de Test d'Envoi d'E-mail Immédiat */}
          <div className="bg-slate-950 text-white border border-slate-800 rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-900 pb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold animate-pulse">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Outil de test d&apos;envoi (Microsoft Graph)</h2>
                <p className="text-xs text-slate-400">
                  Validez la communication entre Microsoft 365 et l&apos;intranet en expédiant un e-mail réel instantanément.
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
                className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={sendingTestMail || !testRecipient}
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 flex-shrink-0"
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
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/30 text-red-200'
                }`}
              >
                <div className="font-bold flex items-center gap-2 mb-1">
                  {testMailResult.success ? (
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-red-400 shrink-0" />
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
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 border border-slate-200/80 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-extrabold text-slate-900">Ajouter un nouveau membre</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Nom complet</label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Jean Dupont"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Adresse Email</label>
                  <input
                    type="email"
                    required
                    placeholder="ex: j.dupont@togosh.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Rôle Principal Système</label>
                  <select
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value as UserRoleRecord['role'] })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                  >
                    <option value="EMPLOYE">EMPLOYE</option>
                    <option value="MANAGER">MANAGER</option>
                    <option value="RH">RH</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Supérieur N+1 (Manager)</label>
                  <select
                    value={newUser.managerEmail}
                    onChange={(e) => setNewUser({ ...newUser, managerEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">-- Aucun --</option>
                    {users.map((m) => (
                      <option key={m.id} value={m.email}>
                        {m.name} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Privilèges spécifiques</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUser.isRH}
                      onChange={(e) => setNewUser({ ...newUser, isRH: e.target.checked })}
                      className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                    />
                    Dossiers RH
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUser.isCom}
                      onChange={(e) => setNewUser({ ...newUser, isCom: e.target.checked })}
                      className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                    />
                    Publication (Com)
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUser.isDRH}
                      onChange={(e) => setNewUser({ ...newUser, isDRH: e.target.checked })}
                      className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                    />
                    Validation DRH
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUser.isRHPrint}
                      onChange={(e) => setNewUser({ ...newUser, isRHPrint: e.target.checked })}
                      className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                    />
                    Impression RH
                  </label>

                  <label className="flex items-center gap-2 text-xs text-slate-700 font-semibold cursor-pointer col-span-2">
                    <input
                      type="checkbox"
                      checked={newUser.isRoomManager}
                      onChange={(e) => setNewUser({ ...newUser, isRoomManager: e.target.checked })}
                      className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                    />
                    Gestionnaire de Salles
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-extrabold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingId === 'new'}
                  className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {savingId === 'new' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Créer le membre</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
