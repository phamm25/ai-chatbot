import { ReactNode } from 'react';
import styles from './AppLayout.module.css';

export const AppLayout = ({ header, children, footer }: { header: ReactNode; children: ReactNode; footer: ReactNode }) => {
  return (
    <div className={styles.shell}>
      <div className={styles.chatSurface}>
        {header}
        {children}
        {footer}
      </div>
    </div>
  );
};
