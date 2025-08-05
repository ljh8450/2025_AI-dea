import React, { useState, useEffect } from 'react';
import QueryInput from '../components/QueryInput';
import AIResponse from '../components/AIResponse';
import TrendList from '../components/TrendList';
import Header from '../components/Header';
import axios from 'axios';

const Main = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [trend, setTrend] = useState([]);

  const handleSubmit = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/query', { message: input });
      setResponse(res.data.answer);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    axios.get('http://localhost:5000/api/trends')
      .then(res => setTrend(res.data.topics))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 pb-10">
      <Header />
      <div className="p-6 max-w-3xl mx-auto">
        <QueryInput input={input} setInput={setInput} onSubmit={handleSubmit} />
        <AIResponse response={response} />
        <TrendList trend={trend} />
      </div>
    </div>
  );
};

export default Main;
