import { AppError } from "@utils/AppError";
import postRepository from "@modules/posts/post.repository";
import { FeedCursor } from "@modules/posts/post.types";

const notFound = () => new AppError(404, "Post not found");

// a helper function to assert that a post exists before performing operations on it
const assertPostExists = async (id: number) => {
  if (!(await postRepository.postExists(id))) throw notFound();
};

const postService = {
  getFeed: (limit: number, cursor: FeedCursor | null, userId: number) =>
    postRepository.getFeed(limit, cursor, userId),

  createPost: (
    content: string | null | undefined,
    userId: number,
    uploadIds?: number[],
  ) => postRepository.createPost(content, userId, uploadIds),

  getPostDetails: async (id: number, userId: number) => {
    const post = await postRepository.getPostDetails(id, userId);
    if (!post) throw notFound();
    return post;
  },

  updatePost: async (id: number, userId: number, content: string) => {
    const post = await postRepository.updatePost(id, userId, content);
    if (!post) {
      if (await postRepository.postExists(id)) {
        throw new AppError(403, "You cannot update this post");
      }
      throw notFound();
    }
    return post;
  },

  deletePost: async (id: number, userId: number) => {
    const deleted = await postRepository.deletePost(id, userId);
    if (!deleted) {
      if (await postRepository.postExists(id)) {
        throw new AppError(403, "You cannot delete this post");
      }
      throw notFound();
    }
    return { deleted: true };
  },

  likePost: async (id: number, userId: number) => {
    await assertPostExists(id);
    return postRepository.likePost(id, userId);
  },

  unlikePost: async (id: number, userId: number) => {
    await assertPostExists(id);
    return postRepository.unlikePost(id, userId);
  },

  getPostLikes: async (id: number) => {
    // Check if the post exists before fetching likes
    await assertPostExists(id);
    // Fetch the likes for the post
    return postRepository.getPostLikes(id);
  },

  addComment: async (id: number, userId: number, content: string) => {
    // Check if the post exists before adding a comment
    await assertPostExists(id);
    // Add the comment to the post
    return postRepository.addComment(id, userId, content);
  },

  deleteComment: async (id: number, commentId: number, userId: number) => {
    const deleted = await postRepository.deleteComment(id, commentId, userId);
    if (!deleted) throw new AppError(404, "Comment not found");
    return { deleted: true };
  },

  getComments: async (id: number) => {
    await assertPostExists(id);
    return postRepository.getComments(id);
  },

  updateComment: async (
    id: number,
    commentId: number,
    userId: number,
    content: string,
  ) => {
    const comment = await postRepository.updateComment(
      id,
      commentId,
      userId,
      content,
    );
    if (!comment) throw new AppError(404, "Comment not found");
    return comment;
  },
};

export default postService;
