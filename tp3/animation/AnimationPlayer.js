import * as THREE from "three";
import { MyApp } from "../MyApp.js";

/**
 * This class contains and manages information about the animations
 */
class AnimationPlayer {
    /**
     *
     * @param {MyApp} app the application object
     */
    constructor(app) {
        this.app = app;
        this.animations = new Object();
    }

    addAnimation(animation) {
        this.animations[animation.id] = animation;
    }

    playStart(animId) {
        this.animations[animId]?.playStart();
    }

    play(animId) {
        this.animations[animId]?.play();
    }

    playForwards(animId) {
        this.animations[animId]?.playForwards();
    }

    playBackwards(animId) {
        this.animations[animId]?.playBackwards();
    }

    stop(animId) {
        this.animations[animId]?.stop();
    }

    update(delta) {
        for (const key in this.animations) {
            const animation = this.animations[key];
            animation.update(delta);
        }
    }
}

export { AnimationPlayer };