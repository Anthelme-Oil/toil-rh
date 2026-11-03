import { Channel, ChannelType, Post } from "./types";
// import { getEntitiesWithInteractions } from "./repository";



export function filterPostsByChannel(posts: Post[], activeChannel: Channel): Post[] {
  if (activeChannel === "Standard") return posts;
  return posts.filter((post) => post.channel === activeChannel);
}

export function createCommentInPosts(
  posts: Post[],
  postId: string | number,
  author: string,
  text: string
): Post[] {
  return posts.map((post) =>
    post.id ===postId
      ? {
          ...post,
          comments: post.interactions.comments.length + 1,
          commentsList: [
            ...post.interactions.comments,
            {
              author,
              text,
              time: "À l’instant",
            },
          ],
        }
      : post
  );
}

// export async function getEntitiesService(type?:ChannelType){

//     return await getEntitiesWithInteractions(type);

// }