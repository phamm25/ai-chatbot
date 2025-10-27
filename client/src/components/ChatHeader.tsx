import { ThemeToggle } from './ThemeToggle';
import { ModelSelector } from './ModelSelector';
import styles from './ChatHeader.module.css';

export const ChatHeader = () => {
  return (
    <header className={styles.header}>
      <div>
        <h1>Insights Copilot</h1>
        <p className={styles.subtitle}>Ask questions about your menus, photos, and data.</p>
      </div>
      <div className={styles.actions}>
        <ModelSelector />
        <ThemeToggle />
      </div>
    </header>
  );
};
