import type { Metadata } from 'next';
import ReservationsClient from '@/components/reservations/ReservationsClient';

export const metadata: Metadata = {
  title: 'Réservations de Salles — T-OIL Intranet',
  description: 'Portail de réservation en temps réel des salles de réunion de la société T-OIL.',
};

export default function ReservationsPage() {
  return <ReservationsClient />;
}
