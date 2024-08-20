import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

// WorkDateをフォーマットする関数
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) { // 無効な日付の場合
    return '-';
  }
  return format(date, 'M月d日', { locale: ja });
};

// 時間をフォーマットする関数
export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) { // 無効な日付の場合
    return '-';
  }
  return format(date, 'HH:mm');
};
