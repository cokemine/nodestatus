export const parseLoad = (num: number): number => {
  const load = Number(num.toFixed(2));
  return load % 1 ? load : Math.round(load);
};

export const parseUpdateTime = (updated: number | undefined): string => {
  if (!updated) return '从未';
  const nowTime: number = Date.now() / 1000;
  const seconds: number = Math.floor(nowTime - updated);
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return `${interval} 年前.`;
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return `${interval} 月前`;
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return `${interval} 日前`;
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return `${interval} 小时前`;
  interval = Math.floor(seconds / 60);
  if (interval > 1) return `${interval} 分钟前`;
  return '几秒前';
};
