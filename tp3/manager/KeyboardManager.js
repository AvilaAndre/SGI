/**
 * This class contains and manages information about the keyboard
 */
class KeyboardManager {
    constructor() {
        // has the keys as keys and if they are pressed as values
        this.keys = new Object();

        this.keysJustDown = [];
        this.keysJustUp = [];
    }

    setKeyDown(key) {
        this.keys[key] = true;
        this.keysJustDown.push(key);
    }

    setKeyUp(key) {
        this.keys[key] = false;
        this.keysJustUp.push(key);
    }

    isKeyDown(key) {
        return this.keys[key] === true;
    }

    isKeyJustDown(key) {
        return this.keysJustDown.includes(key);
    }

    isKeyJustUp(key) {
        return this.keysJustUp.includes(key);
    }

    update() {
        this.keysJustDown = [];
        this.keysJustUp = [];
    }
}

export { KeyboardManager };
