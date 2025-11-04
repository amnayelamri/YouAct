import mongoose from 'mongoose';

const annotationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Number,
    required: [true, 'Please provide a timestamp (in seconds)'],
    min: 0
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'embed'],
    default: 'text'
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
    maxlength: 2000
  },
  title: {
    type: String,
    maxlength: 200
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient querying
annotationSchema.index({ projectId: 1, timestamp: 1 });
annotationSchema.index({ projectId: 1, userId: 1 });

// Update the updatedAt field
annotationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Annotation', annotationSchema);
