"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  ChevronRight,
  Clock3,
  MapPin,
  Play,
  Loader2,
  X,
} from "lucide-react";
import "./hub.css";
import Link from "next/link";

import { Video, Evenement, Annonce, Actualite } from "@/types";
import { actualitesClientService } from "@/lib/services/actualite.service";
import { evenementsClientService } from "@/lib/services/evenements.service";
import { videosClientService } from "@/lib/services/videos.service";
import { annoncesClientService } from "@/lib/services/annonces.service";

// Detection et conversion des URLs YouTube / Vimeo pour iframe
function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return null;
}

const formatEvent = (date: string) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short" })
    .format(new Date(date))
    .replace(".", "");
};

const formatTime = (date: string) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function SectionHeading({
  eyebrow,
  title,
  action,
  href = "#",
}: {
  eyebrow: string;
  title: string;
  action?: string;
  href: string;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {action && (
        <Link href={href} className="text-action">
          {action}
          <ArrowUpRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

export function ContentHub() {
  const [activeAnnouncement, setActiveAnnouncement] = useState(0);

  // ID de la vidéo en cours de lecture
  const [playingVideoId, setPlayingVideoId] = useState<string | number | null>(null);

  // États dynamiques
  const [announcements, setAnnouncements] = useState<Annonce[]>([]);
  const [news, setNews] = useState<Actualite[]>([]);
  const [events, setEvents] = useState<Evenement[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Chargement parallèle optimisé de toutes les données dynamiques
  const fetchHubData = useCallback(async () => {
    setLoading(true);
    try {
      const [annRes, actuRes, evtRes, vidRes] = await Promise.allSettled([
        annoncesClientService.getAll(),
        actualitesClientService.getAll(),
        evenementsClientService.getAll(),
        videosClientService.getAll(),
      ]);

      if (annRes.status === "fulfilled") setAnnouncements(annRes.value);
      if (actuRes.status === "fulfilled") setNews(actuRes.value);
      if (evtRes.status === "fulfilled") setEvents(evtRes.value);
      if (vidRes.status === "fulfilled") setVideos(vidRes.value);
    } catch (error) {
      console.error("Erreur lors du chargement des données du Hub", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHubData();
  }, [fetchHubData]);

  const currentAnnouncement = announcements[activeAnnouncement];

  return (
    <main className="hub-shell">
      {/* Section Hero */}
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">L’essentiel, simplement</p>
          <h1>
            Ce qui fait <em>bouger</em>
            <br />
            notre quotidien.
          </h1>
          <p className="hero-intro">
            Retrouvez ici les nouvelles, les rendez-vous et les histoires qui
            donnent vie à notre territoire.
          </p>
          <div className="hero-actions">
            <Link href="/actualites" className="primary-button">
              Explorer les actualités <ArrowUpRight aria-hidden="true" />
            </Link>
            <span className="hero-note">
              <span className="live-dot" /> Mis à jour en temps réel
            </span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-core">
            fil
            <br />
            <span>public</span>
          </div>
          <span className="art-label label-one">informations</span>
          <span className="art-label label-two">rendez-vous</span>
        </div>
      </section>

      {/* État de chargement global */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
          <Loader2 size={24} className="animate-spin text-violet-600" />
          <span className="text-sm font-medium">Chargement des données en cours...</span>
        </div>
      ) : (
        <>
          {/* Section Annonces */}
          {announcements.length > 0 && (
            <section
              className="announcement-section"
              aria-labelledby="annonces-title"
            >
              <div className="announcement-copy">
                <p className="eyebrow">À retenir</p>
                <h2 id="annonces-title">
                  Les annonces
                  <br />
                  <em>du moment.</em>
                </h2>
                <p>
                  Les informations importantes, réunies au même endroit pour ne rien
                  manquer.
                </p>
                <div className="announcement-controls">
                  <button
                    className="circle-button"
                    aria-label="Annonce précédente"
                    onClick={() =>
                      setActiveAnnouncement(
                        (activeAnnouncement - 1 + announcements.length) %
                          announcements.length
                      )
                    }
                  >
                    ‹
                  </button>
                  <span>
                    {String(activeAnnouncement + 1).padStart(2, "0")} <i>/</i>{" "}
                    {String(announcements.length).padStart(2, "0")}
                  </span>
                  <button
                    className="circle-button"
                    aria-label="Annonce suivante"
                    onClick={() =>
                      setActiveAnnouncement(
                        (activeAnnouncement + 1) % announcements.length
                      )
                    }
                  >
                    ›
                  </button>
                </div>
              </div>

              {currentAnnouncement && (
                <div
                  className={`announcement-card announcement-${currentAnnouncement.type}`}
                >
                  <div className="announcement-pattern" aria-hidden="true">
                    <svg viewBox="0 0 500 300" preserveAspectRatio="none">
                      <path d="M-30 245C90 210 72 93 205 120S315 281 536 65" />
                      <path d="M-20 275C110 226 100 118 222 145S350 302 545 98" />
                      <circle cx="392" cy="62" r="70" />
                    </svg>
                  </div>
                  <div className="announcement-top">
                    <span className="announcement-tag">
                      {currentAnnouncement.type === "urgent"
                        ? "Urgent"
                        : currentAnnouncement.type === "warning"
                        ? "À noter"
                        : "Information"}
                    </span>
                    <span>{formatDate(currentAnnouncement.datePublication)}</span>
                  </div>
                  <h3>{currentAnnouncement.titre}</h3>
                  <p>{currentAnnouncement.contenu}</p>
                  {currentAnnouncement.lien && (
                    <a
                      href={currentAnnouncement.lien}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card-link"
                    >
                      En savoir plus <ArrowUpRight aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Section Actualités */}
          {news.length > 0 && (
            <section className="section-block" id="actualites">
              <SectionHeading
                eyebrow="Le journal"
                title="Les dernières actualités"
                action="Toutes les actualités"
                href="/actualites"
              />
              <div className="news-grid">
                {news.map((item, index) => (
                  <article
                    className={`news-card ${index === 0 ? "news-featured" : ""}`}
                    key={item.id}
                  >
                    <div className="news-image-wrap">
                      <img
                        src={
                          item.imageUrl ||
                          "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85"
                        }
                        alt={item.titre}
                      />
                      <span className="category-pill">
                        {item.categorie || "Général"}
                      </span>
                    </div>
                    <div className="news-content">
                      <div className="meta-line">
                        <span>{formatDate(item.datePublication)}</span>
                        {item.tempsLecture && (
                          <span>{item.tempsLecture} de lecture</span>
                        )}
                      </div>
                      <h3>{item.titre}</h3>
                      <p>{item.description}</p>
                      <span className="read-link">
                        Lire l’article <ChevronRight aria-hidden="true" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Section Agenda */}
          {events.length > 0 && (
            <section className="section-block agenda-section" id="agenda">
              <SectionHeading
                eyebrow="À votre agenda"
                title="Les prochains rendez-vous"
                action="Voir l’agenda"
                href="#evenements"
              />
              <div className="events-list">
                {events.map((event) => (
                  <article className="event-row" key={event.id}>
                    <div className="event-date">
                      <strong>{new Date(event.dateDebut).getDate()}</strong>
                      <span>{formatEvent(event.dateDebut).split(" ")[1]}</span>
                    </div>
                    <div className="event-info">
                      <span className="event-time">
                        <Clock3 aria-hidden="true" /> {formatTime(event.dateDebut)}
                        {event.dateFin && ` — ${formatTime(event.dateFin)}`}
                      </span>
                      <h3>{event.titre}</h3>
                      <p>{event.description}</p>
                    </div>
                    {event.lieu && (
                      <div className="event-place">
                        <MapPin aria-hidden="true" />
                        {event.lieu}
                      </div>
                    )}
                    <button className="row-arrow" aria-label={`Voir ${event.titre}`}>
                      <ArrowUpRight aria-hidden="true" />
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Section Vidéos : Structure d'origine conservée */}
          {videos.length > 0 && (
            <section className="section-block video-section" id="videos">
              <SectionHeading
                eyebrow="À regarder"
                title="Les histoires en vidéo"
                action="Toutes les vidéos"
                href="/videos"
              />
              <div className="video-grid">
                {videos.map((video, index) => {
                  const isPlaying = playingVideoId === video.id;
                  const embedUrl = getEmbedUrl(video.videoUrl);

                  return (
                    <article
                      className={`video-card ${index === 0 ? "video-featured" : ""}`}
                      key={video.id}
                    >
                      <div className="video-thumb" style={{ position: "relative" }}>
                        {isPlaying ? (
                          <div style={{ position: "relative", width: "100%", height: "100%" }}>
                            <button
                              onClick={() => setPlayingVideoId(null)}
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                zIndex: 10,
                                background: "rgba(0,0,0,0.75)",
                                color: "#fff",
                                border: "none",
                                borderRadius: "50%",
                                width: "28px",
                                height: "28px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                              }}
                              title="Fermer la vidéo"
                            >
                              <X size={16} />
                            </button>

                            {embedUrl ? (
                              <iframe
                                src={embedUrl}
                                title={video.titre}
                                style={{ width: "100%", height: "100%", border: 0 }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={video.videoUrl}
                                controls
                                autoPlay
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              >
                                Votre navigateur ne supporte pas la lecture de vidéo.
                              </video>
                            )}
                          </div>
                        ) : (
                          <>
                            <img
                              src={
                                video.thumbnailUrl ||
                                "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85"
                              }
                              alt={video.titre}
                            />
                            <div className="video-overlay">
                              <span
                                className="play-button"
                                style={{ cursor: "pointer" }}
                                onClick={() => setPlayingVideoId(`${video.id}`)}
                              >
                                <Play fill="currentColor" aria-hidden="true" />
                              </span>
                              {video.duree && (
                                <span className="video-duration">{video.duree}</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="video-content">
                        <div className="meta-line">
                          <span>{video.categorie || "Vidéo"}</span>
                          <span>{formatDate(video.date)}</span>
                        </div>
                        <h3>{video.titre}</h3>
                        <p>{video.description}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

export { formatEvent };