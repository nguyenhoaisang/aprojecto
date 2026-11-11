import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import './EditProject.css';

function EditProject() {
  const { id } = useParams(); // lấy id dự án từ đường dẫn /projects/:id/edit
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(function () {
    api.get('/projects/' + id)
      .then(function (res) { setProject(res.data); })
      .catch(function () { setLoadError('Không tìm thấy dự án này.'); })
      .finally(function () { setLoading(false); });
  }, [id]);

  async function handleSave(data) {
    try {
      setSaving(true);
      setError('');
      await api.patch('/projects/' + id, data);
      navigate('/projects');
    } catch (err) {
      setError('Không lưu được thay đổi. Hãy thử lại.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Bạn chắc chắn muốn xóa dự án này?')) {
      return;
    }
    try {
      await api.delete('/projects/' + id);
      navigate('/projects');
    } catch (err) {
      setError('Không xóa được dự án. Hãy thử lại.');
    }
  }

  if (loading) {
    return <p>Đang tải...</p>;
  }
  if (loadError !== '') {
    return <p className="edit-error">{loadError} <Link to="/projects">Quay lại danh sách</Link></p>;
  }

  return (
    <div>
      <h1 className="form-breadcrumb">
        <Link to="/projects">Projects</Link> / Edit Project
      </h1>
      <ProjectForm
        initialData={project}
        submitLabel="Save changes"
        secondaryLabel="Delete"
        onSubmit={handleSave}
        onSecondary={handleDelete}
        saving={saving}
        serverError={error}
      />
    </div>
  );
}

export default EditProject;
