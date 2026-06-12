import './globals.css';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'SDLC Knowledge Assessment System',
  description: 'Audit your engineering team\'s AI capability across every stage of the SDLC. Score L0 to L5. Get AI-powered recommendations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />
              <main style={{ flexGrow: 1, padding: '24px 0 48px' }}>
                <div className="container" style={{ maxWidth: '1100px' }}>
                  {children}
                </div>
              </main>
              <footer style={{
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-surface)',
                padding: '20px 0',
                color: 'var(--text-muted)',
                fontSize: '0.82rem',
                textAlign: 'center',
              }}>
                <div className="container">
                  <p style={{ margin: 0 }}>
                    © 2026 SDLC AI Maturity Assessment &nbsp;·&nbsp; Built for engineering teams
                  </p>
                </div>
              </footer>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
