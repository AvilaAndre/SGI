/**
 *  This class contains an alternative version of a clock. This version supports pausing the clock
 */
class MyClock {
    #startTime = 0;
    #oldTime = 0;
    #elapsedTime = 0;
    #timePaused = 0;
    #running = false;

    constructor() {
        this.start();
    }

    /**
     * Starts the clock's execution.
     */
    start() {
        this.#startTime = performance.now();
        this.#timePaused = 0;
        this.#updateElapsedTime();
        this.#running = true;
    }

    /**
     * Stops the execution of the clock.
     */
    stop() {
        if (!this.#running) return;
        this.#updateElapsedTime();
        this.#running = false;
    }

    /**
     * Resumes the execution of a stopped clock.
     * Does nothing if the clock is running.
     */
    resume() {
        // if running, does not update the paused time
        if (this.#running) return;

        // calculate how much time between the moment it was stopped and now
        const timeNow = performance.now();
        this.#timePaused += timeNow - this.#oldTime;
        this.#updateElapsedTime();
        this.#running = true;
    }

    /**
     * Gets the time elapsed while the clock was running.
     * @returns {float} time elapsed in milliseconds.
     */
    getElapsedTime() {
        // updates the elapsed time if the clock is running
        if (this.#running) this.#updateElapsedTime();

        return this.#elapsedTime;
    }

    /**
     * @returns {boolean} if clock is running or not
     */
    isRunning() {
        return this.#running;
    }

    /**
     * Called when updating oldTime,
     * updates elapsedTime too
     */
    #updateElapsedTime() {
        this.#oldTime = performance.now();
        this.#elapsedTime = this.#oldTime - this.#startTime - this.#timePaused;
    }
}
export { MyClock };
