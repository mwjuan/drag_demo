import React from 'react';
import './App.css';
import User from './User';
import Task from './Task';

function App() {
  return <div style={{ display: 'flex', flexDirection: 'row' }}>
    <User />
    <Task />
  </div>
}

export default App;
