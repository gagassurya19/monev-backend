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
    this.spETLTask = null;
    this.isSPETLRunning = false;
    this.tpETLTask = null;
    this.isTPETLRunning = false;
    this.udlETLTask = null;
    this.isUDLETLRunning = false;
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

      // SP ETL
      spETL: {
        enabled: process.env.SP_ETL_ENABLED === "true",
        schedule: process.env.SP_ETL_SCHEDULE || "0 * * * *",
        description: process.env.SP_ETL_DESCRIPTION || "Every hour at minute 0",
        timeout: parseInt(process.env.SP_ETL_TIMEOUT) || 1800000,
        maxWaitTime: parseInt(process.env.SP_ETL_MAX_WAIT_TIME) || 1800000,
      },

      // TP ETL
      tpETL: {
        enabled: process.env.TP_ETL_ENABLED === "true",
        schedule: process.env.TP_ETL_SCHEDULE || "0 * * * *",
        description: process.env.TP_ETL_DESCRIPTION || "Every hour at minute 0",
        timeout: parseInt(process.env.TP_ETL_TIMEOUT) || 1800000,
        maxWaitTime: parseInt(process.env.TP_ETL_MAX_WAIT_TIME) || 1800000,
      },

      // UDL ETL
      udlETL: {
        enabled: process.env.UDL_ETL_ENABLED === "true",
        schedule: process.env.UDL_ETL_SCHEDULE || "0 * * * *",
        description: process.env.UDL_ETL_DESCRIPTION || "Every minute",
        timeout: parseInt(process.env.UDL_ETL_TIMEOUT) || 1800000,
        maxWaitTime: parseInt(process.env.UDL_ETL_MAX_WAIT_TIME) || 1800000,
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

    // Schedule SP ETL if enabled
    if (this.config.spETL.enabled) {
      this.spETLTask = cron.schedule(
        this.config.spETL.schedule,
        async () => {
          await this.runSPETL();
        },
        {
          scheduled: true,
          timezone: this.config.timezone,
        }
      );
      logger.info(
        `SP ETL cron job scheduled: ${this.config.spETL.description}`
      );
    } else {
      logger.info("SP ETL cron job disabled via SP_ETL_ENABLED=false");
    }

    // Schedule TP ETL if enabled
    if (this.config.tpETL.enabled) {
      this.tpETLTask = cron.schedule(
        this.config.tpETL.schedule,
        async () => {
          await this.runTPETL();
        },
        {
          scheduled: true,
          timezone: this.config.timezone,
        }
      );
      logger.info(
        `TP ETL cron job scheduled: ${this.config.tpETL.description}`
      );
    } else {
      logger.info("TP ETL cron job disabled via TP_ETL_ENABLED=false");
    }

    // Schedule UDL ETL if enabled
    if (this.config.udlETL.enabled) {
      this.udlETLTask = cron.schedule(
        this.config.udlETL.schedule,
        async () => {
          await this.runUDLETL();
        },
        {
          scheduled: true,
          timezone: this.config.timezone,
        }
      );
      logger.info(
        `UDL ETL cron job scheduled: ${this.config.udlETL.description}`
      );
    } else {
      logger.info("UDL ETL cron job disabled via UDL_ETL_ENABLED=false");
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

  // Run SP ETL with proper waiting logic
  async runSPETL() {
    // SP ETL can run every minute
    let waitTime = 0;
    const maxWaitTime = this.config.spETL.maxWaitTime;

    if (this.isSPETLRunning) {
      logger.warn(
        "SP ETL process is already running, waiting for it to finish..."
      );
      while (this.isSPETLRunning && waitTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        waitTime += 10000;
        logger.info(
          `Waiting for SP ETL process to finish... (${Math.round(
            waitTime / 1000
          )}s)`
        );
      }

      if (this.isSPETLRunning) {
        logger.error(
          `SP ETL process is still running after ${Math.round(
            maxWaitTime / 1000
          )}s, skipping this scheduled run`
        );
        return;
      }

      logger.info("Previous SP ETL process finished, proceeding with new run");
    }

    try {
      this.isSPETLRunning = true;
      logger.info("Starting scheduled SP ETL process");

      // Set timeout for the SP process
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("SP ETL process timeout")),
          this.config.spETL.timeout
        );
      });

      const spETLPromise = spETLService.runCronSpEtl();

      await Promise.race([spETLPromise, timeoutPromise]);

      logger.info("Scheduled SP ETL process completed successfully");
    } catch (error) {
      logger.error("Scheduled SP ETL process failed:", {
        message: error.message,
        stack: error.stack,
      });
    } finally {
      this.isSPETLRunning = false;
    }
  }

  // Run TP ETL with proper waiting logic
  async runTPETL() {
    // TP ETL can run every minute
    let waitTime = 0;
    const maxWaitTime = this.config.tpETL.maxWaitTime;

    if (this.isTPETLRunning) {
      logger.warn(
        "TP ETL process is already running, waiting for it to finish..."
      );
      while (this.isTPETLRunning && waitTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        waitTime += 10000;
        logger.info(
          `Waiting for TP ETL process to finish... (${Math.round(
            waitTime / 1000
          )}s)`
        );
      }

      if (this.isTPETLRunning) {
        logger.error(
          `TP ETL process is still running after ${Math.round(
            maxWaitTime / 1000
          )}s, skipping this scheduled run`
        );
        return;
      }

      logger.info("Previous TP ETL process finished, proceeding with new run");
    }

    try {
      this.isTPETLRunning = true;
      logger.info("Starting scheduled TP ETL process");

      // Set timeout for the TP process
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("TP ETL process timeout")),
          this.config.tpETL.timeout
        );
      });

      const tpETLPromise = teacherPerformanceEtlService.runCron();

      await Promise.race([tpETLPromise, timeoutPromise]);

      logger.info("Scheduled TP ETL process completed successfully");
    } catch (error) {
      logger.error("Scheduled TP ETL process failed:", {
        message: error.message,
        stack: error.stack,
      });
    } finally {
      this.isTPETLRunning = false;
    }
  }

  // Run UDL ETL with proper waiting logic
  async runUDLETL() {
    // UDL ETL can run every minute
    let waitTime = 0;
    const maxWaitTime = this.config.udlETL.maxWaitTime;

    if (this.isUDLETLRunning) {
      logger.warn(
        "UDL ETL process is already running, waiting for it to finish..."
      );
      while (this.isUDLETLRunning && waitTime < maxWaitTime) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        waitTime += 10000;
        logger.info(
          `Waiting for UDL ETL process to finish... (${Math.round(
            waitTime / 1000
          )}s)`
        );
      }

      if (this.isUDLETLRunning) {
        logger.error(
          `UDL ETL process is still running after ${Math.round(
            maxWaitTime / 1000
          )}s, skipping this scheduled run`
        );
        return;
      }

      logger.info("Previous UDL ETL process finished, proceeding with new run");
    }

    try {
      this.isUDLETLRunning = true;
      logger.info("Starting scheduled UDL ETL process");

      // Set timeout for the UDL process
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("UDL ETL process timeout")),
          this.config.udlETL.timeout
        );
      });

      const udlETLPromise = userDetectLoginService.runCron();

      await Promise.race([udlETLPromise, timeoutPromise]);

      logger.info("Scheduled UDL ETL process completed successfully");
    } catch (error) {
      logger.error("Scheduled UDL ETL process failed:", {
        message: error.message,
        stack: error.stack,
      });
    } finally {
      this.isUDLETLRunning = false;
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

    if (this.config.spETL.enabled && this.spETLTask) {
      this.spETLTask.start();
      logger.info("SP ETL cron job started");
    }

    if (this.config.tpETL.enabled && this.tpETLTask) {
      this.tpETLTask.start();
      logger.info("TP ETL cron job started");
    }

    if (this.config.udlETL.enabled && this.udlETLTask) {
      this.udlETLTask.start();
      logger.info("UDL ETL cron job started");
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

    if (this.spETLTask) {
      this.spETLTask.stop();
      logger.info("SP ETL cron job stopped");
    }

    if (this.tpETLTask) {
      this.tpETLTask.stop();
      logger.info("TP ETL cron job stopped");
    }

    if (this.udlETLTask) {
      this.udlETLTask.stop();
      logger.info("UDL ETL cron job stopped");
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

    if (this.spETLTask) {
      this.spETLTask.destroy();
      this.spETLTask = null;
      logger.info("SP ETL cron job destroyed");
    }

    if (this.tpETLTask) {
      this.tpETLTask.destroy();
      this.tpETLTask = null;
      logger.info("TP ETL cron job destroyed");
    }

    if (this.udlETLTask) {
      this.udlETLTask.destroy();
      this.udlETLTask = null;
      logger.info("UDL ETL cron job destroyed");
    }

    logger.info("All cron jobs destroyed");
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
