import { useState } from 'react';
import { FiSun, FiCalendar, FiClock, FiList, FiMessageSquare, FiMoreVertical } from 'react-icons/fi';
import { formatSlash } from '../../utils/formatDate';
import { daysBetween, todayText, isOverdue } from '../../utils/dateUtils';
import './TaskRow.css';

// Một dòng task. Các props không truyền thì phần đó sẽ không hiện:
// showDates: hiện ngày bắt đầu/kết thúc | subtaskCount: số subtask
// checklist: { checked, onChange } | menuActions: danh sách [{ label, onClick }]
function TaskRow({ task, assignee, ownerName, showDates, subtaskCount, checklist, onOpen, menuActions }) {
  const [menuOpen, setMenuOpen] = useState(false);

  let opened = daysBetween(task.startDate, todayText());
  if (opened < 0) {
    opened = 0;
  }
  const statusClass = 'tag tag-' + task.status.replace(' ', '');

  return (
    <div className="trow">
      {checklist && (
        <input type="checkbox" className="trow-check" checked={checklist.checked} onChange={checklist.onChange} />
      )}
      <div className="trow-card">
        <FiSun size={22} />
        <div className="trow-main">
          <button className="trow-title" onClick={onOpen}>{task.title}</button>
          <div className="trow-meta">
            <span>{task.code} Opened {opened} days ago by <b>{ownerName}</b></span>
            <span className={statusClass}>{task.status}</span>
            <span className={'tag tag-' + task.priority}>{task.priority}</span>
          </div>
        </div>

        {showDates && (
          <div className="trow-dates">
            <div><small>Start Date</small><p><FiCalendar size={16} /> {formatSlash(task.startDate)}</p></div>
            <div><small>End Date</small><p><FiCalendar size={16} /> {formatSlash(task.endDate)}</p></div>
          </div>
        )}

        <span className={isOverdue(task) ? 'trow-time late' : 'trow-time'}><FiClock size={18} /> {task.time}</span>
        {assignee && <img className="trow-avatar" src={assignee.avatar} alt={assignee.name} title={assignee.name} />}
        {subtaskCount !== undefined && <span className="trow-sub">{subtaskCount} <FiList size={20} /></span>}
        <button className="trow-icon" onClick={onOpen} title="Chi tiết / bình luận"><FiMessageSquare size={20} /></button>

        {menuActions && (
          <div className="trow-menu">
            <button className="trow-icon" onClick={function () { setMenuOpen(!menuOpen); }}><FiMoreVertical size={20} /></button>
            {menuOpen && (
              <ul className="trow-dropdown">
                {menuActions.map(function (a) {
                  return (
                    <li key={a.label}>
                      <button onClick={function () { setMenuOpen(false); a.onClick(); }}>{a.label}</button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskRow;
