const cron = require("node-cron");
const etlCoursePerformanceService = require("./etlCoursePerformanceService");
const SASFetchCategorySubjectService = require("./sas-fetch-category-subject");
const spETLService = require("./spEtlService");
const teacherPerformanceEtlService = require("./TeacherPerformanceEtlService");
const userDetectLoginService = require("./userDetectLoginService");
const logger = require("../utils/logger");

class CronService {
  constructor() {
    this.etlCoursePerformanceTask = null;
    this.sasCategorySubjectTask = null;
    this.isETLCoursePerformanceRunning = false;
    this.isSASCategorySubjectRunning = false;
    this.isSPETLRunning = false;
    this.spETLStartTime = null;
    this.spETLContinuousInterval = null;
    this.spETLInterval = null;
    this.spETLRetryInterval = null;
    this.isTPETLRunning = false;
    this.tpETLStartTime = null;
    this.tpETLContinuousInterval = null;
    this.tpETLInterval = null;
    this.tpETLRetryInterval = null;
    this.isUDLETLRunning = false;
    this.udlETLStartTime = null;
    this.udlETLContinuousInterval = null;
    this.udlETLInterval = null;
    this.udlETLRetryInterval = null;
    // Load configuration from environment variables
    this.config = {
      timezone: process.env.CRON_TIMEZONE || "Asia/Jakarta",
      enabled: process.env.CRON_ENABLED === "true",

      // ETL Course Performance settings
      etlCoursePerformance: {
        enabled: process.env.ETL_COURSE_PERFORMANCE_ENABLED === "true",
        schedule: process.env.ETL_COURSE_PERFORMANCE_SCHEDULE || "0 * * * *",
        description:
          process.env.ETL_COURSE_PERFORMANCE_DESCRIPTION ||
          "Every hour at minute 0",
        timeout:
          parseInt(process.env.ETL_COURSE_PERFORMANCE_TIMEOUT) || 1800000,
        maxWaitTime:
          parseInt(process.env.ETL_COURSE_PERFORMANCE_MAX_WAIT_TIME) || 1800000,
      },

      // SAS Category Subject settings
      sasCategorySubject: {
        enabled: process.env.SAS_CATEGORY_SUBJECT_ENABLED === "true",
        schedule: process.env.SAS_CATEGORY_SUBJECT_SCHEDULE || "0 * * * *",
        description:
          process.env.SAS_CATEGORY_SUBJECT_DESCRIPTION ||
          "Every hour at minute 0",
        timeout: parseInt(process.env.SAS_CATEGORY_SUBJECT_TIMEOUT) || 1800000,
        maxWaitTime:
          parseInt(process.env.SAS_CATEGORY_SUBJECT_MAX_WAIT_TIME) || 1800000,
      },

      // Continuous ETL settings
      continuousETL: {
        spETL: {
          enabled: process.env.SP_ETL_CONTINUOUS_ENABLED === "true",
          interval: parseInt(process.env.SP_ETL_INTERVAL) || 300000, // 5 minutes
          retryInterval: parseInt(process.env.SP_ETL_RETRY_INTERVAL) || 120000, // 2 minutes
        },
        tpETL: {
          enabled: process.env.TP_ETL_CONTINUOUS_ENABLED === "true",
          interval: parseInt(process.env.TP_ETL_INTERVAL) || 300000, // 5 minutes
          retryInterval: parseInt(process.env.TP_ETL_RETRY_INTERVAL) || 120000, // 2 minutes
        },
        udlETL: {
          enabled: process.env.UDL_ETL_CONTINUOUS_ENABLED === "true",
          interval: parseInt(process.env.UDL_ETL_INTERVAL) || 300000, // 5 minutes
          retryInterval: parseInt(process.env.UDL_ETL_RETRY_INTERVAL) || 120000, // 2 minutes
        },
      },
    };
  }

