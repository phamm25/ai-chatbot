import dayjs from 'dayjs';

export const formatTimestamp = (value: string) => dayjs(value).format('MMM D, HH:mm');
