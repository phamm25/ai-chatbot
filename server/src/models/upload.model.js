const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['image', 'csv'],
      required: true,
    },
    originalName: {
      type: String,
    },
    mimeType: {
      type: String,
    },
    size: {
      type: Number,
    },
    storagePath: {
      type: String,
      required: true,
    },
    publicUrl: {
      type: String,
    },
    checksum: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

uploadSchema.methods.toJSON = function toJSON() {
  const upload = this;
  const obj = upload.toObject();
  obj.id = obj._id;
  delete obj._id;
  delete obj.__v;
  return obj;
};

const Upload = mongoose.model('Upload', uploadSchema);

module.exports = Upload;
