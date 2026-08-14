'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles,
  Tv,
  Check,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useUser } from '@/context/UserContext';

interface Reservation {
  id: string;
  titre: string;
  demandeurNom: string;
  demandeurEmail: string;
  date: string;
  heureDebut: string;
  heureFin: string;
  participants: number;
  motif?: string;
  statut: string;
}

interface Salle {
  id: string;
  code: string;
  nom: string;
  capacite: number;
  emplacement: string;
  equipements: string[] | any;
  estActive: boolean;
  reservations: Reservation[];
}

const SALLES_DEFAUT = [
  { id: 'GRANDE_SALLE', nom: 'La grande salle de réunion', capacite: 30, emplacement: 'Siège T-OIL — 1er Étage' },
  { id: 'HALL_DG', nom: 'La salle de réunion Hall DG', capacite: 12, emplacement: 'Direction Générale — RDC' },
  { id: 'HALL_FINANCE', nom: 'La salle de réunion Hall Finance', capacite: 10, emplacement: 'Direction Financière — 1er Étage' },
  { id: 'HALL_COMMERCIAL', nom: 'La salle de réunion Hall Commercial', capacite: 10, emplacement: 'Direction Commerciale — RDC' },
  { id: 'HALL_OPERATION', nom: 'La salle de réunion Hall Opération', capacite: 15, emplacement: 'Direction des Opérations — Bâtiment B' },
  { id: 'JURIDIQUE', nom: 'La salle de réunion Juridique', capacite: 8, emplacement: 'Direction Juridique — 2ème Étage' },
];

