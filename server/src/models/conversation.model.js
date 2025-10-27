const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      default: 'chatgpt',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

conversationSchema.methods.toJSON = function toJSON() {
  const conversation = this;
  const obj = conversation.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
