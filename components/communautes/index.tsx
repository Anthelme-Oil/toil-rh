"use client";

import { useEffect, useMemo, useState } from "react";

import { CHANNELS, TREND_SETS } from "@/lib/communautes/data";

import {
  Channel,
  ChannelType,
  CommunityEntity,
  EntityWithGreffe,
  Post,
} from "@/lib/communautes/types";

import { createCommentInPosts } from "@/lib/communautes/service.client";

import SidebarChannels from "./SidebarChannels";
import SidebarTrends from "./SidebarTrends";
import PostCard from "./PostCard";
import ReactionModal from "./ReactionModal";

import { useUser } from "@/context/UserContext";
import { fetchCommunityFeed } from "@/lib/services/com.service";

const CHANNEL_TYPE_TO_CHANNEL: Partial<
  Record<ChannelType, Channel>
> = {
  ARTICLE: "Articles",
  VIDEO: "Vidéos",
  MEDIA: "Médias",
  INFO: "Informations",
};

function getPostChannel(
  typeRefer: ChannelType
): Channel | undefined {
  return CHANNEL_TYPE_TO_CHANNEL[typeRefer];
}

export default function CommunityPage() {
  const [activeChannel, setActiveChannel] =
    useState<Channel>("Standard");

  const [combineData, setCombinedData] = useState<
    EntityWithGreffe<CommunityEntity>[]
  >([]);

  const [posts, setPosts] = useState<Post[]>([]);

  const [liked, setLiked] = useState<number[]>([]);
  const [disliked, setDisliked] = useState<number[]>([]);

  const [commenting, setCommenting] =
    useState<number | null>(null);

  const [reactionModal, setReactionModal] = useState<{
    post: Post;
    kind: "likes" | "dislikes";
  } | null>(null);

  const { userName } = useUser();

  /**
   * Chargement du feed communautaire.
   */
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const types: ChannelType[] = [
          "ARTICLE",
          "MEDIA",
          "VIDEO",
          "INFO",
          "UPC",
          "CHAT",
          "GROUP",
        ];

        const results = await Promise.all(
          types.map((type) => fetchCommunityFeed(type))
        );

        if (cancelled) return;

        setCombinedData(results.flat());
      } catch (error) {
        console.error(
          "Erreur lors du chargement du feed communautaire :",
          error
        );
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  

  /**
   * Les données retournées par l'API sont déjà des posts.
   *
   * On ajoute uniquement `channel`, qui est une information
   * propre à l'affichage et au filtrage de l'interface.
   */
  useEffect(() => {
    const mappedPosts: Post[] = combineData.map((item) => ({
      ...item,
      channel: getPostChannel(item.typeRefer),
    }));

    setPosts(mappedPosts);
  }, [combineData]);

  /**
   * Publications visibles selon le salon sélectionné.
   */
  const visiblePosts = useMemo(() => {
    if (activeChannel === "Standard") {
      return posts;
    }

    return posts.filter(
      (post) => post.channel === activeChannel
    );
  }, [activeChannel, posts]);


 
  /**
   * Gestion locale des réactions.
   */
  const react = (
    id: number,
    kind: "like" | "dislike"
  ) => {
    const current =
      kind === "like" ? liked : disliked;

    const opposite =
      kind === "like" ? disliked : liked;

    const set =
      kind === "like" ? setLiked : setDisliked;

    const setOpposite =
      kind === "like" ? setDisliked : setLiked;

    set(
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

    if (opposite.includes(id)) {
      setOpposite(
        opposite.filter((item) => item !== id)
      );
    }
  };

  /**
   * Ajout local d'un commentaire.
   *
   * Le branchement avec l'API pourra être ajouté
   * lorsque l'endpoint de commentaire sera utilisé.
   */
  const handleAddComment = (
    postId: number,
    text: string
  ) => {
    const authorName =
      userName || "T-Oil / STSL";

    setPosts((prevPosts) =>
      createCommentInPosts(
        prevPosts,
        postId,
        authorName,
        text
      )
    );
  };

  return (
    <main className="mt-8 w-full max-w-full text-[#172033]">
      <div className="mx-auto flex w-full max-w-full gap-7 px-5 py-7 lg:px-10">

        <SidebarChannels
          activeChannel={activeChannel}
          setActiveChannel={setActiveChannel}
          data={combineData}
        />

        <section className="min-w-0 max-w-full flex-1">

          {/* En-tête */}
          <div className="mb-6">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[.18em] text-[#6f86c3]">
              Bonjour {userName || "T-Oil / STSL / COMPEL"},
            </p>

            <h1 className="text-[28px] font-extrabold tracking-[-.045em] text-[#18233c]">
              {activeChannel === "Standard"
                ? "Le fil de la communauté"
                : `Salon ${activeChannel}`}
            </h1>

            <p className="mt-2 text-[12px] text-[#8993a8]">
              {activeChannel === "Standard"
                ? "Les dernières publications de toute la communauté, réunies au même endroit."
                : `Toutes les publications ${activeChannel.toLowerCase()} et leurs interactions.`}
            </p>
          </div>

          {/* Navigation mobile */}
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1 lg:hidden">
            {CHANNELS.map(({ label }) => (
              <button
                key={label}
                onClick={() => setActiveChannel(label)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold ${
                  activeChannel === label
                    ? "bg-[#233b78] text-white"
                    : "bg-white text-[#748097]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Publications */}
          {visiblePosts.length > 0 ? (
            visiblePosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                liked={liked.includes(Number(post.id))}
                disliked={disliked.includes(Number(post.id))}
                isCommenting={
                  commenting === Number(post.id)
                }
                onReact={(kind) =>
                  react(Number(post.id), kind)
                }
                onOpenReactions={(kind) =>
                  setReactionModal({
                    post,
                    kind,
                  })
                }
                onToggleComment={() =>
                  setCommenting(
                    commenting === Number(post.id)
                      ? null
                      : Number(post.id)
                  )
                }
                onAddComment={(text) =>
                  handleAddComment(
                    Number(post.id),
                    text
                  )
                }
              />
            ))
          ) : (
            <div className="rounded-2xl border border-[#e6eaf2] bg-white p-8 text-center">
              <p className="text-[13px] font-semibold text-[#68748b]">
                Aucune publication disponible.
              </p>

              <p className="mt-1 text-[11px] text-[#9aa3b4]">
                Les publications de ce salon apparaîtront ici.
              </p>
            </div>
          )}
        </section>

        <SidebarTrends
          activeChannel={activeChannel}
          trends={TREND_SETS[activeChannel]}
        />
      </div>

      {reactionModal && (
        <ReactionModal
          post={reactionModal.post}
          kind={reactionModal.kind}
          onClose={() => setReactionModal(null)}
        />
      )}
    </main>
  );
}