import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectService, annotationService } from '../services/api'
import { Trash2, Plus, ArrowLeft } from 'lucide-react'
import '../styles/project-detail.css'

function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [annotations, setAnnotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Annotation form state
  const [formData, setFormData] = useState({
    content: '',
    title: ''
  })
  const [currentTime, setCurrentTime] = useState(0)
  const videoRef = useRef(null)

  useEffect(() => {
    fetchProjectData()
  }, [id])

  const fetchProjectData = async () => {
    try {
      setLoading(true)
      const projectRes = await projectService.getById(id)
      setProject(projectRes.data)
      
      const annotationsRes = await annotationService.getByProject(id)
      setAnnotations(annotationsRes.data.annotations || [])
      setError('')
    } catch (err) {
      setError('Failed to load project')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoTimeUpdate = (e) => {
    setCurrentTime(Math.floor(e.target.currentTime))
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAddAnnotation = async (e) => {
    e.preventDefault()

    if (!formData.content.trim()) {
      alert('Please enter content')
      return
    }

    try {
      await annotationService.create(
        id,
        currentTime,
        formData.content,
        formData.title,
        'text'
      )

      setFormData({ content: '', title: '' })
      fetchProjectData()
    } catch (err) {
      alert('Failed to add annotation: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleDeleteAnnotation = async (annotationId) => {
    if (confirm('Delete this annotation?')) {
      try {
        await annotationService.delete(annotationId)
        fetchProjectData()
      } catch (err) {
        alert('Failed to delete annotation')
      }
    }
  }

  // Get annotations that should be visible at current time
  const visibleAnnotations = annotations
    .filter(ann => ann.timestamp <= currentTime)
    .sort((a, b) => b.timestamp - a.timestamp)

  if (loading) {
    return (
      <main className="container">
        <div className="spinner"></div>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="container">
        <div className="alert alert-error">{error || 'Project not found'}</div>
      </main>
    )
  }

  return (
    <main className="container project-detail">
      <div className="project-detail-header">
        <button onClick={() => navigate('/')} className="btn btn-outline btn-sm">
          <ArrowLeft size={18} />
          Back
        </button>
        <h1>{project.title}</h1>
      </div>

      <div className="project-detail-content">
        <div className="video-section">
          <div className="video-player">
            <iframe
              ref={videoRef}
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${project.videoId}?enablejsapi=1`}
              title={project.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onTimeUpdate={handleVideoTimeUpdate}
            ></iframe>
          </div>

          <div className="annotation-form-section">
            <h3>Add Annotation</h3>
            <div className="current-time">
              Current Time: <span className="time-display">{formatTime(currentTime)}</span>
            </div>

            <form onSubmit={handleAddAnnotation} className="annotation-form">
              <div className="form-group">
                <label htmlFor="title" className="form-label">Title (optional)</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  className="form-input"
                  placeholder="e.g., Step 1: Setup"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="content" className="form-label">Content *</label>
                <textarea
                  id="content"
                  name="content"
                  className="form-textarea"
                  placeholder="Write your annotation..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                <Plus size={18} />
                Add at {formatTime(currentTime)}
              </button>
            </form>
          </div>
        </div>

        <div className="annotations-section">
          <h3>Annotations</h3>

          {visibleAnnotations.length === 0 ? (
            <div className="empty-annotations">
              <p>No annotations for this moment</p>
              <p className="text-sm text-muted">Add annotations at specific timestamps using the form on the left</p>
            </div>
          ) : (
            <div className="annotations-list">
              {visibleAnnotations.map((annotation) => (
                <div key={annotation._id} className="annotation-item">
                  <div className="annotation-time">
                    {formatTime(annotation.timestamp)}
                  </div>

                  <div className="annotation-content">
                    {annotation.title && (
                      <h4 className="annotation-title">{annotation.title}</h4>
                    )}
                    <p>{annotation.content}</p>

                    <button
                      onClick={() => handleDeleteAnnotation(annotation._id)}
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

          <div className="all-annotations-summary">
            <h4>All Annotations ({annotations.length})</h4>
            <div className="annotations-timeline">
              {annotations.map((annotation) => (
                <div
                  key={annotation._id}
                  className="timeline-item"
                  title={annotation.title || annotation.content.substring(0, 50)}
                >
                  {formatTime(annotation.timestamp)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ProjectDetailPage