  // Initialize and start cron jobs
  initialize() {
    if (!this.config.enabled) {
      logger.info("Cron jobs disabled via CRON_ENABLED=false");
      return;
    }

    logger.info("Initializing cron jobs for multiple ETL services");

    // Schedule ETL Course Performance if enabled
    if (this.config.etlCoursePerformance.enabled) {
      this.etlCoursePerformanceTask = cron.schedule(
        this.config.etlCoursePerformance.schedule,
        async () => {
          await this.runETLCoursePerformance();
        },
        {
          scheduled: true,
          timezone: this.config.timezone,
        }
      );
      logger.info(
        `ETL Course Performance cron job scheduled: ${this.config.etlCoursePerformance.description}`
      );
    } else {
      logger.info(
        "ETL Course Performance cron job disabled via ETL_COURSE_PERFORMANCE_ENABLED=false"
      );
    }

    // Schedule SAS Category Subject if enabled
    if (this.config.sasCategorySubject.enabled) {
      this.sasCategorySubjectTask = cron.schedule(
        this.config.sasCategorySubject.schedule,
        async () => {
          await this.runSASCategorySubject();
        },
        {
          scheduled: true,
          timezone: this.config.timezone,
        }
      );
      logger.info(
        `SAS Category Subject cron job scheduled: ${this.config.sasCategorySubject.description}`
      );
    } else {
      logger.info(
        "SAS Category Subject cron job disabled via SAS_CATEGORY_SUBJECT_ENABLED=false"
      );
    }

    logger.info("Multiple ETL cron jobs initialization completed");
  }

