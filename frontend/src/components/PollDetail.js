import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import './PollDetail.css';

const PollDetail = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPoll();
  }, [id]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/polls/${id}/`);
      setPoll(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch poll');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading poll...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-error">
          {error}
        </div>
        <Link to="/" className="btn">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="error-container">
        <div className="alert alert-error">
          Poll not found
        </div>
        <Link to="/" className="btn">
          Back to Home
        </Link>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiration';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'single_choice': return 'Single Choice';
      case 'multiple_choice': return 'Multiple Choice';
      case 'text': return 'Text Input';
      default: return type;
    }
  };

  return (
    <div className="poll-detail">
      <div className="page-header">
        <h1>{poll.title}</h1>
        <p>{poll.description}</p>
      </div>

      <div className="poll-info">
        <div className="poll-stats">
          <div className="stat-card">
            <div className="stat-number">{poll.questions.length}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{poll.creator_username}</div>
            <div className="stat-label">Created By</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{formatDate(poll.created_at)}</div>
            <div className="stat-label">Created</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{poll.is_expired ? 'Expired' : 'Active'}</div>
            <div className="stat-label">Status</div>
          </div>
        </div>

        <div className="poll-actions">
          <Link to={`/poll/${id}/participate`} className="btn">
            Participate in Poll
          </Link>
          <Link to={`/poll/${id}/results`} className="btn btn-secondary">
            View Results
          </Link>
        </div>
      </div>

      <div className="card">
        <h2>Poll Questions</h2>
        {poll.questions.map((question, index) => (
          <div key={question.id} className="poll-question">
            <div className="question-header">
              <h3>Question {index + 1}</h3>
              <span className="question-type">{getQuestionTypeLabel(question.question_type)}</span>
            </div>
            <p className="question-text">{question.text}</p>
            
            {question.depends_on_question_id && (
              <div className="conditional-info">
                <span className="conditional-badge">
                  Conditional: Shows only if Question {poll.questions.findIndex(q => q.id === question.depends_on_question_id) + 1} equals "{question.condition_value}"
                </span>
              </div>
            )}

            {['single_choice', 'multiple_choice'].includes(question.question_type) && (
              <div className="choices-list">
                {question.choices.map((choice, choiceIndex) => (
                  <div key={choice.id} className="choice-item">
                    <span className="choice-text">{choice.text}</span>
                  </div>
                ))}
              </div>
            )}

            {question.question_type === 'text' && (
              <div className="text-input-preview">
                <input 
                  type="text" 
                  placeholder="Text input field" 
                  disabled 
                  className="form-control"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="poll-footer">
        <div className="poll-meta">
          <p><strong>Anonymous responses:</strong> {poll.allow_anonymous ? 'Yes' : 'No'}</p>
          <p><strong>Expires:</strong> {formatDate(poll.expires_at)}</p>
        </div>
        
        <div className="poll-actions-footer">
          <Link to="/create" className="btn btn-secondary">
            Create Another Poll
          </Link>
          <Link to="/" className="btn">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PollDetail;
