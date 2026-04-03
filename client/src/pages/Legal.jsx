import { useLocation } from 'react-router-dom';

export default function Legal() {
  const { pathname } = useLocation();
  const isTerms = pathname === '/terms';

  return (
    <div className="page" style={{ maxWidth: 700 }}>
      <h1 className="page-title">{isTerms ? 'Terms of Service' : 'Privacy Policy'}</h1>
      <p className="page-subtitle">Last updated: April 3, 2026</p>

      {isTerms ? (
        <div style={{ color: '#e8e8f0', lineHeight: 1.8, fontSize: 14 }}>
          <p>Sharks Yearbook is a fan-made project for browsing San Jose Sharks highlights from the 2025-26 NHL season. By using this site, you agree to the following:</p>
          <ul style={{ marginTop: 12, paddingLeft: 20 }}>
            <li>This is an unofficial fan project and is not affiliated with the NHL or the San Jose Sharks.</li>
            <li>Video content is sourced from publicly available NHL highlight clips.</li>
            <li>Yearbook signatures and comments are public and visible to all visitors.</li>
            <li>We reserve the right to remove any content that is offensive or inappropriate.</li>
            <li>This site is provided as-is with no warranties.</li>
          </ul>
        </div>
      ) : (
        <div style={{ color: '#e8e8f0', lineHeight: 1.8, fontSize: 14 }}>
          <p>Sharks Yearbook collects minimal data:</p>
          <ul style={{ marginTop: 12, paddingLeft: 20 }}>
            <li>Yearbook signatures (name you provide, your note, and selected highlight) are stored in our database and publicly visible.</li>
            <li>Emoji reactions and goal comments are stored locally in your browser only.</li>
            <li>We do not collect emails, passwords, or personal identification information.</li>
            <li>We do not use cookies for tracking or advertising.</li>
            <li>We do not sell or share any data with third parties.</li>
          </ul>
          <p style={{ marginTop: 16 }}>For questions, reach out via the project's GitHub repository.</p>
        </div>
      )}
    </div>
  );
}
