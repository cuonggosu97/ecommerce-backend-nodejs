"use strict";

const { notification } = require("../models/notification.model");

class NotificationService {
  async pushNotiToSystem({
    type = "SHOP-001",
    receivedId = 1,
    senderId = 1,
    options = {},
  }) {
    let noti_content;
    if (type === "SHOP-001") {
      noti_content = `@@@ vừa mới thêm một sản phẩm: @@@@`;
    } else if (type === "PROMOTION-001") {
      noti_content = `@@@ vừa mới thêm một chương trình khuyến mãi: @@@@`;
    }

    const newNoti = await notification.create({
      noti_type: type,
      noti_content,
      noti_senderId: senderId,
      noti_receivedId: receivedId,
      noti_options: options,
    });

    return newNoti;
  }

  static async listNotiByUser({ userId = 1, type = "ALL", isRead = 0 }) {
    const match = { noti_receivedId: userId };
    if (type !== "ALL") {
      match["noti_type"] = type;
    }

    return await notification.aggregate([
      { $match: match },
      {
        $project: {
          noti_type: 1,
          noti_senderId: 1,
          noti_receivedId: 1,
          noti_content: 1,
          noti_options: 1,
          createAt: 1,
        },
      },
    ]);
  }
}

module.exports = NotificationService;
