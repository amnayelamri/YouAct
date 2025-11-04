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
    default: ''
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

// Single pre-save hook to extract video ID and update timestamp
projectSchema.pre('save', function(next) {
  // Extract video ID
  const url = this.videoLink;
  let videoId = '';
  
  try {
    // Try youtube.com/watch?v=
    if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    }
    // Try youtu.be/
    else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0];
    }
  } catch (err) {
    console.error('Video ID extraction error:', err);
  }
  
  this.videoId = videoId;
  
  // Generate thumbnail URL
  if (videoId && videoId.length === 11) {
    this.thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  
  // Update timestamp
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Project', projectSchema);
