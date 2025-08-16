import React from 'react';
import { Link } from 'react-router-dom';


const Home = () => {
  return (
    <div className="home">
      <div className="page-header">
        <h1>Welcome to Smart Polling Platform</h1>
        <p>Create intelligent polls with conditional logic and get real-time insights</p>
      </div>

      <div className="hero-section">
        <div className="hero-content">
          <h2>Transform Your Surveys with Smart Logic</h2>
          <p>
            Create dynamic polls that adapt based on user responses. 
            Show relevant questions only when they matter, making your surveys 
            more engaging and insightful.
          </p>
          <div className="hero-buttons">
            <Link to="/create" className="cta-button primary">
              Create Your First Poll
            </Link>
            <Link to="/poll/1/participate" className="cta-button secondary">
              Try Demo Poll
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <div className="demo-poll">
            <h3>Sample Conditional Flow</h3>
            <div className="flow-step">
              <span className="step-number">1</span>
              <span>Do you own a car? (Yes/No)</span>
            </div>
            <div className="flow-step conditional">
              <span className="step-number">2</span>
              <span>What brand? (only if Yes)</span>
            </div>
            <div className="flow-step conditional">
              <span className="step-number">3</span>
              <span>Why not? (only if No)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <div className="feature-icon">🧠</div>
          <h3>Conditional Logic</h3>
          <p>
            Create smart surveys that show relevant questions based on 
            previous answers. Skip irrelevant questions and improve completion rates.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Real-time Results</h3>
          <p>
            View live results as they come in. Get instant insights with 
            beautiful charts and analytics for your polls.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">🔒</div>
          <h3>Flexible Access</h3>
          <p>
            Support both authenticated and anonymous responses. 
            Choose what works best for your use case.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="feature-icon">⚡</div>
          <h3>Easy Creation</h3>
          <p>
            Intuitive interface for building complex polls. 
            Drag and drop questions, set conditions, and publish in minutes.
          </p>
        </div>
      </div>

      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <p>Join thousands of users creating smarter surveys today</p>
        <Link to="/create" className="cta-button">
          Create Your First Poll Now
        </Link>
      </div>
    </div>
  );
};

export default Home;
