import React from 'react';
import { FaLock } from 'react-icons/fa';

const MaintenanceOverlay = () => {
  return (
    <div style={styles.overlay}>
      <div style={styles.content}>
        <FaLock style={styles.icon} />
        <h1 style={styles.title}>Идёт настройка приложения на октябрь</h1>
        <p style={styles.subtitle}>Приложение заработает 2.10</p>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    textAlign: 'center',
    color: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  icon: {
    fontSize: '80px',
    marginBottom: '20px',
    color: '#f5f5f5',
  },
  title: {
    fontSize: '28px',
    margin: '0 0 10px 0',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: '18px',
    margin: 0,
    color: '#e0e0e0',
    fontWeight: '300',
  },
};

export default MaintenanceOverlay;
