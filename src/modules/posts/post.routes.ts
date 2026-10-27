// express router to define routes for posts and comments
import { Router } from "express";
/*
2 middlewares
1. authenticate => Apply authentication to private operations
2. validateBody => body validation to writes
*/
import { authenticate } from "@middlewares/auth.middleware";
import { validateBody } from "@middlewares/validate.middleware";

import postController from "@modules/posts/post.controller";
import {
  createCommentSchema,
  createPostSchema,
  updatePostSchema,
} from "@modules/posts/post.validation";

// Routes for posts and comments => define paths and middleware orders 
const postRoutes = Router();

postRoutes.get("/feed", authenticate, postController.getFeed);

postRoutes.post(
  "/posts",
  authenticate,
  validateBody(createPostSchema),
  postController.createPost,
);
postRoutes.get("/posts/:id", authenticate, postController.getPostDetails);
postRoutes.patch(
  "/posts/:id",
  authenticate,
  validateBody(updatePostSchema),
  postController.updatePost,
);
postRoutes.delete("/posts/:id", authenticate, postController.deletePost);

postRoutes.post("/posts/:id/like", authenticate, postController.likePost);
postRoutes.post("/posts/:id/unlike", authenticate, postController.unlikePost);
postRoutes.get("/posts/:id/likes", authenticate, postController.getPostLikes);

postRoutes.post(
  "/posts/:id/comments",
  authenticate,
  validateBody(createCommentSchema),
  postController.addComment,
);
postRoutes.delete(
  "/posts/:id/comments/:commentId",
  authenticate,
  postController.deleteComment,
);
postRoutes.get("/posts/:id/comments", authenticate, postController.getComments);
postRoutes.patch(
  "/posts/:id/comments/:commentId",
  authenticate,
  validateBody(createCommentSchema),
  postController.updateComment,
);

export default postRoutes;
