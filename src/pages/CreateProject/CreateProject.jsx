import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import './CreateProject.css';

function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Nhận dữ liệu từ form rồi gửi lên API
  async function handleCreate(data) {
    try {
      setSaving(true);
      setError('');
      await api.post('/projects', {
        title: data.title,
        type: data.type,
        description: data.description,
        startDate: data.startDate,
        endDate: data.endDate,
        memberIds: data.memberIds,
        status: 'OnTrack',
        leaderId: user.id,
        issues: 0,
        files: 0,
      });
      navigate('/projects');
    } catch (err) {
      setError('Không tạo được dự án. Hãy thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="form-breadcrumb">
        <Link to="/projects">Projects</Link> / Create Project
      </h1>
      <ProjectForm
        submitLabel="Create"
        secondaryLabel="Cancel"
        onSubmit={handleCreate}
        onSecondary={function () { navigate('/projects'); }}
        saving={saving}
        serverError={error}
      />
    </div>
  );
}

export default CreateProject;
