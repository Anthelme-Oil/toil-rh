import { LayoutGrid } from "lucide-react";
import { MediaDocument,Evenement,Actualite,Annonce ,ActualitesResponse} from "@/types";

export type Channel =
  | "Standard"
  | "Articles"
  | "Vidéos"
  | "Médias"
  | "Informations";

export type ChannelType =
  | "ARTICLE"
  | "VIDEO"
  | "MEDIA"
  | "INFO"
  | "CHAT"
  | "GROUP"
  | "UPC";

export type ReactionType = "LIKE" | "DISLIKE";

export type CommentItem = {
  author: string;
  text: string;
  time: string;
};

export type Post = EntityWithGreffe<CommunityEntity> & {
  channel?: Channel;
};

export type ChannelConfig = {
  label: Channel;
  icon: typeof LayoutGrid;
  count?: number;
  key?: ChannelType;
};

// -----------------------------------------------------------------------------
// Modèles
// -----------------------------------------------------------------------------

export interface CommentModel {
  id: string;
  interactionGreffeId: string;
  authorName: string;
  authorEmail?: string | null;
  text: string;
  createdAt: Date | string;
}

export interface ReactionModel {
  id: string;
  interactionGreffeId: string;
  type: ReactionType;
  authorName: string;
  authorEmail: string;
  createdAt: Date | string;
}

export interface InteractionGreffeModel {
  id: string;
  referId: string;
  typeRefer: ChannelType;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CompleteInteractionGreffe extends InteractionGreffeModel {
  comments: CommentModel[];
  reactions: ReactionModel[];
}

export type CommunityEntity =
  | MediaDocument
  | Evenement
  | Annonce
  | Actualite;

export interface ReactionAuthor {
  name: string;
  email: string;
  date: Date | string;
}

export interface FormattedGreffeData {
  id: string;
  referId: string;
  typeRefer: ChannelType;
  createdAt: Date | string;
  updatedAt: Date | string;
  likesCount: number;
  dislikesCount: number;
  likesAuthors: ReactionAuthor[];
  dislikesAuthors: ReactionAuthor[];
  comments: CommentModel[];
}

export type EntityWithGreffe<T = CommunityEntity> =
  T extends CommunityEntity
    ? T & {
        typeRefer: ChannelType;
        createdAt: Date | string;
        updatedAt: Date | string;
        interactions: FormattedGreffeData;
      }
    : never;



    export interface CreateGreffePayload {
      referId: string | number;
      typeRefer: ChannelType;


    }


    export interface AddCommentPayload{
      referId: string | number;
      typeRefer: ChannelType;
      text:string;
      authorName: string;
      authorEmail: string | null;
    }

    export interface ToggleReactionPayload {
    referId: string | number;
    typeRefer: ChannelType;
    reactionType: ReactionType;
    authorName: string;
    authorEmail: string;
    }


    export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}