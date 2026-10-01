'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, Clock3, Download, Expand, Eye, FileText, Link2, Lock, UserRound, X } from 'lucide-react'
import { MediaDocument } from '@/types'
import { consultMedia, downloadMedia } from '@/lib/services/media.service'

// Dépendances à installer : npm i xlsx mammoth
const PREVIEW_SIZE = 550

interface MediaConsultActionsProps {
  mediaId: string
  downloads: number
  media: MediaDocument
}

type Kind = 'image' | 'pdf' | 'xlsx' | 'docx' | 'text' | 'video' | 'audio' | 'file'

function getKind(media: MediaDocument): Kind {
  const ext = (media.extension ?? '').toLowerCase().replace('.', '')
  const format = media.format?.toLowerCase()
  if (format === 'image' || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) return 'image'
  if (format === 'pdf' || ext === 'pdf') return 'pdf'
  if (['xls', 'xlsx', 'xlsm'].includes(ext)) return 'xlsx'
  if (ext === 'docx') return 'docx'
  if (['txt', 'csv', 'md', 'json', 'log'].includes(ext)) return 'text'
  if (format === 'audio' || ['mp3', 'wav'].includes(ext)) return 'audio'
  if (format === 'video' || ['mp4', 'webm', 'ogg'].includes(ext)) return 'video'
  return 'file'
}

function formatFileSize(bytes?: number) {
  if (!bytes) return 'Taille inconnue'
  const units = ['o', 'Ko', 'Mo', 'Go']
  let size = bytes
  let i = 0
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i += 1
  }
  return `${size.toFixed(size >= 10 || i === 0 ? 0 : 1)} ${units[i]}`
}

