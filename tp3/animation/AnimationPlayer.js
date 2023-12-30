import * as THREE from "three";
import { MyApp } from "../MyApp.js";
import { MyAnimation } from "./MyAnimation.js";

/**
 * This class contains and manages information about the animations
 */
class AnimationPlayer {
    /**
     * Creates an animation player that stores every animation.
     * @param {MyApp} app the application object
     */
    constructor(app) {
        this.app = app;
        this.animations = new Object();
    }

    /**
     * Adds an animation to the list.
     * @param {MyAnimation} animation
     */
    addAnimation(animation) {
        this.animations[animation.id] = animation;
    }

    /**
     * Plays the animations from the start.
     * @param {string} animId
     */
    playFromStart(animId) {
        this.animations[animId]?.reset();
        this.animations[animId]?.play();
    }

    /**
     * Plays the animation.
     * @param {string} animId
     */
    play(animId) {
        this.animations[animId]?.play();
    }

    /**
     * Pauses the animation.
     * @param {string} animId
     */
    pause(animId) {
        this.animations[animId]?.pause();
    }

    /**
     * Plays the animation forwards.
     * @param {string} animId
     */
    playForwards(animId) {
        this.animations[animId]?.playForwards();
    }

    /**
     * Plays the animation backwards.
     * @param {string} animId
     */
    playBackwards(animId) {
        this.animations[animId]?.playBackwards();
    }

    /**
     * Stops the animation and reset's its progress.
     * @param {string} animId
     */
    stop(animId) {
        this.animations[animId]?.stop();
    }

    /**
     * Sets the animation's time scale
     * @param {string} animId
     * @param {number} timeScale
     */
    setTimeScale(animId, timeScale) {
        this.animations[animId]?.setTimeScale(timeScale);
    }

    /**
     * Updates the animations.
     * @param {float} delta
     */
    update(delta) {
        for (const key in this.animations) {
            const animation = this.animations[key];
            animation.update(delta);
        }
    }
}

export { AnimationPlayer };
