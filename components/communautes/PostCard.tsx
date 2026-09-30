
import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import {
  MessageCircle,
  MoreHorizontal,
  Play,
  Send,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { ChannelType, Post } from "@/lib/communautes/types";
import {
  toggleReaction,
  sendComment,
} from "@/lib/services/com.service";

interface PostCardProps {
  post: Post;

  /**
   * Ces deux props restent compatibles avec ton composant parent.
   * La source principale de vérité reste cependant post.interactions.
   */
  liked?: boolean;
  disliked?: boolean;

  isCommenting: boolean;

  onReact?: (kind: "like" | "dislike") => void;
  onOpenReactions: (kind: "likes" | "dislikes") => void;
  onToggleComment: () => void;
  onAddComment?: (text: string) => void;
}

type DisplayData = {
  title: string;
  description?: string;
  authorName: string;
  authorEmail?: string;
  department?: string;
  category?: string;
  typeLabel: string;
  time: string;
  tone: "blue" | "purple" | "coral";
  showVideo: boolean;
};

type InteractionAuthor = {
  authorName?: string;
  authorEmail?: string;
  email?: string;
  userId?: string;
};

type Comment = {
  id: string;
  authorName?: string;
  authorEmail?: string;
  text: string;
  createdAt: string;
};

type RawInteractions = {
  comments?: Comment[];

  likesAuthors?: InteractionAuthor[];
  dislikesAuthors?: InteractionAuthor[];

  likesCount?: number;
  dislikesCount?: number;

  createdAt?: string;
  updatedAt?: string | null;

  referId?: string;
  typeRefer?: ChannelType;
};

/**
 * ---------------------------------------------------------
 * Utilitaires
 * ---------------------------------------------------------
 */

function formatRelativeDate(value?: Date | string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 0) {
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return "À l'instant";
  }

  if (minutes < 60) {
    return `Il y a ${minutes} min`;
  }

  if (hours < 24) {
    return `Il y a ${hours} h`;
  }

  if (days < 7) {
    return `Il y a ${days} j`;
  }

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name?: string) {
  if (!name) {
    return "TO";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function getChannelLabel(post: Post) {
  const typeRefer = post.typeRefer;

  switch (typeRefer) {
    case "ARTICLE":
      return "Articles";

    case "VIDEO":
      return "Vidéos";

    case "MEDIA":
      return "Médias";

    case "INFO":
      return "Informations";

    case "UPC":
      return "UPC";

    case "CHAT":
      return "Chat";

    case "GROUP":
      return "Groupe";

    default:
      return "Publication";
  }
}

function getTone(typeRefer?: Post["typeRefer"]): DisplayData["tone"] {
  switch (typeRefer) {
    case "VIDEO":
      return "purple";

    case "INFO":
      return "coral";

    default:
      return "blue";
  }
}

function getDisplayData(post: Post): DisplayData {
  const typeLabel = getChannelLabel(post);

  if ("title" in post) {
    const authorName =
      post.author?.name ||
      post.publishedBy?.name ||
      post.author?.email ||
      post.publishedBy?.email ||
      "T-OIL / STSL";

    return {
      title: post.title || "Publication sans titre",
      description: post.description || post.objective || undefined,
      authorName,
      authorEmail: post.author?.email || post.publishedBy?.email,
      department: post.department,
      category: post.category,
      typeLabel,
      time: formatRelativeDate(
        post.publishedAt ?? post.createdAt
      ),
      tone: getTone(post.typeRefer),
      showVideo:
        post.typeRefer === "VIDEO" ||
        post.format === "VIDEO",
    };
  }

  if ("datePublication" in post && "description" in post) {
    return {
      title: post.titre || "Actualité sans titre",
      description: post.contenu || undefined,
      authorName: "COMPEL / T-OIL / STSL",
      category: "Actualité",
      typeLabel,
      time: formatRelativeDate(post.datePublication),
      tone: getTone(post.typeRefer),
      showVideo: false,
    };
  }

  if ("dateDebut" in post) {
    return {
      title: post.titre || "Événement sans titre",
      description: post.description || undefined,
      authorName: "T-OIL / STSL",
      category: post.lieu || undefined,
      typeLabel,
      time: formatRelativeDate(post.dateDebut),
      tone: getTone(post.typeRefer),
      showVideo: false,
    };
  }

  if ("contenu" in post) {
    return {
      title: post.titre || "Annonce sans titre",
      description: post.contenu || undefined,
      authorName: "T-OIL / STSL",
      category: post.type,
      typeLabel,
      time: formatRelativeDate(post.datePublication),
      tone: getTone(post.typeRefer),
      showVideo: false,
    };
  }

  return {
    title: "Publication sans titre",
    description: undefined,
    authorName: "T-OIL / STSL",
    typeLabel: "Publication",
    time: formatRelativeDate(
      (post as Record<string, unknown>).createdAt as
        | string
        | undefined
    ),
    tone: getTone(
      (post as Record<string, unknown>).typeRefer as
        | Post["typeRefer"]
        | undefined
    ),
    showVideo: false,
  };
}

/**
 * ---------------------------------------------------------
 * Vérifie si un auteur correspond à l'utilisateur connecté
 * ---------------------------------------------------------
 */
function isSameUser(
  author: InteractionAuthor,
  userEmail?: string
) {
  if (!userEmail) {
    return false;
  }

  const normalizedUserEmail = userEmail
    .trim()
    .toLowerCase();

  const possibleEmails = [
    author.authorEmail,
    author.email,
    author.userId,
  ]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

  return possibleEmails.includes(normalizedUserEmail);
}

/**
 * ---------------------------------------------------------
 * PostCard
 * ---------------------------------------------------------
 */

export default function PostCard({
  post,
  liked: initialLiked = false,
  disliked: initialDisliked = false,
  isCommenting,
  onReact,
  onOpenReactions,
  onToggleComment,
  onAddComment,
}: PostCardProps) {
  const { userName, userEmail } = useUser();

  const [commentText, setCommentText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isReacting, setIsReacting] = useState(false);

  /**
   * -------------------------------------------------------
   * Interactions serveur
   * -------------------------------------------------------
   *
   * IMPORTANT :
   *
   * Le backend fournit :
   *
   * interactions.likesAuthors
   * interactions.dislikesAuthors
   *
   * et NON :
   *
   * interactions.likes
   * interactions.dislikes
   */

  const interactions =
    (post as Post & {
      interactions?: RawInteractions | null;
    }).interactions ?? null;

  const likesAuthors =
    interactions?.likesAuthors ?? [];

  const dislikesAuthors =
    interactions?.dislikesAuthors ?? [];

  const serverLikesCount =
    interactions?.likesCount ??
    likesAuthors.length;

  const serverDislikesCount =
    interactions?.dislikesCount ??
    dislikesAuthors.length;

  /**
   * -------------------------------------------------------
   * Détection de la réaction actuelle de l'utilisateur
   * -------------------------------------------------------
   */

  const hasUserLikedServer =
    likesAuthors.some((author) =>
      isSameUser(author, userEmail)
    ) || initialLiked;

  const hasUserDislikedServer =
    dislikesAuthors.some((author) =>
      isSameUser(author, userEmail)
    ) || initialDisliked;

  /**
   * -------------------------------------------------------
   * États locaux
   * -------------------------------------------------------
   */

  const [userLiked, setUserLiked] = useState(
    hasUserLikedServer
  );

  const [userDisliked, setUserDisliked] = useState(
    hasUserDislikedServer
  );

  const [likesCount, setLikesCount] =
    useState(serverLikesCount);

  const [dislikesCount, setDislikesCount] =
    useState(serverDislikesCount);

  const [localComments, setLocalComments] =
    useState<Comment[]>(
      interactions?.comments ?? []
    );

  /**
   * -------------------------------------------------------
   * Synchronisation avec le serveur
   * -------------------------------------------------------
   *
   * Cette partie est importante :
   *
   * Lorsque le parent recharge les posts,
   * PostCard récupère les nouvelles interactions.
   *
   * Exemple après F5 :
   *
   * likesAuthors = [
   *   {
   *     authorEmail: "anthelme.kpodar@togosh.com"
   *   }
   * ]
   *
   * => userLiked = true
   *
   * => le bouton reste coloré.
   */

  useEffect(() => {
    const currentInteractions =
      (post as Post & {
        interactions?: RawInteractions | null;
      }).interactions ?? null;

    const currentLikesAuthors =
      currentInteractions?.likesAuthors ?? [];

    const currentDislikesAuthors =
      currentInteractions?.dislikesAuthors ?? [];

    const liked = currentLikesAuthors.some((author) =>
      isSameUser(author, userEmail)
    );

    const disliked = currentDislikesAuthors.some(
      (author) => isSameUser(author, userEmail)
    );

    setUserLiked(liked || initialLiked);
    setUserDisliked(disliked || initialDisliked);

    setLikesCount(
      currentInteractions?.likesCount ??
        currentLikesAuthors.length
    );

    setDislikesCount(
      currentInteractions?.dislikesCount ??
        currentDislikesAuthors.length
    );

    setLocalComments(
      currentInteractions?.comments ?? []
    );
  }, [
    post,
    userEmail,
    initialLiked,
    initialDisliked,
  ]);

  const display = getDisplayData(post);

  const referId = String(
    post.id ?? ""
  );

  const typeRefer = post.typeRefer 
  

  /**
   * -------------------------------------------------------
   * Gestion Like / Dislike
   * -------------------------------------------------------
   *
   * Règles :
   *
   * Aucun -> Like       = +1 like
   * Like -> Like        = -1 like
   * Dislike -> Like     = -1 dislike +1 like
   *
   * Aucun -> Dislike    = +1 dislike
   * Dislike -> Dislike  = -1 dislike
   * Like -> Dislike     = -1 like +1 dislike
   */

  const handleReaction = async (
    kind: "like" | "dislike"
  ) => {
    if (isReacting || !userEmail) {
      return;
    }

    const isLike = kind === "like";

    /**
     * Snapshot permettant de restaurer
     * exactement l'état précédent en cas d'erreur.
     */
    const previousState = {
      liked: userLiked,
      disliked: userDisliked,
      likesCount,
      dislikesCount,
    };

    /**
     * -----------------------------------------------------
     * Mise à jour optimiste
     * -----------------------------------------------------
     */

    if (isLike) {
      if (userLiked) {
        /**
         * Like -> aucun
         */
        setUserLiked(false);

        setLikesCount((prev) =>
          Math.max(0, prev - 1)
        );
      } else {
        /**
         * Aucun -> Like
         */
        setUserLiked(true);

        setLikesCount((prev) => prev + 1);

        /**
         * Si l'utilisateur avait un dislike,
         * celui-ci disparaît.
         */
        if (userDisliked) {
          setUserDisliked(false);

          setDislikesCount((prev) =>
            Math.max(0, prev - 1)
          );
        }
      }
    } else {
      if (userDisliked) {
        /**
         * Dislike -> aucun
         */
        setUserDisliked(false);

        setDislikesCount((prev) =>
          Math.max(0, prev - 1)
        );
      } else {
        /**
         * Aucun -> Dislike
         */
        setUserDisliked(true);

        setDislikesCount((prev) => prev + 1);

        /**
         * Si l'utilisateur avait un like,
         * celui-ci disparaît.
         */
        if (userLiked) {
          setUserLiked(false);

          setLikesCount((prev) =>
            Math.max(0, prev - 1)
          );
        }
      }
    }

    onReact?.(kind);

    /**
     * -----------------------------------------------------
     * Synchronisation serveur
     * -----------------------------------------------------
     */

    setIsReacting(true);

    try {
      await toggleReaction({
        referId,
        typeRefer,
        reactionType: isLike
          ? "LIKE"
          : "DISLIKE",
        authorName:
          userName || "Utilisateur",
        authorEmail: userEmail,
      });
    } catch (error) {
      console.error(
        "Erreur toggleReaction :",
        error
      );

      /**
       * ---------------------------------------------------
       * Rollback complet
       * ---------------------------------------------------
       */

      setUserLiked(previousState.liked);
      setUserDisliked(previousState.disliked);
      setLikesCount(previousState.likesCount);
      setDislikesCount(
        previousState.dislikesCount
      );
    } finally {
      setIsReacting(false);
    }
  };

  /**
   * -------------------------------------------------------
   * Envoi d'un commentaire
   * -------------------------------------------------------
   */

  const handleSend = async () => {
    const text = commentText.trim();

    if (
      !text ||
      isSending ||
      !userEmail
    ) {
      return;
    }

    const newComment: Comment = {
      id: `temp-${Date.now()}`,
      authorName: userName || "Vous",
      authorEmail: userEmail,
      text,
      createdAt: new Date().toISOString(),
    };

    /**
     * Affichage immédiat
     */
    setLocalComments((prev) => [
      ...prev,
      newComment,
    ]);

    setCommentText("");
    setIsSending(true);

    try {
      await sendComment({
        referId,
        typeRefer,
        authorName:
          userName || "Utilisateur",
        authorEmail: userEmail,
        text,
      });

      onAddComment?.(text);
    } catch (error) {
      console.error(
        "Erreur sendComment :",
        error
      );

      /**
       * Suppression du commentaire optimiste
       * si l'API échoue.
       */
      setLocalComments((prev) =>
        prev.filter(
          (comment) =>
            comment.id !== newComment.id
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  /**
   * -------------------------------------------------------
   * Rendu
   * -------------------------------------------------------
   */

  return (
    <article className="mb-5 overflow-hidden rounded-2xl border border-[#e6eaf2] bg-white shadow-[0_8px_25px_rgba(41,58,99,.04)]">
      <div className="p-5">

        {/* Auteur */}
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold ${
              display.tone === "coral"
                ? "bg-[#ffe1dc] text-[#c85c4e]"
                : display.tone === "purple"
                  ? "bg-[#eee7ff] text-[#7354ba]"
                  : "bg-[#dce8ff] text-[#3764b4]"
            }`}
          >
            {getInitials(display.authorName)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[13px] font-bold text-[#26324c]">
                {display.authorName}
              </p>

              <span className="h-1 w-1 shrink-0 rounded-full bg-[#b4bccb]" />

              <p className="shrink-0 text-[11px] text-[#919aae]">
                {display.time}
              </p>
            </div>

            {display.department && (
              <p className="mt-1 text-[11px] text-[#8993a8]">
                {display.department}
              </p>
            )}

            {display.authorEmail && (
              <p className="mt-0.5 truncate text-[10px] text-[#a2aabc]">
                {display.authorEmail}
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label="Plus d’options"
            className="rounded-lg p-1.5 text-[#a1aabc]"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Labels */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-md bg-[#e9efff] px-2 py-1 text-[9px] font-bold uppercase tracking-[.1em] text-[#5273bf]">
            {display.typeLabel}
          </span>

          {display.category && (
            <span className="rounded-md bg-[#f4f5f8] px-2 py-1 text-[9px] font-bold text-[#788398]">
              {display.category}
            </span>
          )}
        </div>

        {/* Titre */}
        <h2 className="mt-3 text-[18px] font-extrabold leading-snug text-[#202c46]">
          {display.title}
        </h2>

        {/* Description */}
        {display.description && (
          <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-[#68748b]">
            {display.description}
          </p>
        )}

        {/* Vidéo */}
        {display.showVideo && (
          <div className="relative mt-4 flex h-[155px] items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#253e7c] via-[#486bb9] to-[#b4c9ee]">
            <button
              type="button"
              aria-label="Lire la vidéo"
              className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[#294a98] shadow-lg"
            >
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            </button>
          </div>
        )}

        {/* Barre de réactions */}
        <div className="mt-5 flex items-center justify-between border-t border-[#eef0f5] pt-3">
          <div className="flex items-center gap-1">

            {/* LIKE */}
            <button
              type="button"
              disabled={isReacting}
              onClick={() =>
                handleReaction("like")
              }
              aria-pressed={userLiked}
              className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                userLiked
                  ? "bg-[#e9efff] text-[#3764b4]"
                  : "text-[#7e899d] hover:bg-[#f5f7fb]"
              }`}
            >
              <ThumbsUp
                className={`h-4 w-4 ${
                  userLiked
                    ? "fill-current"
                    : ""
                }`}
              />

              {likesCount}
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenReactions("likes")
              }
              className="text-[10px] text-[#9aa3b4] hover:text-[#3764b4]"
            >
              voir
            </button>

            {/* DISLIKE */}
            <button
              type="button"
              disabled={isReacting}
              onClick={() =>
                handleReaction("dislike")
              }
              aria-pressed={userDisliked}
              className={`ml-2 flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                userDisliked
                  ? "bg-[#fff0ed] text-[#d96b5c]"
                  : "text-[#7e899d] hover:bg-[#f5f7fb]"
              }`}
            >
              <ThumbsDown
                className={`h-4 w-4 ${
                  userDisliked
                    ? "fill-current"
                    : ""
                }`}
              />

              {dislikesCount}
            </button>

            <button
              type="button"
              onClick={() =>
                onOpenReactions("dislikes")
              }
              className="text-[10px] text-[#9aa3b4] hover:text-[#d96b5c]"
            >
              voir
            </button>
          </div>

          {/* Commentaires */}
          <button
            type="button"
            onClick={onToggleComment}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-[11px] font-bold ${
              isCommenting
                ? "bg-[#eef2ff] text-[#3764b4]"
                : "text-[#7e899d] hover:bg-[#f5f7fb]"
            }`}
          >
            <MessageCircle className="h-4 w-4" />

            {localComments.length} commentaires
          </button>
        </div>

        {/* Box commentaires */}
        {isCommenting && (
          <div className="mt-4 rounded-xl bg-[#f8f9fc] p-3">

            <div className="max-h-40 space-y-3 overflow-y-auto">
              {localComments.length > 0 ? (
                localComments.map((comment) => {
                  const commentAuthor =
                    comment.authorName ||
                    comment.authorEmail ||
                    "Utilisateur";

                  return (
                    <div
                      key={comment.id}
                      className="flex gap-2"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#dce8ff] text-[9px] font-bold text-[#3764b4]">
                        {getInitials(
                          commentAuthor
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-[#3b4760]">
                          {commentAuthor}

                          <span className="ml-1 font-normal text-[#a2aabc]">
                            {formatRelativeDate(
                              comment.createdAt
                            )}
                          </span>
                        </p>

                        <p className="mt-0.5 text-[12px] text-[#68748b]">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[11px] text-[#9aa3b4]">
                  Soyez le premier à commenter cette
                  publication.
                </p>
              )}
            </div>

            {/* Saisie commentaire */}
            <div className="mt-3 flex items-end gap-2">
              <textarea
                value={commentText}
                disabled={isSending}
                onChange={(event) =>
                  setCommentText(
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    event.keyCode !== 229
                  ) {
                    event.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Écrire un commentaire… (Entrée pour envoyer)"
                rows={2}
                className="min-h-[44px] flex-1 resize-y rounded-xl border border-[#e5e8f0] bg-white px-3 py-2 text-[12px] outline-none focus:border-[#9eb2e2] disabled:opacity-50"
              />

              <button
                type="button"
                aria-label="Envoyer le commentaire"
                onClick={handleSend}
                disabled={isSending}
                className="rounded-xl bg-[#3159ae] p-3 text-white shadow-lg shadow-[#3159ae]/20 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-2 flex gap-2 text-[11px] text-[#8993a8]">
              <button
                type="button"
                onClick={() =>
                  setCommentText(
                    (value) => `${value} 😊`
                  )
                }
              >
                Ajouter un emoji
              </button>

              <button
                type="button"
                onClick={() =>
                  setCommentText(
                    (value) =>
                      `${value} [sticker]`
                  )
                }
              >
                Sticker
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