function Notice({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-[#E9F1FB] p-8 text-center">
      <FileText className="h-9 w-9 text-[#4A7DB8]" strokeWidth={1.5} />
      <p className="text-sm font-semibold text-[#1B2B3A]">{title}</p>
      <p className="text-xs leading-5 text-[#5C7288]">{text}</p>
    </div>
  )
}

/** Lit réellement le fichier dans le navigateur (pas de service externe) */
function Preview({ media, kind }: { media: MediaDocument; kind: Kind }) {
  const [state, setState] = useState<
    | { type: 'loading' }
    | { type: 'error' }
    | { type: 'text'; text: string }
    | { type: 'html'; html: string }
    | { type: 'sheets'; sheets: { name: string; rows: string[][] }[] }
  >({ type: 'loading' })
  const [sheetIndex, setSheetIndex] = useState(0)
  const url = media.fileUrl

  useEffect(() => {
    if (!['xlsx', 'docx', 'text'].includes(kind)) return
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(String(res.status))
        if (kind === 'text') {
          const text = await res.text()
          if (!cancelled) setState({ type: 'text', text: text.slice(0, 200_000) })
        } else if (kind === 'docx') {
          // @ts-ignore - build navigateur de mammoth
          const mammoth: any = await import('mammoth/mammoth.browser')
          const { value } = await mammoth.convertToHtml({ arrayBuffer: await res.arrayBuffer() })
          if (!cancelled) setState({ type: 'html', html: value })
        } else {
          const XLSX = await import('xlsx')
          const wb = XLSX.read(await res.arrayBuffer(), { type: 'array' })
          const sheets = wb.SheetNames.map((name) => ({
            name,
            rows: (XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '', raw: false }) as string[][])
              .slice(0, 200)
              .map((r) => r.slice(0, 20)),
          }))
          if (!cancelled) setState({ type: 'sheets', sheets })
        }
      } catch {
        if (!cancelled) setState({ type: 'error' })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [url, kind])

  if (kind === 'image') return <img src={url} alt={media.title} className="h-full w-full object-contain" />
  if (kind === 'pdf') return <iframe src={`${url}#toolbar=0&navpanes=0&view=FitH`} title={media.title} className="h-full w-full border-0" />
  if (kind === 'video') return <video controls src={url} className="h-full w-full bg-black object-contain" />
  if (kind === 'audio')
    return (
      <div className="flex h-full items-center justify-center bg-[#E6F4EC] p-6">
        <audio controls src={url} className="w-full" />
      </div>
    )
  if (kind === 'file')
    return <Notice title="Aperçu indisponible pour ce format" text="Téléchargez le fichier pour l’ouvrir dans son application." />

  if (state.type === 'loading') return <div className="flex h-full items-center justify-center text-xs text-[#5C7288]">Chargement de l’aperçu…</div>
  if (state.type === 'error')
    return <Notice title="Aperçu impossible" text="Le fichier n’est pas accessible depuis le navigateur. Téléchargez-le pour le consulter." />
  if (state.type === 'text') return <pre className="h-full overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-5 text-[#1B2B3A]">{state.text}</pre>
  if (state.type === 'html')
    return (
      <iframe
        sandbox=""
        title={media.title}
        className="h-full w-full border-0 bg-white"
        srcDoc={`<style>body{font:14px/1.6 system-ui,sans-serif;color:#1B2B3A;padding:20px;margin:0}table{border-collapse:collapse}td,th{border:1px solid #d5e0ec;padding:4px 8px}img{max-width:100%}</style>${state.html}`}
      />
    )

  const sheet = state.sheets[Math.min(sheetIndex, state.sheets.length - 1)]
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs text-[#1B2B3A]">
          <tbody>
            {sheet.rows.map((row, r) => (
              <tr key={r} className={r === 0 ? 'bg-[#E9F1FB] font-semibold' : 'odd:bg-white even:bg-[#F6F9FD]'}>
                {row.map((cell, c) => (
                  <td key={c} className="whitespace-nowrap px-3 py-1.5">{String(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {state.sheets.length > 1 && (
        <div className="flex gap-1 overflow-x-auto bg-[#E6F4EC] px-2 py-1.5">
          {state.sheets.map((s, i) => (
            <button key={s.name} type="button" onClick={() => setSheetIndex(i)} className={`px-3 py-1 text-xs ${i === sheetIndex ? 'bg-white font-semibold text-[#2E7D58]' : 'text-[#4F6F5F]'}`}>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6 py-3 text-sm">
      <dt className="flex items-center gap-2.5 text-[#5C7288]"><Icon className="h-4 w-4" strokeWidth={1.75} />{label}</dt>
      <dd className="font-medium text-[#1B2B3A]">{value}</dd>
    </div>
  )
}

export default function MediaConsultActions({ mediaId, downloads, media }: MediaConsultActionsProps) {
  const registered = useRef(false)
  const [downloadCount, setDownloadCount] = useState(downloads)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)
  const kind = getKind(media)
  const extension = media.extension?.replace('.', '').toUpperCase() || media.format?.toUpperCase() || 'FICHIER'
  const published = media.status?.toUpperCase() === 'PUBLISHED'

  useEffect(() => {
    if (registered.current) return
    registered.current = true
    void consultMedia(mediaId).catch((e) => console.error('Erreur lors de la consultation :', e))
  }, [mediaId])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  async function handleDownload() {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      await downloadMedia(mediaId)
      setDownloadCount((v) => v + 1)
      setDownloaded(true)
      window.setTimeout(() => setDownloaded(false), 2200)
    } catch (e) {
      console.error('Erreur lors du téléchargement :', e)
    } finally {
      setIsDownloading(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
    }
  }

  const focus = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4A7DB8] focus-visible:ring-offset-2'

  return (
    <main className=" bg-[#F4F8FC] px-5 py-10 text-[#1B2B3A] antialiased sm:px-8">
      <div className="mx-auto max-w-[920px]">
        <div className="mb-8 flex items-center justify-between gap-4 text-sm text-[#5C7288]">
          <nav className="flex min-w-0 items-center gap-2" aria-label="Fil d’Ariane">
            <span className="font-semibold text-[#2F5F9E]">Médiathèque</span>
            <span>/</span>
            <span className="truncate">{media.department || 'Documents'}</span>
          </nav>
          <button type="button" onClick={handleCopy} className={`flex shrink-0 items-center gap-2 bg-white px-3 py-1.5 text-[#2F5F9E] transition hover:bg-[#E9F1FB] ${focus}`}>
            {copied ? <Check className="h-4 w-4 text-[#2E7D58]" /> : <Link2 className="h-4 w-4" />}
            {copied ? 'Lien copié' : 'Copier le lien'}
          </button>
        </div>

        <article className="grid bg-white md:grid-cols-[400px_minmax(0,1fr)]">
          {/* Aperçu 400 x 400 */}
          <div className="relative bg-[#E9F1FB]">
            <div className="mx-auto h-full w-full max-h-full max-w-[400px] overflow-hidden" style={{ height: PREVIEW_SIZE }}>
              <Preview media={media} kind={kind} />
            </div>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Agrandir l’aperçu"
              className={`absolute bottom-3 right-3 bg-white/95 p-2 text-[#2F5F9E] shadow-sm transition hover:bg-white ${focus}`}
            >
              <Expand className="h-4 w-4" />
            </button>
          </div>

          {/* Détails */}
          <div className="flex flex-col p-7 sm:p-9">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className={`px-2.5 py-1 ${published ? 'bg-[#E6F4EC] text-[#2E7D58]' : 'bg-[#FFF4DF] text-[#9A6A1F]'}`}>{published ? 'Publié' : media.status || 'Brouillon'}</span>
              {media.category && <span className="bg-[#E9F1FB] px-2.5 py-1 text-[#2F5F9E]">{media.category}</span>}
              <span className="flex items-center gap-1 text-[#5C7288]"><Lock className="h-3 w-3" />{media.visibility || 'PUBLIC'}</span>
            </div>

            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-[#10243a]">{media.title}</h1>
            {media.description && <p className="mt-3 text-[15px] leading-7 text-[#4D6277]">{media.description}</p>}
            {media.objective && <p className="mt-3 text-sm leading-6 text-[#5C7288]"><span className="font-semibold text-[#1B2B3A]">Objectif : </span>{media.objective}</p>}

            <dl className="mt-6 divide-y divide-[#E3ECF5] border-y border-[#E3ECF5]">
              <Row icon={UserRound} label="Auteur" value={media.author?.name || 'Anonyme'} />
              {media.createdAt && <Row icon={CalendarDays} label="Ajouté le" value={new Date(media.createdAt).toLocaleDateString('fr-FR')} />}
              <Row icon={Clock3} label="Version" value={`v${media.version || '1.0'}`} />
              <Row icon={Eye} label="Vues" value={(media.views || 0).toLocaleString('fr-FR')} />
              <Row icon={Download} label="Téléchargements" value={downloadCount.toLocaleString('fr-FR')} />
            </dl>

            {media.tags?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {media.tags.map((t) => <span key={t} className="bg-[#E6F4EC] px-2.5 py-1 text-xs font-medium text-[#2E7D58]">{t}</span>)}
              </div>
            ) : null}

            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className={`mt-auto flex w-full items-center justify-center gap-2 bg-[#2E7D58] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#256849] disabled:cursor-not-allowed disabled:opacity-60 ${focus}`}
            >
              {isDownloading ? 'Téléchargement…' : downloaded ? <><Check className="h-4 w-4" /> Téléchargé</> : <><Download className="h-4 w-4" /> Télécharger · {extension} · {formatFileSize(media.fileSize)}</>}
            </button>
          </div>
        </article>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10243a]/50 p-4" role="dialog" aria-modal="true" aria-label={`Aperçu de ${media.title}`} onClick={() => setOpen(false)}>
          <div className="relative h-[88vh] w-full max-w-5xl bg-white" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className={`absolute right-3 top-3 z-10 bg-white p-2 text-[#2F5F9E] shadow transition hover:bg-[#E9F1FB] ${focus}`}>
              <X className="h-4 w-4" />
            </button>
            <Preview media={media} kind={kind} />
          </div>
        </div>
      )}
    </main>
  )
}