import Annotation from '../models/Annotation.js';
import Project from '../models/Project.js';

export const getAnnotationsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists and user owns it
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    // Get all annotations for this project, sorted by timestamp
    const annotations = await Annotation.find({ projectId })
      .sort({ timestamp: 1, createdAt: 1 });

    res.json({
      count: annotations.length,
      annotations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createAnnotation = async (req, res) => {
  const { projectId, timestamp, content, title, contentType } = req.body;

  if (!projectId || timestamp === undefined || !content) {
    return res.status(400).json({ 
      message: 'Project ID, timestamp, and content are required' 
    });
  }

  try {
    // Verify project exists and user owns it
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to add annotations to this project' });
    }

    // Verify timestamp is within video duration
    if (timestamp < 0) {
      return res.status(400).json({ message: 'Timestamp cannot be negative' });
    }

    const annotation = new Annotation({
      projectId,
      userId: req.userId,
      timestamp,
      content,
      title,
      contentType: contentType || 'text'
    });

    await annotation.save();

    res.status(201).json({
      message: 'Annotation created successfully',
      annotation
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateAnnotation = async (req, res) => {
  const { content, title, timestamp, contentType } = req.body;

  try {
    let annotation = await Annotation.findById(req.params.id);

    if (!annotation) {
      return res.status(404).json({ message: 'Annotation not found' });
    }

    // Check authorization
    if (annotation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this annotation' });
    }

    // Update fields
    if (content) annotation.content = content;
    if (title !== undefined) annotation.title = title;
    if (timestamp !== undefined) annotation.timestamp = timestamp;
    if (contentType) annotation.contentType = contentType;

    await annotation.save();

    res.json({
      message: 'Annotation updated successfully',
      annotation
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteAnnotation = async (req, res) => {
  try {
    const annotation = await Annotation.findById(req.params.id);

    if (!annotation) {
      return res.status(404).json({ message: 'Annotation not found' });
    }

    // Check authorization
    if (annotation.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this annotation' });
    }

    await Annotation.findByIdAndDelete(req.params.id);

    res.json({ message: 'Annotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
