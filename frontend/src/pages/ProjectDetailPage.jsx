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
  
  const [formData, setFormData] = useState({
    content: '',
    title: '',
    contentType: 'text'
  })
  const [currentTime, setCurrentTime] = useState(0)
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const timeIntervalRef = useRef(null)

  useEffect(() => {
    fetchProjectData()
  }, [id])

  // Initialize YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
      window.onYouTubeIframeAPIReady = createPlayer
    } else if (window.YT && window.YT.Player && project) {
      createPlayer()
    }

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current)
      }
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (err) {
          // Ignore
        }
      }
    }
  }, [project])

  const createPlayer = () => {
    if (!project || !containerRef.current) return
    if (playerRef.current) return

    try {
      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: project.videoId,
        width: '100%',
        height: '100%',
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange
        }
      })
    } catch (err) {
      console.error('Failed to create player:', err)
    }
  }

  const onPlayerReady = () => {
    // Start polling for current time
    startTimeTracking()
  }

  const onPlayerStateChange = (event) => {
    // 1 = playing, 0 = ended, 2 = paused, 3 = buffering, 5 = cued
    if (event.data === window.YT.PlayerState.PLAYING) {
      startTimeTracking()
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current)
      }
    }
  }

  const startTimeTracking = () => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current)
    }

    timeIntervalRef.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        try {
          const time = Math.floor(playerRef.current.getCurrentTime())
          setCurrentTime(time)
        } catch (err) {
          // Ignore errors
        }
      }
    }, 500)
  }

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const extractVideoId = (url) => {
    let videoId = ''
    if (url.includes('watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0]
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0].split('&')[0]
    }
    return videoId
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
        formData.contentType
      )

      setFormData({ content: '', title: '', contentType: 'text' })
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

  // Get all annotations that should be visible (timestamp <= currentTime)
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
            <div ref={containerRef} id="youtube-player"></div>
          </div>

          <div className="annotation-form-section">
            <h3>Add Annotation</h3>
            <div className="current-time">
              Current Time: <span className="time-display">{formatTime(currentTime)}</span>
            </div>

            <form onSubmit={handleAddAnnotation} className="annotation-form">
              <div className="form-group">
                <label htmlFor="contentType" className="form-label">Type</label>
                <select
                  id="contentType"
                  value={formData.contentType}
                  onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                  className="form-input"
                >
                  <option value="text">Text</option>
                  <option value="embed">YouTube Video</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="title" className="form-label">Title (optional)</label>
                <input
                  id="title"
                  type="text"
                  className="form-input"
                  placeholder="e.g., Step 1: Setup"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="content" className="form-label">
                  {formData.contentType === 'text' ? 'Text Content' : 'YouTube Link'} *
                </label>
                <textarea
                  id="content"
                  className="form-textarea"
                  placeholder={formData.contentType === 'text' 
                    ? 'Write your annotation...' 
                    : 'https://www.youtube.com/watch?v=...'}
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
          <h3>📌 Live Annotations ({visibleAnnotations.length})</h3>

          {visibleAnnotations.length === 0 ? (
            <div className="empty-annotations">
              <p>No annotations for this moment</p>
              <p className="text-sm text-muted">Annotations appear here when video reaches their timestamp</p>
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
                    
                    {annotation.contentType === 'embed' ? (
                      <div className="embedded-video">
                        <iframe
                          width="100%"
                          height="200"
                          src={`https://www.youtube.com/embed/${extractVideoId(annotation.content)}`}
                          title={annotation.title || 'Embedded Video'}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    ) : (
                      <p>{annotation.content}</p>
                    )}

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
            <h4>📋 All Annotations ({annotations.length})</h4>
            <div className="annotations-timeline">
              {annotations.map((annotation) => (
                <div
                  key={annotation._id}
                  className={`timeline-item ${annotation.timestamp <= currentTime ? 'active' : ''}`}
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
