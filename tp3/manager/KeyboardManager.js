/**
 * This class contains and manages information about the keyboard
 */
class KeyboardManager {
    constructor() {
        // has the keys as keys and if they are pressed as values
        this.keys = new Object();
    }

    setKeyDown(key) {
        this.keys[key] = true;
    }

    setKeyUp(key) {
        this.keys[key] = false;
    }

    isKeyDown(key) {
        return this.keys[key] === true;
    }
}

export { KeyboardManager };