export default function ReservationsClient() {
  const { userName, userEmail, userRole, isAdmin } = useUser();
  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSalleId, setSelectedSalleId] = useState<string>('');

  // Form State
  const [titre, setTitre] = useState('');
  const [demandeurNom, setDemandeurNom] = useState('');
  const [demandeurEmail, setDemandeurEmail] = useState('');
  const [dateResa, setDateResa] = useState(todayStr);
  const [heureDebut, setHeureDebut] = useState('09:00');
  const [heureFin, setHeureFin] = useState('10:00');
  const [participants, setParticipants] = useState(4);
  const [motif, setMotif] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto pre-fill user info when user context updates
  useEffect(() => {
    if (userName) setDemandeurNom(userName);
    if (userEmail) setDemandeurEmail(userEmail);
  }, [userName, userEmail]);


  // Fetch salles and reservations for selected date
  const fetchReservations = async (date: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reservations?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.salles) && data.salles.length > 0) {
          setSalles(data.salles);
        }
      }
    } catch (err) {
      console.error('Erreur chargement réservations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations(selectedDate);
  }, [selectedDate]);

  const handleOpenModal = (salleId?: string) => {
    const list = salles.length > 0 ? salles : SALLES_DEFAUT;
    if (salleId) {
      setSelectedSalleId(salleId);
    } else if (list.length > 0) {
      setSelectedSalleId(list[0].id);
    }
    setDateResa(selectedDate);
    setAlertMsg(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAlertMsg(null);
  };

  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalleId || !titre.trim() || !demandeurNom.trim() || !demandeurEmail.trim() || !dateResa) {
      setAlertMsg({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    if (heureDebut >= heureFin) {
      setAlertMsg({ type: 'error', text: 'L\'heure de début doit être antérieure à l\'heure de fin.' });
      return;
    }

    setIsSubmitting(true);
    setAlertMsg(null);

    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salleId: selectedSalleId,
          titre: titre.trim(),
          demandeurNom: demandeurNom.trim(),
          demandeurEmail: demandeurEmail.trim(),
          date: dateResa,
          heureDebut,
          heureFin,
          participants,
          motif: motif.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setAlertMsg({ type: 'success', text: data.message || 'Réservation confirmée avec succès !' });
        setTitre('');
        setMotif('');
        fetchReservations(selectedDate);
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        throw new Error(data.error || 'Impossible d\'enregistrer la réservation.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue.';
      setAlertMsg({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnnulerReservation = async (resId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) return;

    try {
      const res = await fetch(`/api/reservations?id=${resId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReservations(selectedDate);
      } else {
        alert('Erreur lors de l\'annulation de la réservation.');
      }
    } catch (err) {
      console.error('Erreur annulation:', err);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Accueil
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Réservations de Salles T-OIL</span>
      </div>

      {/* Header avec action de création */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center shadow-md text-white">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
              Réservations des Salles de Réunion
            </h1>
            <p className="text-sm text-slate-500">
              Consultez la disponibilité des 6 salles de réunion T-OIL et planifiez vos rencontres d'équipe.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          Réserver une Salle
        </button>
      </div>

      {/* Date Navigator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="Jour précédent"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => changeDateByDays(1)}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="Jour suivant"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {selectedDate !== todayStr && (
            <button
              onClick={() => setSelectedDate(todayStr)}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors ml-2"
            >
              Aujourd'hui
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Date sélectionnée :{' '}
          <strong className="text-slate-900">
            {new Date(selectedDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </strong>
        </div>
      </div>

      {/* Grille des 6 Salles */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="text-sm font-semibold">Chargement du planning des salles...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salles.map((salle) => {
            const hasBookings = salle.reservations && salle.reservations.length > 0;

            return (
              <div
                key={salle.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div>
                  {/* Header Salle */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 line-clamp-1">{salle.nom}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {salle.emplacement}
                      </p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 shrink-0 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {salle.capacite} pl.
                    </span>
                  </div>

                  {/* Équipements */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {Array.isArray(salle.equipements) &&
                      salle.equipements.map((eq: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200"
                        >
                          {eq}
                        </span>
                      ))}
                  </div>

                  {/* Horaires réservés aujourd'hui */}
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 flex items-center justify-between">
                      <span>Occupations du jour</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {hasBookings ? `${salle.reservations.length} réunion(s)` : 'Libre toute la journée'}
                      </span>
                    </h4>

                    {hasBookings ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {salle.reservations.map((res) => (
                          <div
                            key={res.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                                  {res.heureDebut} - {res.heureFin}
                                </span>
                                <span className="text-xs font-bold text-slate-800 truncate">{res.titre}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                Réservé par : <strong>{res.demandeurNom}</strong>
                              </p>
                            </div>

                            {(userEmail === res.demandeurEmail || isAdmin) && (
                              <button
                                onClick={() => handleAnnulerReservation(res.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Annuler cette réservation"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-4 text-center bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs font-medium text-emerald-800">
                        ✨ Aucun créneau occupé à cette date
                      </div>
                    )}
                  </div>
                </div>

                {/* Bouton d'action */}
                <button
                  onClick={() => handleOpenModal(salle.id)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4" />
                  Réserver un créneau
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Réservation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-6 relative my-8">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Réservation de Salle</h3>
                  <p className="text-xs text-slate-500">Formulaire officiel de réservation T-OIL</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification de Statut */}
            {alertMsg && (
              <div
                className={`p-4 rounded-xl flex items-center gap-3 text-xs font-semibold ${
                  alertMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {alertMsg.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span>{alertMsg.text}</span>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Choix de la Salle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Salle de réunion *
                </label>
                <select
                  required
                  value={selectedSalleId}
                  onChange={(e) => setSelectedSalleId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer shadow-xs"
                >
                  <option value="" disabled className="text-slate-400 bg-white">
                    -- Sélectionner une salle de réunion --
                  </option>
                  {(salles.length > 0 ? salles : SALLES_DEFAUT).map((s) => (
                    <option key={s.id} value={s.id} className="text-slate-900 bg-white font-medium py-1.5">
                      {s.nom} ({s.capacite} places) — {s.emplacement}
                    </option>
                  ))}
                </select>
              </div>

              {/* Objet / Titre de la réunion */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Objet de la réunion *
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Réunion CODIR, Point Projet IT, Entretien RH..."
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Identité du Demandeur */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom du demandeur *
                  </label>
                  <input
                    type="text"
                    required
                    value={demandeurNom}
                    onChange={(e) => setDemandeurNom(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email du demandeur *
                  </label>
                  <input
                    type="email"
                    required
                    value={demandeurEmail}
                    onChange={(e) => setDemandeurEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Date & Horaires */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date de la réservation *
                </label>
                <input
                  type="date"
                  required
                  value={dateResa}
                  onChange={(e) => setDateResa(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heure de début *
                  </label>
                  <select
                    value={heureDebut}
                    onChange={(e) => setHeureDebut(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {[
                      '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
                      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
                      '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Heure de fin *
                  </label>
                  <select
                    value={heureFin}
                    onChange={(e) => setHeureFin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  >
                    {[
                      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
                      '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
                      '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Participants & Motif */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Participants
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={participants}
                    onChange={(e) => setParticipants(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Remarques / Besoins spécifiques (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Prévoir visioconférence, café..."
                    value={motif}
                    onChange={(e) => setMotif(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Action Submit */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Vérification des disponibilités...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirmer la Réservation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
