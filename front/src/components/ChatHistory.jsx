const ChatHistory = ({ history = [] }) => {
  if (!Array.isArray(history) || history.length === 0) return null;
  return (
    <div className="space-y-2 mb-4">
      {history.map((m, i) => (
        <div key={i} className={m.role === 'user' ? 'text-blue-700' : 'text-gray-800'}>
          {m.content}
        </div>
      ))}
    </div>
  );
};
export default ChatHistory;
