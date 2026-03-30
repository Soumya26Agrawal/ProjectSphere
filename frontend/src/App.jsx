import { useState } from 'react'
import axios from 'axios';
import './App.css'

function App() {
  const [file, setFile] = useState(null);
 
  const handleFileChange = (e) => setFile(e.target.files[0]);
 
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file); // 'file' must match the @RequestParam name in Spring
 
    try {
      await axios.post('http://localhost:8081/api/excel/upload', formData);
      alert("Upload successful!");
    } catch (error) {
      console.error("Upload failed", error);
    }
  };
 
  return (
<div>
<input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
<button onClick={handleUpload}>Upload to Server</button>
</div>
  );
}

export default App
