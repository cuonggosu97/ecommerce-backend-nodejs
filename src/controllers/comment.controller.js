"use strict";

const { SuccessResponse } = require("../core/success.response");
const CommentService = require("../services/comment.service");

class CommentController {
  createComment = async (req, res, next) => {
    new SuccessResponse({
      message: "Create new comment success!",
      metadata: await CommentService.createComment(req.body),
    }).send(res);
  };

  deleteComment = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete comment success!",
      metadata: await CommentService.deleteComment(req.body),
    }).send(res);
  };

  getCommentsByParentId = async (req, res, next) => {
    new SuccessResponse({
      message: "Get comments success!",
      metadata: await CommentService.getCommentsByParentId(req.query),
    }).send(res);
  };
}

module.exports = new CommentController();
