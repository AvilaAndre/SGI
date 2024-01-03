/**
 * This class contains and manages information about the keyboard
 */
class KeyboardManager {
    /**
     * Holds the current state of the desired keyboard functionalities
     */
    constructor() {
        // has the keys as keys and if they are pressed as values
        this.keys = new Object();

        this.keysJustDown = [];
        this.keysJustUp = [];
    }

    /**
     * Sets the given key as being held down
     * @param {string} key
     */
    setKeyDown(key) {
        this.keys[key] = true;
        this.keysJustDown.push(key);
    }

    /**
     * Sets the given key as not being held down
     * @param {string} key
     */
    setKeyUp(key) {
        this.keys[key] = false;
        this.keysJustUp.push(key);
    }

    /**
     * Returns if the given key is held down or not
     * @param {string} key
     * @returns {boolean}
     */
    isKeyDown(key) {
        return this.keys[key] === true;
    }

    /**
     * Returns if the given key is was held down while not being previously down
     * @param {string} key
     * @returns {boolean}
     */
    isKeyJustDown(key) {
        return this.keysJustDown.includes(key);
    }

    /**
     * Returns if the given key is was not held down while being previously down
     * @param {string} key
     * @returns {boolean}
     */
    isKeyJustUp(key) {
        return this.keysJustUp.includes(key);
    }

    /**
     * Resets the keys just up and just down
     */
    update() {
        this.keysJustDown = [];
        this.keysJustUp = [];
    }
}

export { KeyboardManager };
