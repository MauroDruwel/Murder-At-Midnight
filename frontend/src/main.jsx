import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Terminal from './components/Terminal';
import AppFrame from './components/AppFrame';
import AddInterviewLanding from './add-interview-landing';
import AddInterview from './add-interview';
import Interviews from './interviews';
import InterviewDetail from './interview-detail';
import Summaries from './summaries';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppFrame />}>
          <Route index element={<Terminal />} />
          <Route path="add-interview" element={<AddInterviewLanding />} />
          <Route path="add-interview/new" element={<AddInterview />} />
          <Route path="interviews" element={<Interviews />} />
          <Route path="interviews/:handle" element={<InterviewDetail />} />
          <Route path="summaries" element={<Summaries />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
