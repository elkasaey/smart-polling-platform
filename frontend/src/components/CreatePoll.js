import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const CreatePoll = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    allow_anonymous: true,
    expires_at: ''
  });
  
  const [questions, setQuestions] = useState([
    {
      text: '',
      question_type: 'single_choice',
      is_required: true,
      choices: [{ text: '' }],
      depends_on: null
    }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  const handleChoiceChange = (questionIndex, choiceIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices[choiceIndex].text = value;
    setQuestions(newQuestions);
  };

  const addChoice = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices.push({ text: '' });
    setQuestions(newQuestions);
  };

  const removeChoice = (questionIndex, choiceIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices.splice(choiceIndex, 1);
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        question_type: 'single_choice',
        is_required: true,
        choices: [{ text: '' }],
        depends_on: null
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const setConditionalLogic = (questionIndex, dependsOn) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].depends_on = dependsOn;
    setQuestions(newQuestions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error('Poll title is required');
      }

      if (questions.some(q => !q.text.trim())) {
        throw new Error('All questions must have text');
      }

      if (questions.some(q => ['single_choice', 'multiple_choice'].includes(q.question_type) && q.choices.some(c => !c.text.trim()))) {
        throw new Error('All choices must have text');
      }

      // Prepare data for submission
      const pollData = {
        ...formData,
        questions: questions.map(q => ({
          text: q.text,
          question_type: q.question_type,
          is_required: q.is_required,
          choices: q.choices.map(c => ({ text: c.text })),
          depends_on: q.depends_on
        }))
      };

      const response = await axios.post('/api/polls/', pollData);
      
      // Redirect to the created poll
      navigate(`/poll/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
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
    <div className="create-poll">
      <div className="page-header">
        <h1>Create a New Poll</h1>
        <p>Build intelligent polls with conditional logic and dynamic questions</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="poll-form">
        <div className="card">
          <h2>Poll Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Poll Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Enter poll title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Describe your poll"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expires_at">Expiration Date</label>
              <input
                type="datetime-local"
                id="expires_at"
                name="expires_at"
                className="form-control"
                value={formData.expires_at}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="allow_anonymous"
                  checked={formData.allow_anonymous}
                  onChange={(e) => setFormData({...formData, allow_anonymous: e.target.checked})}
                />
                Allow Anonymous Responses
              </label>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="questions-header">
            <h2>Questions</h2>
            <button type="button" onClick={addQuestion} className="btn btn-secondary">
              + Add Question
            </button>
          </div>

          {questions.map((question, questionIndex) => (
            <div key={questionIndex} className="question-builder">
              <div className="question-header">
                <h3>Question {questionIndex + 1}</h3>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <input
                  type="text"
                  className="form-control"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Question Type</label>
                  <select
                    className="form-control"
                    value={question.question_type}
                    onChange={(e) => handleQuestionChange(questionIndex, 'question_type', e.target.value)}
                  >
                    <option value="single_choice">Single Choice</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="text">Text Input</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={question.is_required}
                      onChange={(e) => handleQuestionChange(questionIndex, 'is_required', e.target.checked)}
                    />
                    Required
                  </label>
                </div>
              </div>

              {/* Conditional Logic */}
              {questionIndex > 0 && (
                <div className="conditional-logic">
                  <h4>Conditional Logic</h4>
                  <p>Show this question only if:</p>
                  
                  <select
                    value={question.depends_on?.question_id || ''}
                    onChange={(e) => {
                      const questionId = e.target.value;
                      if (questionId) {
                        const dependsOn = {
                          question_id: parseInt(questionId),
                          value: '',
                          operator: 'equals'
                        };
                        setConditionalLogic(questionIndex, dependsOn);
                      } else {
                        setConditionalLogic(questionIndex, null);
                      }
                    }}
                  >
                    <option value="">No dependency</option>
                    {questions.slice(0, questionIndex).map((q, i) => (
                      <option key={i} value={i}>
                        Question {i + 1}: {q.text.substring(0, 30)}...
                      </option>
                    ))}
                  </select>

                  {question.depends_on && (
                    <>
                      <select
                        value={question.depends_on.operator}
                        onChange={(e) => {
                          const newDependsOn = {...question.depends_on, operator: e.target.value};
                          setConditionalLogic(questionIndex, newDependsOn);
                        }}
                      >
                        <option value="equals">equals</option>
                        <option value="not_equals">not equals</option>
                        <option value="contains">contains</option>
                        <option value="not_contains">not contains</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Value"
                        value={question.depends_on.value}
                        onChange={(e) => {
                          const newDependsOn = {...question.depends_on, value: e.target.value};
                          setConditionalLogic(questionIndex, newDependsOn);
                        }}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Choices for multiple choice questions */}
              {['single_choice', 'multiple_choice'].includes(question.question_type) && (
                <div className="choices-section">
                  <label>Choices *</label>
                  {question.choices.map((choice, choiceIndex) => (
                    <div key={choiceIndex} className="choice-input">
                      <input
                        type="text"
                        className="form-control"
                        value={choice.text}
                        onChange={(e) => handleChoiceChange(questionIndex, choiceIndex, e.target.value)}
                        placeholder={`Choice ${choiceIndex + 1}`}
                        required
                      />
                      {question.choices.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChoice(questionIndex, choiceIndex)}
                          className="btn-remove-small"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addChoice(questionIndex)}
                    className="btn btn-secondary"
                  >
                    + Add Choice
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Creating Poll...' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePoll;
