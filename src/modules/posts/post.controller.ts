import { Request, Response } from "express";
import { AppError } from "@utils/AppError";
import postService from "@modules/posts/post.service";
import { FeedCursor } from "@modules/posts/post.types";

/*
difference between offset & cursor pagination:
=> offset
  - make database scan from the beginning of the dataset to the offset, 
  which can be inefficient for large datasets for example it will be slow at page 5000
  - it can go directly to specific page 

  use cases
  ==========
Use page/offset for:
  Admin dashboards, tables, and back-office lists
  Small or slow-changing datasets
  UIs with numbered pages or “jump to page N”
  Cases where you need a total count

=> cursor 
  - jumps straight to the position via index so it's fast at any index 
  - it can only move forward or backward from the current position, so it can't go directly to a specific page

  use cases
  ==========
  Infinite scroll and “load more” feeds
  Large or fast-changing tables (messages, notifications, activity logs, orders)
  Public APIs where clients might page through everything
  Anywhere duplicates or skipped items would be a visible bug
*/
const getUserId = (req: Request): number => {
  if (!req.user) throw new AppError(401, "Unauthorized");
  return req.user.id;
};

const parseId = (value: unknown, name: string): number => {
  if (typeof value !== "string") throw new AppError(400, `Invalid ${name}`);
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new AppError(400, `Invalid ${name}`);
  }
  return id;
};

const parseLimit = (value: unknown): number => {
  if (value === undefined) return 20;
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new AppError(400, "Invalid limit");
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > 100) {
    throw new AppError(400, "Invalid limit");
  }
  return parsed;
};

const decodeCursor = (value: unknown): FeedCursor | null => {
  if (value === undefined) return null;
  if (
    typeof value !== "string" ||
    value.length > 512 ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  ) {
    throw new AppError(400, "Invalid cursor");
  }

  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("createdAt" in parsed) ||
      !("id" in parsed) ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.id !== "number" ||
      !Number.isSafeInteger(parsed.id) ||
      parsed.id < 1
    ) {
      throw new Error();
    }

    const createdAt = new Date(parsed.createdAt);
    if (Number.isNaN(createdAt.getTime())) throw new Error();
    return { createdAt, id: parsed.id };
  } catch {
    throw new AppError(400, "Invalid cursor");
  }
};

