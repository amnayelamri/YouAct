import Project from '../models/Project.js';
import Annotation from '../models/Annotation.js';

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.userId })
      .sort({ createdAt: -1 });

    res.json({
      count: projects.length,
      projects
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProject = async (req, res) => {
  const { title, description, videoLink } = req.body;

  if (!title || !videoLink) {
    return res.status(400).json({ message: 'Title and video link are required' });
  }

  try {
    const project = new Project({
      title,
      description,
      videoLink,
      userId: req.userId
    });

    await project.save();

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    if (project.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to access this project' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProject = async (req, res) => {
  const { title, description, videoLink, isPublic } = req.body;

  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    if (project.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    // Update fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (videoLink) project.videoLink = videoLink;
    if (isPublic !== undefined) project.isPublic = isPublic;

    await project.save();

    res.json({
      message: 'Project updated successfully',
      project
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    if (project.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Delete all annotations for this project
    await Annotation.deleteMany({ projectId: req.params.id });

    // Delete project
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project and all annotations deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
