import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';


const ParticipatePoll = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    fetchPollQuestions();
  }, [id]);

  const fetchPollQuestions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/participation/${id}/questions/`);
      setPoll(response.data);
      setQuestions(response.data.questions);
      
      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach(q => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
      
      // Generate session ID for anonymous users
      if (!sessionId) {
        setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch poll questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleMultipleChoiceChange = (questionId, choiceId, checked) => {
    setAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      let newAnswers;
      
      if (checked) {
        newAnswers = [...currentAnswers, choiceId];
      } else {
        newAnswers = currentAnswers.filter(id => id !== choiceId);
      }
      
      return {
        ...prev,
        [questionId]: newAnswers
      };
    });
  };

  const validateAnswers = () => {
    for (const question of questions) {
      if (question.is_required) {
        const answer = answers[question.id];
        if (!answer || (Array.isArray(answer) && answer.length === 0)) {
          return `Question "${question.text}" is required`;
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateAnswers();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const answersData = questions.map(question => ({
        question_id: question.id,
        answer_value: answers[question.id]
      }));

      await axios.post(`/api/answers/submit/${id}/`, {
        answers: answersData
      }, {
        headers: {
          'X-Session-ID': sessionId
        }
      });

      // Redirect to results
      navigate(`/poll/${id}/results`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit answers');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    const answer = answers[question.id];

    switch (question.question_type) {
      case 'single_choice':
        return (
          <div className="choices-container">
            {question.choices.map(choice => (
              <label key={choice.id} className="choice-item">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={choice.id}
                  checked={answer === choice.id}
                  onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value))}
                  required={question.is_required}
                />
                <span className="choice-text">{choice.text}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="choices-container">
            {question.choices.map(choice => (
              <label key={choice.id} className="choice-item">
                <input
                  type="checkbox"
                  value={choice.id}
                  checked={Array.isArray(answer) && answer.includes(choice.id)}
                  onChange={(e) => handleMultipleChoiceChange(question.id, choice.id, e.target.checked)}
                  required={question.is_required && (!answer || answer.length === 0)}
                />
                <span className="choice-text">{choice.text}</span>
              </label>
            ))}
          </div>
        );

      case 'text':
        return (
          <textarea
            className="form-control"
            value={answer || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Enter your answer"
            rows="3"
            required={question.is_required}
          />
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading poll...</h2>
      </div>
    );
  }

  if (error && !poll) {
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

  return (
    <div className="participate-poll">
      <div className="page-header">
        <h1>{poll.poll_title}</h1>
        <p>Please answer the following questions</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="poll-form">
        {questions.map((question, index) => (
          <div key={question.id} className="poll-question">
            <div className="question-header">
              <h3>Question {index + 1}</h3>
              {question.is_required && <span className="required-badge">Required</span>}
            </div>
            <p className="question-text">{question.text}</p>
            {renderQuestion(question, index)}
          </div>
        ))}

        <div className="form-actions">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </button>
          <Link to={`/poll/${id}`} className="btn btn-secondary">
            Back to Poll
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ParticipatePoll;
