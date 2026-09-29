export default function Header({ onMenuClick }) {
  return (
    <header className="header">

       <button
                className="hamburger"
                onClick={onMenuClick}
                aria-label="Toggle sidebar"
            >
                ☰
            </button>

      
      <h2 style={{color:'white'}} >My File Utilities</h2>
    </header>
  );
}