import Sidebar from './Sidebar';
import Chatbot from './Chatbot';
import '../styles/MainLayout.css';

function MainLayout({ children }) {
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
      <Chatbot />
    </div>
  );
}

export default MainLayout;
