import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a project title'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  videoLink: {
    type: String,
    required: [true, 'Please provide a YouTube video link'],
    validate: {
      validator: function(v) {
        return /^(https?:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//.test(v);
      },
      message: 'Please provide a valid YouTube link'
    }
  },
  videoId: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  duration: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
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

// Extract video ID from YouTube link before saving
projectSchema.pre('save', function(next) {
  const url = this.videoLink;
  let videoId = '';
  
  // Extract from various YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    videoId = match[2];
  }
  
  this.videoId = videoId;
  
  // Generate thumbnail URL
  if (videoId) {
    this.thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  
  next();
});

// Update the updatedAt field
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Project', projectSchema);
