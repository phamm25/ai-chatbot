import dayjs from 'dayjs';

export const formatTimestamp = (iso: string) => {
  return dayjs(iso).format('MMM D, HH:mm');
};
