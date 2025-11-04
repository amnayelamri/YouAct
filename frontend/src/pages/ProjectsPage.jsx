import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { projectService } from '../services/api'
import { Plus, Trash2, Play } from 'lucide-react'
import '../styles/projects.css'

function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoLink: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectService.getAll()
      setProjects(response.data.projects || [])
      setError('')
    } catch (err) {
      setError('Failed to load projects')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title || !formData.videoLink) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await projectService.create(
        formData.title,
        formData.description,
        formData.videoLink
      )

      setFormData({ title: '', description: '', videoLink: '' })
      setShowForm(false)
      fetchProjects()
    } catch (err) {
      alert('Failed to create project: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDelete = async (projectId) => {
    if (confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(projectId)
        fetchProjects()
      } catch (err) {
        alert('Failed to delete project')
      }
    }
  }

  return (
    <main className="container">
      <div className="projects-header">
        <h1>My Projects</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card project-form">
          <h2>Create New Project</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title" className="form-label">Project Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g., JavaScript Tutorial Part 1"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                placeholder="Add notes about your project..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="videoLink" className="form-label">YouTube Video Link *</label>
              <input
                id="videoLink"
                type="url"
                name="videoLink"
                className="form-input"
                placeholder="https://www.youtube.com/watch?v=..."
                value={formData.videoLink}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Create Project</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner mt-md"></div>
      ) : projects.length === 0 ? (
        <div className="empty-state card">
          <p>No projects yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project._id} className="project-card card">
              <div className="project-thumbnail">
                {project.thumbnail && (
                  <img src={project.thumbnail} alt={project.title} />
                )}
              </div>

              <h3>{project.title}</h3>

              {project.description && (
                <p className="text-muted text-sm">{project.description}</p>
              )}

              <div className="project-actions">
                <Link
                  to={`/project/${project._id}`}
                  className="btn btn-primary btn-sm"
                >
                  <Play size={16} />
                  Open
                </Link>

                <button
                  onClick={() => handleDelete(project._id)}
                  className="btn btn-danger btn-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default ProjectsPage
