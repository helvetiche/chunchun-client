enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development' || __DEV__

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${level}] ${message}${data ? ` ${JSON.stringify(data)}` : ''}`
  }

  debug(message: string, data?: unknown) {
    if (this.isDev) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, data))
    }
  }

  info(message: string, data?: unknown) {
    console.log(this.formatMessage(LogLevel.INFO, message, data))
  }

  warn(message: string, data?: unknown) {
    console.warn(this.formatMessage(LogLevel.WARN, message, data))
  }

  error(message: string, error?: unknown) {
    console.error(this.formatMessage(LogLevel.ERROR, message))
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`)
      console.error(`Stack: ${error.stack}`)
    } else if (error) {
      console.error(error)
    }
  }
}

export const logger = new Logger()
