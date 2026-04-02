import { useState } from 'react';

const EMOJIS = [
  { emoji: '\uD83D\uDD25', label: 'fire' },
  { emoji: '\uD83E\uDD88', label: 'shark' },
  { emoji: '\uD83D\uDE31', label: 'wow' },
  { emoji: '\uD83D\uDC4F', label: 'clap' },
  { emoji: '\uD83D\uDE02', label: 'laugh' },
];

function getStorageKey(goalId) {
  return `sharks-reactions-${goalId}`;
}

function getStoredReactions(goalId) {
  try {
    const data = localStorage.getItem(getStorageKey(goalId));
    return data ? JSON.parse(data) : {};
  } catch { return {}; }
}

function getStoredComments(goalId) {
  try {
    const data = localStorage.getItem(`sharks-comments-${goalId}`);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

export default function Reactions({ goalId }) {
  const [reactions, setReactions] = useState(() => getStoredReactions(goalId));
  const [myReactions, setMyReactions] = useState(() => {
    try {
      const d = localStorage.getItem(`sharks-my-reactions-${goalId}`);
      return d ? JSON.parse(d) : {};
    } catch { return {}; }
  });
  const [comments, setComments] = useState(() => getStoredComments(goalId));
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  function toggleReaction(label) {
    const newReactions = { ...reactions };
    const newMy = { ...myReactions };

    if (newMy[label]) {
      newReactions[label] = Math.max(0, (newReactions[label] || 1) - 1);
      delete newMy[label];
    } else {
      newReactions[label] = (newReactions[label] || 0) + 1;
      newMy[label] = true;
    }

    setReactions(newReactions);
    setMyReactions(newMy);
    localStorage.setItem(getStorageKey(goalId), JSON.stringify(newReactions));
    localStorage.setItem(`sharks-my-reactions-${goalId}`, JSON.stringify(newMy));
  }

  function addComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newComment = {
      text: commentText.trim(),
      time: new Date().toISOString(),
      id: Date.now(),
    };
    const updated = [...comments, newComment];
    setComments(updated);
    setCommentText('');
    localStorage.setItem(`sharks-comments-${goalId}`, JSON.stringify(updated));
  }

  return (
    <>
      <div className="reactions">
        {EMOJIS.map(({ emoji, label }) => (
          <button
            key={label}
            className={`reaction-btn ${myReactions[label] ? 'active' : ''}`}
            onClick={() => toggleReaction(label)}
          >
            {emoji}
            {reactions[label] > 0 && <span className="count">{reactions[label]}</span>}
          </button>
        ))}
      </div>
      <div className="comments-section">
        <button className="comments-toggle" onClick={() => setShowComments(!showComments)}>
          {showComments ? 'Hide' : 'Show'} comments {comments.length > 0 && `(${comments.length})`}
        </button>
        {showComments && (
          <>
            <div className="comment-list">
              {comments.map(c => (
                <div key={c.id} className="comment">
                  <div className="comment-avatar">{'\uD83E\uDD88'}</div>
                  <div>
                    <div className="comment-text">{c.text}</div>
                    <div className="comment-time">
                      {new Date(c.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <form className="comment-input" onSubmit={addComment}>
              <input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                maxLength={280}
              />
              <button type="submit">Post</button>
            </form>
          </>
        )}
      </div>
    </>
  );
}