  // Run ETL Course Performance with proper waiting logic
  async runETLCoursePerformance() {
    // Check if ETL should run based on time (only at minute 00)
    if (!etlCoursePerformanceService.shouldRunETL()) {
      logger.info("ETL Course Performance process skipped - not minute 00");
      return;
    }

    // If ETL is already running, wait for it to finish
    if (this.isETLCoursePerformanceRunning) {
      logger.warn(
        "ETL Course Performance process is already running, waiting for it to finish..."
      );

      // Wait for current process to finish (max wait time from config)
      let waitTime = 0;
      const maxWaitTime = this.config.etlCoursePerformance.maxWaitTime;

      while (this.isETLCoursePerformanceRunning && waitTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
        waitTime += 10000;
        logger.info(
          `Waiting for ETL Course Performance process to finish... (${Math.round(
            waitTime / 1000
          )}s)`
        );
      }

      if (this.isETLCoursePerformanceRunning) {
        logger.error(
          `ETL Course Performance process is still running after ${Math.round(
            maxWaitTime / 1000
          )}s, skipping this scheduled run`
        );
        return;
      }

      logger.info(
        "Previous ETL Course Performance process finished, proceeding with new run"
      );
    }

    try {
      this.isETLCoursePerformanceRunning = true;
      logger.info("Starting scheduled ETL Course Performance process");

      // Set timeout for the ETL process
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("ETL Course Performance process timeout")),
          this.config.etlCoursePerformance.timeout
        );
      });

      const etlPromise = etlCoursePerformanceService.runETL();

      await Promise.race([etlPromise, timeoutPromise]);

      logger.info(
        "Scheduled ETL Course Performance process completed successfully"
      );
    } catch (error) {
      logger.error("Scheduled ETL Course Performance process failed:", {
        message: error.message,
        stack: error.stack,
      });
    } finally {
      this.isETLCoursePerformanceRunning = false;
    }
  }

  // Run SAS Category Subject with proper waiting logic
  async runSASCategorySubject() {
    // Check if it's minute 00 (same logic as ETL Course Performance)
    const now = new Date();
    const currentMinute = now.getMinutes();

    if (currentMinute !== 0) {
      logger.info("SAS Category Subject process skipped - not minute 00");
      return;
    }

    // If SAS process is already running, wait for it to finish
    if (this.isSASCategorySubjectRunning) {
      logger.warn(
        "SAS Category Subject process is already running, waiting for it to finish..."
      );

      // Wait for current process to finish (max wait time from config)
      let waitTime = 0;
      const maxWaitTime = this.config.sasCategorySubject.maxWaitTime;

      while (this.isSASCategorySubjectRunning && waitTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
        waitTime += 10000;
        logger.info(
          `Waiting for SAS Category Subject process to finish... (${Math.round(
            waitTime / 1000
          )}s)`
        );
      }

      if (this.isSASCategorySubjectRunning) {
        logger.error(
          `SAS Category Subject process is still running after ${Math.round(
            maxWaitTime / 1000
          )}s, skipping this scheduled run`
        );
        return;
      }

      logger.info(
        "Previous SAS Category Subject process finished, proceeding with new run"
      );
    }

    try {
      this.isSASCategorySubjectRunning = true;
      logger.info("Starting scheduled SAS Category Subject process");

      const sasService = new SASFetchCategorySubjectService();
      await sasService.init();

      // Set timeout for the SAS process
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("SAS Category Subject process timeout")),
          this.config.sasCategorySubject.timeout
        );
      });

      const sasPromise = sasService.runEtlProcess();

      await Promise.race([sasPromise, timeoutPromise]);

      logger.info(
        "Scheduled SAS Category Subject process completed successfully"
      );
    } catch (error) {
      logger.error("Scheduled SAS Category Subject process failed:", {
        message: error.message,
        stack: error.stack,
      });
    } finally {
      this.isSASCategorySubjectRunning = false;
    }
  }

  // Start the cron jobs
  start() {
    if (
      this.config.etlCoursePerformance.enabled &&
      this.etlCoursePerformanceTask
    ) {
      this.etlCoursePerformanceTask.start();
      logger.info("ETL Course Performance cron job started");
    }

    if (this.config.sasCategorySubject.enabled && this.sasCategorySubjectTask) {
      this.sasCategorySubjectTask.start();
      logger.info("SAS Category Subject cron job started");
    }

    logger.info("All enabled cron jobs started");
  }

  // Stop the cron jobs
  stop() {
    if (this.etlCoursePerformanceTask) {
      this.etlCoursePerformanceTask.stop();
      logger.info("ETL Course Performance cron job stopped");
    }

    if (this.sasCategorySubjectTask) {
      this.sasCategorySubjectTask.stop();
      logger.info("SAS Category Subject cron job stopped");
    }

    logger.info("All cron jobs stopped");
  }

  // Destroy cron jobs
  destroy() {
    if (this.etlCoursePerformanceTask) {
      this.etlCoursePerformanceTask.destroy();
      this.etlCoursePerformanceTask = null;
      logger.info("ETL Course Performance cron job destroyed");
    }

    if (this.sasCategorySubjectTask) {
      this.sasCategorySubjectTask.destroy();
      this.sasCategorySubjectTask = null;
      logger.info("SAS Category Subject cron job destroyed");
    }

    logger.info("All cron jobs destroyed");
  }

  // Manual trigger methods (single run)
  async runSPETLManual() {
    if (this.isSPETLRunning) {
      throw new Error("SP ETL is already running");
    }
    this.isSPETLRunning = true;
    this.spETLStartTime = new Date();
    try {
      await spETLService.runCronSpEtl();
    } finally {
      this.isSPETLRunning = false;
      this.spETLStartTime = null;
    }
  }

  async runTPETLManual() {
    if (this.isTPETLRunning) {
      throw new Error("TP ETL is already running");
    }
    this.isTPETLRunning = true;
    this.tpETLStartTime = new Date();
    try {
      await teacherPerformanceEtlService.runCron();
    } finally {
      this.isTPETLRunning = false;
      this.tpETLStartTime = null;
    }
  }

  async runUDLETLManual() {
    if (this.isUDLETLRunning) {
      throw new Error("UDL ETL is already running");
    }
    this.isUDLETLRunning = true;
    this.udlETLStartTime = new Date();
    try {
      await userDetectLoginService.runCron();
    } finally {
      this.isUDLETLRunning = false;
      this.udlETLStartTime = null;
    }
  }

  // Continuous running methods
  startSpEtlContinuous(interval = null, retryInterval = null) {
    if (this.isSPETLRunning) {
      return {
        success: false,
        message: "SP ETL is already running continuously",
      };
    }

    this.isSPETLRunning = true;
    this.spETLStartTime = new Date();

    // Use provided interval or fallback to config (convert seconds to milliseconds)
    this.spETLInterval = interval
      ? interval * 1000
      : this.config.continuousETL.spETL.interval;
    this.spETLRetryInterval = retryInterval
      ? retryInterval * 1000
      : this.config.continuousETL.spETL.retryInterval;

    // Start continuous loop
    this.spETLContinuousLoop();

    logger.info(
      `SP ETL continuous running started with interval: ${this.spETLInterval}ms, retry: ${this.spETLRetryInterval}ms`
    );
    return {
      success: true,
      message: "SP ETL started continuously",
      interval: Math.floor(this.spETLInterval / 1000), // Convert to seconds
      retry_interval: Math.floor(this.spETLRetryInterval / 1000), // Convert to seconds
    };
  }

  stopSpEtlContinuous() {
    if (!this.isSPETLRunning) {
      return { success: false, message: "SP ETL is not running" };
    }

    this.isSPETLRunning = false;
    this.spETLStartTime = null;

    // Clear interval if exists
    if (this.spETLContinuousInterval) {
      clearInterval(this.spETLContinuousInterval);
      this.spETLContinuousInterval = null;
    }

    logger.info("SP ETL continuous running stopped");
    return { success: true, message: "SP ETL stopped" };
  }

  async spETLContinuousLoop() {
    while (this.isSPETLRunning) {
      try {
        logger.info("Running SP ETL in continuous mode...");
        await spETLService.runCronSpEtl();

        // Wait interval before next run
        const interval =
          this.spETLInterval || this.config.continuousETL.spETL.interval;
        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error) {
        logger.error("Error in continuous SP ETL:", error);

        // Wait before retry
        const retryInterval =
          this.spETLRetryInterval ||
          this.config.continuousETL.spETL.retryInterval;
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }

  startTpEtlContinuous(interval = null, retryInterval = null) {
    if (this.isTPETLRunning) {
      return {
        success: false,
        message: "TP ETL is already running continuously",
      };
    }

    this.isTPETLRunning = true;
    this.tpETLStartTime = new Date();

    // Use provided interval or fallback to config (convert seconds to milliseconds)
    this.tpETLInterval = interval
      ? interval * 1000
      : this.config.continuousETL.tpETL.interval;
    this.tpETLRetryInterval = retryInterval
      ? retryInterval * 1000
      : this.config.continuousETL.tpETL.retryInterval;

    // Start continuous loop
    this.tpETLContinuousLoop();

    logger.info(
      `TP ETL continuous running started with interval: ${this.tpETLInterval}ms, retry: ${this.tpETLRetryInterval}ms`
    );
    return {
      success: true,
      message: "TP ETL started continuously",
      interval: Math.floor(this.tpETLInterval / 1000), // Convert to seconds
      retry_interval: Math.floor(this.tpETLRetryInterval / 1000), // Convert to seconds
    };
  }

  stopTpEtlContinuous() {
    if (!this.isTPETLRunning) {
      return { success: false, message: "TP ETL is not running" };
    }

    this.isTPETLRunning = false;
    this.tpETLStartTime = null;

    // Clear interval if exists
    if (this.tpETLContinuousInterval) {
      clearInterval(this.tpETLContinuousInterval);
      this.tpETLContinuousInterval = null;
    }

    logger.info("TP ETL continuous running stopped");
    return { success: true, message: "TP ETL stopped" };
  }

  async tpETLContinuousLoop() {
    while (this.isTPETLRunning) {
      try {
        logger.info("Running TP ETL in continuous mode...");
        await teacherPerformanceEtlService.runCron();

        // Wait interval before next run
        const interval =
          this.tpETLInterval || this.config.continuousETL.tpETL.interval;
        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error) {
        logger.error("Error in continuous TP ETL:", error);

        // Wait before retry
        const retryInterval =
          this.tpETLRetryInterval ||
          this.config.continuousETL.tpETL.retryInterval;
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }

  startUdlEtlContinuous(interval = null, retryInterval = null) {
    if (this.isUDLETLRunning) {
      return {
        success: false,
        message: "UDL ETL is already running continuously",
      };
    }

    this.isUDLETLRunning = true;
    this.udlETLStartTime = new Date();

    // Use provided interval or fallback to config (convert seconds to milliseconds)
    this.udlETLInterval = interval
      ? interval * 1000
      : this.config.continuousETL.udlETL.interval;
    this.udlETLRetryInterval = retryInterval
      ? retryInterval * 1000
      : this.config.continuousETL.udlETL.retryInterval;

    // Start continuous loop
    this.udlETLContinuousLoop();

    logger.info(
      `UDL ETL continuous running started with interval: ${this.udlETLInterval}ms, retry: ${this.udlETLRetryInterval}ms`
    );
    return {
      success: true,
      message: "UDL ETL started continuously",
      interval: Math.floor(this.udlETLInterval / 1000), // Convert to seconds
      retry_interval: Math.floor(this.udlETLRetryInterval / 1000), // Convert to seconds
    };
  }

  stopUdlEtlContinuous() {
    if (!this.isUDLETLRunning) {
      return { success: false, message: "UDL ETL is not running" };
    }

    this.isUDLETLRunning = false;
    this.udlETLStartTime = null;

    // Clear interval if exists
    if (this.udlETLContinuousInterval) {
      clearInterval(this.udlETLContinuousInterval);
      this.udlETLContinuousInterval = null;
    }

    logger.info("UDL ETL continuous running stopped");
    return { success: true, message: "UDL ETL stopped" };
  }

  async udlETLContinuousLoop() {
    while (this.isUDLETLRunning) {
      try {
        logger.info("Running UDL ETL in continuous mode...");
        await userDetectLoginService.runCron();

        // Wait interval before next run
        const interval =
          this.udlETLInterval || this.config.continuousETL.udlETL.interval;
        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error) {
        logger.error("Error in continuous UDL ETL:", error);

        // Wait before retry
        const retryInterval =
          this.udlETLRetryInterval ||
          this.config.continuousETL.udlETL.retryInterval;
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }

  // Get individual ETL status
  getSPETLStatus() {
    const duration = this.spETLStartTime
      ? Math.floor((new Date() - this.spETLStartTime) / 1000)
      : 0;

    return {
      is_running: this.isSPETLRunning,
      start_time: this.spETLStartTime,
      duration_seconds: duration,
      status: this.isSPETLRunning ? "running" : "stopped",
      interval: Math.floor(
        (this.spETLInterval || this.config.continuousETL.spETL.interval) / 1000
      ), // Convert to seconds
      retry_interval: Math.floor(
        (this.spETLRetryInterval ||
          this.config.continuousETL.spETL.retryInterval) / 1000
      ), // Convert to seconds
    };
  }

  getTPETLStatus() {
    const duration = this.tpETLStartTime
      ? Math.floor((new Date() - this.tpETLStartTime) / 1000)
      : 0;

    return {
      is_running: this.isTPETLRunning,
      start_time: this.tpETLStartTime,
      duration_seconds: duration,
      status: this.isTPETLRunning ? "running" : "stopped",
      interval: Math.floor(
        (this.tpETLInterval || this.config.continuousETL.tpETL.interval) / 1000
      ), // Convert to seconds
      retry_interval: Math.floor(
        (this.tpETLRetryInterval ||
          this.config.continuousETL.tpETL.retryInterval) / 1000
      ), // Convert to seconds
    };
  }

  getUDLETLStatus() {
    const duration = this.udlETLStartTime
      ? Math.floor((new Date() - this.udlETLStartTime) / 1000)
      : 0;

    return {
      is_running: this.isUDLETLRunning,
      start_time: this.udlETLStartTime,
      duration_seconds: duration,
      status: this.isUDLETLRunning ? "running" : "stopped",
      interval: Math.floor(
        (this.udlETLInterval || this.config.continuousETL.udlETL.interval) /
          1000
      ), // Convert to seconds
      retry_interval: Math.floor(
        (this.udlETLRetryInterval ||
          this.config.continuousETL.udlETL.retryInterval) / 1000
      ), // Convert to seconds
    };
  }

  // Get cron status for all services
  getStatus() {
    const shouldRunETL = etlCoursePerformanceService.shouldRunETL();
    const now = new Date();
    const currentMinute = now.getMinutes();
    const shouldRunSAS = currentMinute === 0;

    return {
      // Configuration
      config: {
        enabled: this.config.enabled,
        timezone: this.config.timezone,
        etlCoursePerformance: this.config.etlCoursePerformance,
        sasCategorySubject: this.config.sasCategorySubject,
        spETL: this.config.spETL,
        tpETL: this.config.tpETL,
        udlETL: this.config.udlETL,
      },

      // ETL Course Performance Status
      etlCoursePerformanceScheduled: !!this.etlCoursePerformanceTask,
      etlCoursePerformanceRunning: this.etlCoursePerformanceTask
        ? this.etlCoursePerformanceTask.getStatus()
        : "not scheduled",
      isETLCoursePerformanceCurrentlyRunning:
        this.isETLCoursePerformanceRunning,

      // SAS Category Subject Status
      sasCategorySubjectScheduled: !!this.sasCategorySubjectTask,
      sasCategorySubjectRunning: this.sasCategorySubjectTask
        ? this.sasCategorySubjectTask.getStatus()
        : "not scheduled",
      isSASCategorySubjectCurrentlyRunning: this.isSASCategorySubjectRunning,

      // SP ETL Status
      spETLScheduled: !!this.spETLTask,
      spETLRunning: this.spETLTask
        ? this.spETLTask.getStatus()
        : "not scheduled",
      isSPETLCurrentlyRunning: this.isSPETLRunning,

      // TP ETL Status
      tpETLScheduled: !!this.tpETLTask,
      tpETLRunning: this.tpETLTask
        ? this.tpETLTask.getStatus()
        : "not scheduled",
      isTPETLCurrentlyRunning: this.isTPETLRunning,

      // UDL ETL Status
      udlETLScheduled: !!this.udlETLTask,
      udlETLRunning: this.udlETLTask
        ? this.udlETLTask.getStatus()
        : "not scheduled",
      isUDLETLCurrentlyRunning: this.isUDLETLRunning,

      // General Status
      schedule: "0 * * * * (Every hour at minute 0)",
      shouldRunETL,
      shouldRunSAS,
      status:
        shouldRunETL || shouldRunSAS ? "active" : "paused (not minute 00)",
      currentMinute,
    };
  }
}

// Create singleton instance
const cronService = new CronService();

module.exports = cronService;
