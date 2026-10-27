import { Op } from "sequelize";
import { sequelize } from "@config/database";
import Upload from "@modules/uploads/uploads.model";
import { AppError } from "@utils/AppError";
import Comment from "../comments/comment.model";
import Like from "../likes/like.model";
import PostImage from "./post-image.model";
import Post from "./post.model";
import { FeedCursor } from "./post.types";

/*
postImageInclude 
is a helper function that returns an object representing the association between a post and its images. 
It specifies how to include the post images when querying for posts, including the attributes to select, 
the order of the images, and the nested association with the upload model to get additional details about each image.
*/
const postImageInclude = () => ({
  association: "postImages",
  attributes: ["id", "position"],
  separate: true,
  order: [["position", "ASC"]] as ["position", "ASC"][],
  // nested include to get details about the associated upload for each post image
  include: [
    {
      association: "upload",
      attributes: ["id", "url", "width", "height", "format"],
    },
  ],
});

const postRepository = {
  getFeed: async (limit: number, cursor: FeedCursor | null, userId: number) => {
    const posts = await Post.findAll({
      limit, // limit the number of posts returned
      where: cursor // if a cursor is provided, filter posts based on the cursor
        ? {
            [Op.or]: [ //  [op.or] is used to combine multiple conditions with a logical OR
              // if the post's createdAt is less than the cursor's createdAt, include it
              { createdAt: { [Op.lt]: cursor.createdAt } },
              /* 
              if the post's createdAt is equal to the cursor's createdAt, include it only if its id is less than the cursor's id
              created at not uniques since 2 posts can be created at the same time, so we need to use id as a tie breaker
              */
              {
                createdAt: cursor.createdAt,
                id: { [Op.lt]: cursor.id },
              },
            ],
          }
        : undefined, // if no cursor is provided, do not apply any filtering like in first page of results
        // order the posts by createdAt and id in descending order to get the most recent posts first
      order: [
        ["createdAt", "DESC"],
        ["id", "DESC"],
      ],
      // include the user and post images associated with each post, selecting only specific attributes to return
      include: [
        {
          association: "user",
          attributes: ["id", "username", "firstName", "lastName", "avatar"],
        },
        postImageInclude(),
      ],
    });
    if (posts.length === 0) return [];

    const postIds = posts.map((post) => post.id);
    // Fetch the like counts, comment counts, and whether the current user has liked each post in parallel using Promise.all
    const [likeCounts, commentCounts, currentUserLikes] = await Promise.all([
      Like.count({
        where: { postId: { [Op.in]: postIds } },
        group: ["postId"],
      }),
      Comment.count({
        where: { postId: { [Op.in]: postIds } },
        group: ["postId"],
      }),
      Like.findAll({
        where: { userId, postId: { [Op.in]: postIds } },
        attributes: ["postId"],
      }),
    ]);

    /*
    This code builds fast lookup tables (post ID → count) from query results, 
    so you can attach like and comment counts to each post without searching arrays repeatedly.
    */
    const countByPostId = (
      counts: 
      number // plain number => The number case likely exists because some query APIs (e.g. a count() with no groupBy) return a single total instead of a grouped list
      | 
      { 
        // postId is typed unknown, meaning it’s not guaranteed to be a number (it might be a string, null, a bigint, etc.).
        postId?: unknown; 
        count: number 
      }[],
    ) => {
      /* 
      Creates an empty map: key = post ID, value = count.
      If counts is not an array (the number case), it’s skipped and an empty map is returned. 
      A single number has no per-post breakdown, so there’s nothing to map.
      For each item, Number(item.postId) coerces the unknown value to a number. 
      This handles cases like "42" (string) → 42.
      Number.isSafeInteger(postId) is a validation guard. 
      It rejects NaN (from Number(undefined), Number("abc")), floats, and values too large to represent precisely. 
      Bad rows are silently dropped rather than corrupting the map.
      Valid entries are stored as postId → count.
      */
      const countMap = new Map<number, number>(); 
      if (Array.isArray(counts)) {
        for (const item of counts) {
          const postId = Number(item.postId);
          if (Number.isSafeInteger(postId)) countMap.set(postId, item.count);
        }
      }
      return countMap;
    };

    /*
    Instead of doing likeCounts.find(...) for every post (O(n × m)), 
    you build the maps once (O(m)) and then each lookup is O(1). 
    It’s a standard approach when merging aggregated results into a list of posts, like a feed.
    */
    const likeCountByPostId = countByPostId(likeCounts);
    const commentCountByPostId = countByPostId(commentCounts);
    const likedPostIds = new Set(currentUserLikes.map((like) => like.postId));
/*
You have a list of posts, and you want to show each one with its number of likes and comments.
The problem: The database gives you counts in a list like this:
[{ postId: 1, count: 5 }, { postId: 2, count: 3 }, ...]

To find the likes for post 2, you’d have to search through the whole list every time. That’s slow if you have lots of posts.
The solution: Turn that list into a quick lookup table (a Map), like a phonebook. 
You look up a post ID and instantly get its count.
What each part does
===================
countByPostId is a helper that builds the lookup table:
- It starts with an empty table.
- It goes through each item in the list.
- It converts the post ID to a number (in case it came as text like "42").
- It checks the ID is a real, valid whole number. If it’s garbage, it skips that item.
- It saves postId → count in the table.
- If the input isn’t a list at all (just a plain number), it returns an empty table.

The two lines that use it:
const likeCountByPostId = countByPostId(likeCounts);
const commentCountByPostId = countByPostId(commentCounts);

You now have two tables: one for likes and one for comments. For example, 
likeCountByPostId.get(5) gives the number of likes on post 5.
const likedPostIds = new Set(currentUserLikes.map((like) => like.postId));

This makes a simple list of the post IDs that you (the logged-in user) have liked. Later you can ask “did I like this post?” 
with likedPostIds.has(post.id) to show a filled-in heart.
One thing to remember
If a post has no likes, it won’t be in the table at all. So when you read from it, use a default of zero:
likeCountByPostId.get(post.id) ?? 0
*/
    return posts.map((post) => ({
      ...post.toJSON(),
      likeCount: likeCountByPostId.get(post.id) ?? 0,
      commentCount: commentCountByPostId.get(post.id) ?? 0,
      likedByMe: likedPostIds.has(post.id),
    }));
  },


  createPost: async (
    content: string | null | undefined,
    userId: number,
    uploadIds: number[] = [],
  ) =>
    /* 
      Wrap the entire operation in a transaction to ensure atomicity.
      sequelize.transaction() groups several database operations into a single all-or-nothing unit. 
      Either every query inside it succeeds and gets saved (committed), 
      or if any of them fails, all of them are undone (rolled back).
    */
    sequelize.transaction(async (transaction) => {
      if (uploadIds.length > 0) {
        // Fetch all uploads that match the provided IDs, belong to the user, and are meant for posts. 
        const uploads = await Upload.findAll({
          where: {
            id: { [Op.in]: uploadIds }, // [Op.in] checks if the upload's id is in the list of provided uploadIds
            userId,
            purpose: "post",
          },
          transaction, // transaction makes the query part of the transaction
          // lock: transaction.LOCK.UPDATE locks those rows (SELECT ... FOR UPDATE) until the transaction ends. 
          // If two requests try to attach the same upload at the same time, the second one waits for the first to finish instead of racing it.
          lock: transaction.LOCK.UPDATE,
        });

        if (uploads.length !== uploadIds.length) {
          throw new AppError(400, "One or more uploads are invalid");
        }

        // The joining table records which uploads belong to which posts.
        // used for many to many relationships. It prevents the same upload from being attached to multiple posts.
        const alreadyAttached = await PostImage.findOne({
          where: { uploadId: { [Op.in]: uploadIds } },
          transaction,
        });
        if (alreadyAttached) {
          throw new AppError(409, "One or more uploads are already attached");
        }
      }

      // Create the post with its text content.
      const post = await Post.create(
        {
          content: content?.trim() ? content.trim() : null,
          userId,
        },
        { transaction },
      );

      // If there are uploads to attach, create PostImage entries linking the post to each upload. (junction table)
      if (uploadIds.length > 0) {
/*
bulkCreate => 
In Sequelize, bulkCreate() is used to insert multiple records into a database in a single operation 
instead of calling create() separately for every record.
*/        
        await PostImage.bulkCreate(
          uploadIds.map((uploadId, position) => ({
            postId: post.id,
            uploadId,
            position,
          })),
          { transaction },
        );
      }
/*
In Sequelize, post.reload() fetches the latest version of an existing model instance from the database 
and updates that instance with the retrieved values.
*/
      return post.reload({
        include: [postImageInclude()],
        transaction,
      });
    }),

  postExists: async (id: number) =>
    (await Post.findByPk(id, { attributes: ["id"] })) !== null,

  getPostDetails: async (id: number, userId: number) => {
    const post = await Post.findByPk(id, {
      include: [
        {
          association: "user",
          attributes: ["id", "username", "firstName", "lastName", "avatar"],
        },
        postImageInclude(),
      ],
    });
    if (!post) return null;

    // Fetch the like count, comment count, and whether the current user has liked the post in parallel using Promise.all
    const [likeCount, commentCount, likedByMe] = await Promise.all([
      Like.count({ where: { postId: id } }),
      Comment.count({ where: { postId: id } }),
      Like.findOne({ where: { postId: id, userId }, attributes: ["id"] }),
    ]);
    return {
      ...post.toJSON(),
      likeCount,
      commentCount,
      likedByMe: likedByMe !== null,
    };
  },

  updatePost: async (id: number, userId: number, content: string) => {
    const post = await Post.findOne({ where: { id, userId } });
    if (!post) return null;
    post.content = content;
    await post.save();
    return post;
  },

  deletePost: async (id: number, userId: number) => {
    const post = await Post.findOne({ where: { id, userId } });
    if (!post) return false;

    await sequelize.transaction(async (transaction) => {
      await Promise.all([
        Like.destroy({ where: { postId: id }, transaction }),
        Comment.destroy({ where: { postId: id }, transaction }),
      ]);
      await post.destroy({ transaction });
    });
    return true;
  },

  /*
  In Sequelize, findOrCreate() is used to find an existing record in the database or create it if it doesn't exist.
  */
  likePost: async (postId: number, userId: number) => {
    const [like] = await Like.findOrCreate({
      where: { postId, userId },
      defaults: { postId, userId },
    });
    return like;
  },

  unlikePost: async (postId: number, userId: number) => {
    // return a boolean indicating whether the unlike operation actually deleted a record.
    const deleted = await Like.destroy({ where: { postId, userId } });
    /* 
    Because we want to return a boolean indicating whether the unlike operation actually deleted a record.
    */
    return deleted > 0;
  },

  getPostLikes: async (id: number) => Like.findAll({ where: { postId: id } }),

  addComment: async (id: number, userId: number, content: string) =>
    Comment.create({ content, postId: id, userId }),

  deleteComment: async (id: number, commentId: number, userId: number) => {
    const deleted = await Comment.destroy({
      where: { id: commentId, postId: id, userId },
    });
    return deleted > 0;
  },

  getComments: async (id: number) =>
    Comment.findAll({
      where: { postId: id },
      include: [
        {
          association: "user",
          attributes: ["id", "username", "firstName", "lastName", "avatar"],
        },
      ],
      order: [
        ["createdAt", "ASC"],
        ["id", "ASC"],
      ],
    }),

  updateComment: async (
    id: number,
    commentId: number,
    userId: number,
    content: string,
  ) => {
    const comment = await Comment.findOne({
      where: { id: commentId, postId: id, userId },
    });
    if (!comment) return null;
    comment.content = content;
    await comment.save();
    return comment;
  },
};

export default postRepository;