const postController = {
  /*
  {
  "data": [
      {
        "id": 12,
        "content": "Hello world",
        "createdAt": "2026-10-24T10:00:00.000Z",
        "user": { "id": 3, "username": "sara_dev", "firstName": "Sara", "lastName": "Ali", "avatar": "..." },
        "images": [],
        "likeCount": 5,
        "commentCount": 2,
        "likedByMe": false
      }
    ],
    "pagination": {
      "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTEwLTIzVDA5OjAwOjAwLjAwMFoiLCJpZCI6MTF9",
      "hasMore": true
    }
  }
  */
  getFeed: async (req: Request, res: Response) => {
    /*
    Pulls the authenticated user’s id from the request, 
    usually set earlier by your auth middleware from the JWT
    */
    const userId = getUserId(req);
    /*
    Reads ?limit= from the URL and turns it into a safe number.
    Query params arrive as strings (or undefined), so a helper like this typically converts to a number
    */
    const limit = parseLimit(req.query.limit);
    /*
    Reads ?cursor= and decodes the opaque token (usually base64) back into something the query can use, 
    like { id: 123 } or { createdAt, id }. 
    On the first request there is no cursor, 
    so this should return null/undefined and the service starts from the newest post. 
    It should also handle garbage input gracefully, for example by throwing a 400 error.
    */
    const cursor = decodeCursor(req.query.cursor);
    /*
    Fetches one more row than the client asked for. 
    That’s the trick for knowing whether another page exists without a COUNT(*). 
    The service runs something like 
    WHERE id < :cursor ORDER BY id DESC LIMIT limit+1 for that user’s feed.
    */
    const posts = await postService.getFeed(limit + 1, cursor, userId);
    /*
    If you asked for 21 and got 21 back, at least one more post exists beyond this page, 
    so hasMore is true. If you got 20 or fewer, you’ve reached the end.
    */
    const hasMore = posts.length > limit;
    /*
    Removes the extra “lookahead” row so the client gets exactly limit items. 
    If there was no extra row (hasMore is false), it returns the array as is. 
    slice(0, limit) takes items from index 0 up to but not including limit.
    */
    const data = hasMore ? posts.slice(0, limit) : posts;
    /*
    last post to get the id used as cursor
    Grabs the last item of the trimmed page. Its id (or sort key) becomes the next cursor, 
    so the next request continues right after it.
    One thing to watch: if data is empty (no posts at all), lastPost is undefined, 
    so guard before using it. Something like this finishes the handler
    */
    const lastPost = data[data.length - 1];

    return res.json({
      data,
      pagination: {
        nextCursor:
          hasMore && lastPost
          /*
1. It keeps the cursor opaque. If the client sees ?cursor=123, it will start treating it 
as a post id: guessing 122, building URLs by hand, or relying on its meaning. 
An opaque token tells clients “don’t touch this, just pass it back.” 
That lets you change the internals later without breaking anyone.
2. The cursor often holds more than an id. If you sort by createdAt 
(or score, or anything non-unique), you need both the sort value 
and the id as a tiebreaker:

typescript
{ createdAt: "2026-10-21T10:00:00Z", id: 123 }

You can’t put that cleanly in a URL as a bare value. 
Base64-encoding the JSON turns it into one safe string: eyJjcmVhdGVkQXQiOi.... 
Encoding also avoids URL-escaping problems with characters like :, +, and quotes.
3. It’s easy to change later. If you switch from id ordering to createdAt + id, 
or add a filter field, the cursor format changes but the API contract (cursor is a string) doesn’t.  
=> Buffer.from is Node.js’s way of creating a Buffer, a chunk of raw binary data (bytes). 
It converts things like strings or arrays into bytes so you can convert between formats such as UTF-8 text, base64, and hex.        
### base64url-encodes the cursor object so the client can pass it back in the next request.          
          */
            ? Buffer.from(
                JSON.stringify({
                  createdAt: lastPost.createdAt.toISOString(),
                  id: lastPost.id,
                }),
              ).toString("base64url")
            : null,
        hasMore,
      },
    });
  },


  createPost: async (req: Request, res: Response) => {
    const post = await postService.createPost(
      req.body.content,
      getUserId(req),
      req.body.uploadIds ?? [],
    );
    return res.status(201).json(post);
  },

  getPostDetails: async (req: Request, res: Response) => {
    const post = await postService.getPostDetails(
      parseId(req.params.id, "post ID"),
      getUserId(req),
    );
    return res.json(post);
  },

  updatePost: async (req: Request, res: Response) => {
    const post = await postService.updatePost(
      parseId(req.params.id, "post ID"),
      getUserId(req),
      req.body.content,
    );
    return res.json(post);
  },

  deletePost: async (req: Request, res: Response) => {
    const result = await postService.deletePost(
      parseId(req.params.id, "post ID"),
      getUserId(req),
    );
    return res.json(result);
  },

  likePost: async (req: Request, res: Response) => {
    const like = await postService.likePost(
      parseId(req.params.id, "post ID"),
      getUserId(req),
    );
    return res.json(like);
  },

  unlikePost: async (req: Request, res: Response) => {
    const result = await postService.unlikePost(
      parseId(req.params.id, "post ID"),
      getUserId(req),
    );
    return res.json({ unliked: result });
  },

  getPostLikes: async (req: Request, res: Response) => {
    const likes = await postService.getPostLikes(
      parseId(req.params.id, "post ID"),
    );
    return res.json(likes);
  },

  addComment: async (req: Request, res: Response) => {
    const comment = await postService.addComment(
      parseId(req.params.id, "post ID"),
      getUserId(req),
      req.body.content,
    );
    return res.status(201).json(comment);
  },

  deleteComment: async (req: Request, res: Response) => {
    const result = await postService.deleteComment(
      parseId(req.params.id, "post ID"),
      parseId(req.params.commentId, "comment ID"),
      getUserId(req),
    );
    return res.json(result);
  },

  getComments: async (req: Request, res: Response) => {
    const comments = await postService.getComments(
      parseId(req.params.id, "post ID"),
    );
    return res.json(comments);
  },

  updateComment: async (req: Request, res: Response) => {
    const comment = await postService.updateComment(
      parseId(req.params.id, "post ID"),
      parseId(req.params.commentId, "comment ID"),
      getUserId(req),
      req.body.content,
    );
    return res.json(comment);
  },
};

export default postController;
