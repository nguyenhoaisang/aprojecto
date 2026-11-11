import { Link } from 'react-router-dom';
import { FiEdit, FiClock, FiFile } from 'react-icons/fi';
import { formatDate } from '../../utils/formatDate';
import './ProjectCard.css';

// Thẻ hiển thị 1 dự án. canEdit: hiện nút sửa (Leader) | linkTo: bấm tên để mở chi tiết (Staff)
function ProjectCard({ project, members, canEdit, linkTo, deadlinePrefix = "" }) {
  const shown = members.slice(0, 4);
  const extra = members.length - shown.length;

  return (
    <article className="pcard">
      <div className="pcard-head">
        <h3>
          {linkTo ? <Link to={linkTo} className="pcard-link">{project.title}</Link> : project.title}
          {canEdit && (
            <Link to={'/projects/' + project.id + '/edit'} className="pcard-edit" title="Edit project">
              <FiEdit size={22} />
            </Link>
          )}
        </h3>
        <span className={'pcard-badge badge-' + project.status}>{project.status}</span>
      </div>

      <p className="pcard-desc">{project.description}</p>
      <p className="pcard-deadline"><FiClock size={16} /> {deadlinePrefix}{formatDate(project.endDate)}</p>

      <div className="pcard-foot">
        <div className="pcard-avatars">
          {shown.map(function (u) {
            return <img key={u.id} src={u.avatar} alt={u.name} title={u.name} />;
          })}
          {extra > 0 && <span className="pcard-more">+{extra}</span>}
        </div>
        <span className="pcard-issues"><FiFile size={16} /> {project.issues} issues</span>
      </div>
    </article>
  );
}

export default ProjectCard;
