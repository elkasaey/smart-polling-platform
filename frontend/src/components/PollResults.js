import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import './PollResults.css';

const PollResults = () => {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPollResults();
  }, [id]);

  const fetchPollResults = async () => {
    try {
      setLoading(true);
      
      // Fetch poll details
      const pollResponse = await axios.get(`/api/polls/${id}/`);
      setPoll(pollResponse.data);
      
      // Fetch results
      const resultsResponse = await axios.get(`/api/polls/${id}/results/`);
      setResults(resultsResponse.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch poll results');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const renderChart = (questionResult) => {
    const { question_type, results: questionResults, total_responses } = questionResult;
    
    if (question_type === 'text') {
      return (
        <div className="text-results">
          <h4>Sample Responses ({questionResults.sample_responses?.length || 0})</h4>
          <div className="text-responses">
            {questionResults.sample_responses?.map((response, index) => (
              <div key={index} className="text-response">
                <span className="response-number">{index + 1}.</span>
                <span className="response-text">{response}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (['single_choice', 'multiple_choice'].includes(question_type)) {
      const chartData = Object.entries(questionResults).map(([choice, count]) => ({
        name: choice,
        value: count,
        percentage: total_responses > 0 ? ((count / total_responses) * 100).toFixed(1) : 0
      }));

      return (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, 'Responses']}
                labelFormatter={(label) => `${label} (${chartData.find(d => d.name === label)?.percentage}%)`}
              />
              <Legend />
              <Bar dataKey="value" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="chart-summary">
            <div className="summary-item">
              <span className="summary-label">Total Responses:</span>
              <span className="summary-value">{total_responses}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Most Popular:</span>
              <span className="summary-value">
                {chartData.reduce((max, item) => item.value > max.value ? item : max, chartData[0])?.name}
              </span>
            </div>
          </div>
        </div>
      );
    }

    return <p>Unsupported question type</p>;
  };

  const getTotalResponses = () => {
    if (results.length === 0) return 0;
    return Math.max(...results.map(r => r.total_responses));
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading results...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="alert alert-error">
          {error}
        </div>
        <Link to={`/poll/${id}`} className="btn">
          Back to Poll
        </Link>
      </div>
    );
  }

  if (!poll || !results) {
    return (
      <div className="error-container">
        <div className="alert alert-error">
          Poll or results not found
        </div>
        <Link to="/" className="btn">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="poll-results">
      <div className="page-header">
        <h1>{poll.title} - Results</h1>
        <p>Real-time insights from your poll responses</p>
      </div>

      <div className="results-overview">
        <div className="overview-stats">
          <div className="stat-card">
            <div className="stat-number">{poll.questions.length}</div>
            <div className="stat-label">Questions</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{getTotalResponses()}</div>
            <div className="stat-label">Total Responses</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{poll.creator_username}</div>
            <div className="stat-label">Created By</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{poll.is_expired ? 'Expired' : 'Active'}</div>
            <div className="stat-label">Status</div>
          </div>
        </div>
      </div>

      <div className="results-content">
        {results.map((questionResult, index) => (
          <div key={questionResult.question_id} className="result-card">
            <div className="result-header">
              <h3>Question {index + 1}</h3>
              <span className="question-type">{questionResult.question_type.replace('_', ' ').toUpperCase()}</span>
            </div>
            
            <p className="question-text">{questionResult.question_text}</p>
            
            {renderChart(questionResult)}
          </div>
        ))}
      </div>

      <div className="results-actions">
        <Link to={`/poll/${id}/participate`} className="btn">
          Participate Again
        </Link>
        <Link to={`/poll/${id}`} className="btn btn-secondary">
          Back to Poll
        </Link>
        <Link to="/create" className="btn btn-secondary">
          Create New Poll
        </Link>
      </div>
    </div>
  );
};

export default PollResults;
