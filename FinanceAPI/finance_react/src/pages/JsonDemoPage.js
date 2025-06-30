import React, { useState } from 'react';
import JsonViewer from '../components/JsonViewer';
import JsonGridView from '../components/JsonGridView';

const sampleJson = {
  name: "John Doe",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Metropolis",
    zip: "12345"
  },
  hobbies: ["reading", "gaming", "hiking"],
  isActive: true
};

function JsonDemoPage() {
  const [json, setJson] = useState(sampleJson);
  const [input, setInput] = useState(JSON.stringify(sampleJson, null, 2));
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setInput(e.target.value);
    try {
      setJson(JSON.parse(e.target.value));
      setError(null);
    } catch (err) {
      setError('Invalid JSON');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>JSON Viewer Demo</h2>
      <textarea
        rows={10}
        cols={60}
        value={input}
        onChange={handleChange}
        style={{ fontFamily: 'monospace', marginBottom: 10 }}
      />
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <h3>Grid View:</h3>
      <div style={{ background: '#fff', color: '#222', padding: 10, borderRadius: 4, marginBottom: 20 }}>
        <JsonGridView data={json} />
      </div>
      <h3>Rendered JSON:</h3>
      <div style={{ background: '#222', color: '#fff', padding: 10, borderRadius: 4 }}>
        <JsonViewer data={json} />
      </div>
    </div>
  );
}

export default JsonDemoPage;
