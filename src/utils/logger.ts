/**
 * 统一日志工具
 * 开发环境输出日志，生产环境静默
 */

const isDev = import.meta.env.DEV;

export const logger = {
  error: isDev ? console.error : () => {},
  warn: isDev ? console.warn : () => {},
  info: isDev ? console.info : () => {},
  debug: isDev ? console.debug : () => {},
};
