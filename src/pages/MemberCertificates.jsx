import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const MemberCertificates = ({ memberId }) => {
  const [certificates, setCertificates] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchCertificates = useCallback(async () => {
    if (!memberId) return;
    try {
      const res = await axios.get(`http://13.48.244.216:5000/api/members/${memberId}/certificates`);
      setCertificates(res.data);
    } catch (err) {
      console.error('Error fetching certificates', err);
    }
  }, [memberId]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleUpload = async () => {
  if (selectedFiles.length === 0) return;

  const formData = new FormData();
  selectedFiles.forEach(file => {
    formData.append('certificates', file);
  });

  try {
    setUploading(true);
    await axios.post(`http://13.48.244.216:5000/api/members/${memberId}/certificates`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setSelectedFiles([]);
    fetchCertificates();
  } catch (err) {
    if (err.response) {
      console.error('Upload error:', err.response.status, err.response.data);
    } else if (err.request) {
      console.error('No response received:', err.request);
    } else {
      console.error('Upload setup error:', err.message);
    }
  } finally {
    setUploading(false);
  }
};

  const handleDownload = async (id, name) => {
    try {
      const res = await axios.get(`http://13.48.244.216:5000/api/certificates/${id}/download`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download error', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://13.48.244.216:5000/api/certificates/${id}`);
      fetchCertificates();
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
  <h3>Upload Certificates (PDF only)</h3>
  <div className="d-flex align-items-center gap-3 mb-3">
    <input type="file" accept="application/pdf" multiple onChange={handleFileChange} />
    <button
      className="btn btn-primary"
      onClick={handleUpload}
      disabled={uploading}
    >
      {uploading ? 'Uploading...' : 'Upload'}
    </button>
  </div>

  <h4 className="mt-4">Uploaded Certificates</h4>
  {certificates.length === 0 ? (
    <p>No certificates uploaded.</p>
  ) : (
    <ul className="list-group">
      {certificates.map(cert => (
        <li key={cert.id} className="list-group-item d-flex justify-content-between align-items-center">
          <span>{cert.file_name}</span>
          <div className="btn-group">
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleDownload(cert.id, cert.file_name)}
            >
              Download
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDelete(cert.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</div>

  );
};

export default MemberCertificates;