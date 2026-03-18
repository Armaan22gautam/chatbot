import mongoose from "mongoose";
import mongooseFieldEncryption from "mongoose-field-encryption";
import { ENV } from "../lib/env.js";

const { fieldEncryption } = mongooseFieldEncryption;

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true }
);

messageSchema.plugin(fieldEncryption, {
  fields: ["text", "image"],
  secret: ENV.MESSAGE_ENCRYPTION_KEY,
});

const Message = mongoose.model("Message", messageSchema);

export default Message;
