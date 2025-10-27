import { ChangeEvent } from 'react';
import { useChat } from '../context/ChatContext';
import { SUPPORTED_MODELS } from '../constants/models';
import styles from './ModelSelector.module.css';

export const ModelSelector = () => {
  const { model, dispatch } = useChat();
  const value = model ?? SUPPORTED_MODELS[0].id;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch({ type: 'SET_MODEL', payload: event.target.value });
  };

  return (
    <div className={styles.wrapper}>
      <label htmlFor="model" className={styles.label}>
        Model
      </label>
      <select id="model" className={styles.select} value={value} onChange={handleChange}>
        {SUPPORTED_MODELS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
};
