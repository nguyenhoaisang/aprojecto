import { useEffect, useRef, useState } from 'react';
import { FiX, FiPlay, FiPause, FiTag, FiCheckCircle, FiUser, FiCalendar, FiPaperclip, FiPlus } from 'react-icons/fi';
import api from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';
import './TaskModal.css';

const STATUS_LIST = ['Pending', 'On Progress', 'On Hold', 'Completed'];
const PRIORITY_LIST = ['low', 'high'];

function pad(n) {
  if (n < 10) {
    return '0' + n;
  }
  return '' + n;
}

// Đổi số giây thành "mm:ss" (hoặc "hh:mm:ss" nếu quá 1 giờ)
function formatTimer(total) {
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return pad(h) + ':' + pad(m) + ':' + pad(s);
  }
  return pad(m) + ':' + pad(s);
}

// Popup chi tiết task. onChange(task) báo cho trang cha biết task đã được cập nhật
function TaskModal({ task, users, onClose, onChange }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');

  // Đồng hồ bấm giờ: mỗi giây tăng 1 khi đang chạy
  useEffect(function () {
    if (!running) {
      return undefined;
    }
    const timerId = setInterval(function () {
      setSeconds(function (s) { return s + 1; });
    }, 1000);
    return function () { clearInterval(timerId); };
  }, [running]);

  function findUser(id) {
    for (let i = 0; i < users.length; i++) {
      if (users[i].id === id) {
        return users[i];
      }
    }
    return null;
  }

  // Gửi thay đổi lên API rồi báo cho trang cha
  async function save(changes) {
    try {
      const res = await api.patch('/tasks/' + task.id, changes);
      onChange(res.data);
      setError('');
    } catch (err) {
      setError('Không lưu được thay đổi. Hãy thử lại.');
    }
  }

  function handleFiles(e) {
    const names = (task.attachments || []).slice();
    for (let i = 0; i < e.target.files.length; i++) {
      names.push(e.target.files[i].name);
    }
    save({ attachments: names });
  }

  function handleComment(e) {
    e.preventDefault();
    if (commentText.trim() === '') {
      return;
    }
    const list = (task.comments || []).slice();
    list.push({ userId: user.id, text: commentText.trim() });
    save({ comments: list });
    setCommentText('');
  }

  const owner = findUser(task.ownerId);
  const assignee = findUser(task.assigneeId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={function (e) { e.stopPropagation(); }}>
        <div className="modal-top">
          <small>Project / Task ID-{task.id}</small>
          <button className="modal-close" onClick={onClose}><FiX size={26} /></button>
        </div>

        <div className="modal-title-row">
          <h2>{task.title}</h2>
          <div className="modal-timer">
            <span>{formatTimer(seconds)}</span>
            <button onClick={function () { setRunning(!running); }} title="Bắt đầu / dừng bấm giờ">
              {running ? <FiPause size={16} /> : <FiPlay size={16} />}
            </button>
          </div>
        </div>

        <div className="modal-info">
          <span><FiTag size={18} /> Priority</span>
          <select className={'modal-pill pill-' + task.priority} value={task.priority} onChange={function (e) { save({ priority: e.target.value }); }}>
            {PRIORITY_LIST.map(function (p) { return <option key={p} value={p}>{p}</option>; })}
          </select>

          <span><FiCheckCircle size={18} /> Status</span>
          <select className={'modal-pill pill-' + task.status.replace(' ', '')} value={task.status} onChange={function (e) { save({ status: e.target.value }); }}>
            {STATUS_LIST.map(function (s) { return <option key={s} value={s}>{s}</option>; })}
          </select>

          <span><FiUser size={18} /> Owner</span>
          <b className="modal-person">{owner && <img src={owner.avatar} alt="" />} {owner ? owner.name : '-'}</b>

          <span><FiUser size={18} /> Assignee</span>
          <b className="modal-person">{assignee && <img src={assignee.avatar} alt="" />} {assignee ? assignee.name : '-'}</b>

          <span><FiCalendar size={18} /> Due Date</span>
          <b className="modal-plain">{formatDate(task.endDate)}</b>
        </div>

        <h3>Attachments</h3>
        <ul className="modal-files">
          {(task.attachments || []).map(function (name, index) {
            return <li key={index}><FiPaperclip size={16} /> {name}</li>;
          })}
        </ul>
        <input type="file" multiple hidden ref={fileRef} onChange={handleFiles} />
        <button className="modal-add" onClick={function () { fileRef.current.click(); }}><FiPlus size={16} /> Add Attachment</button>

        <h3>Description</h3>
        <p className="modal-desc">{task.description || 'Chưa có mô tả.'}</p>

        <h3>Comments</h3>
        <ul className="modal-comments">
          {(task.comments || []).map(function (c, index) {
            const author = findUser(c.userId);
            return (
              <li key={index}>
                {author && <img src={author.avatar} alt="" />}
                <div><b>{author ? author.name : 'Unknown'}</b><p>{c.text}</p></div>
              </li>
            );
          })}
        </ul>
        <form className="modal-comment-form" onSubmit={handleComment}>
          <img src={user.avatar} alt="" />
          <input type="text" placeholder="Add a comment..." value={commentText} onChange={function (e) { setCommentText(e.target.value); }} />
          <button type="submit">Send</button>
        </form>

        {error !== '' && <p className="modal-error">{error}</p>}
      </div>
    </div>
  );
}

export default TaskModal;
