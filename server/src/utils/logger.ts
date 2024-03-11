import pino from "pino";

class Logger {
  private logger;

  constructor() {
    this.logger = pino();
  }

  info(message: string, context?: Record<string, any>) {
    this.logger.info(context ? { message, ...context } : message);
  }

  error(message: string, context?: Record<string, any>) {
    this.logger.error(context ? { message, ...context } : message);
  }
}

export default new Logger();
