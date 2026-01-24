import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            <main style={{ flex: 1, padding: '2rem 0' }}>
                <div className="container">
                    <Outlet />
                </div>
            </main>
            <footer style={{
                backgroundColor: 'var(--surface-color)',
                borderTop: '1px solid var(--border-color)',
                padding: '2rem 0',
                marginTop: 'auto'
            }}>
                <div className="container" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    &copy; {new Date().getFullYear()} Mossy Store. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Layout;
