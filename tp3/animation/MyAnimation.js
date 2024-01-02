import * as THREE from "three";
import { MyContents } from "../MyContents.js";

/**
 * This class contains and manages information about an animation
 */
class MyAnimation {
    /**
     *
     * @param {MyContents} contents the contents object
     */
    constructor(contents) {
        this.contents = contents;
    }

    fromNodeData(data) {
        // INFORMATION
        this.id = data.id;
        this.duration = data.duration;
        this.repeat = data.repeat;
        this.autostart = data.autostart;

        this.tracks = data.tracks;
        this.tracks = new Object();

        this.mixers = [];

        this.actions = [];

        for (let i = 0; i < data.tracks.length; i++) {
            const track = data.tracks[i];

            const translationTimes = [];
            const translation = [];
            const rotationTimes = [];
            const rotation = [];
            const scaleTimes = [];
            const scale = [];

            let interpolation = THREE.InterpolateLinear;

            switch (track.interpolation) {
                case "smooth":
                    interpolation = THREE.InterpolateSmooth;
                    break;
                case "discrete":
                    interpolation = THREE.InterpolateDiscrete;
                    break;

                case "linear":
                    interpolation = THREE.InterpolateLinear;
                    break;
            }

            data.timestamps.forEach((timestamp) => {
                // If timestamps has a key that references this track
                if (Object.keys(timestamp.keys).includes(track.id)) {
                    timestamp.keys[track.id].transformations.forEach(
                        (trans) => {
                            switch (trans.type) {
                                case "R":
                                    const eul = new THREE.Euler(
                                        ...trans.rotation
                                    );

                                    const quat =
                                        new THREE.Quaternion().setFromEuler(
                                            eul
                                        );

                                    rotationTimes.push(timestamp.value);
                                    rotation.push(quat);
                                    break;

                                case "T":
                                    translationTimes.push(timestamp.value);
                                    translation.push(trans.translate);
                                    break;
                                case "S":
                                    scaleTimes.push(timestamp.value);
                                    scale.push(trans.scale);
                                    break;
                                default:
                                    console.error(
                                        "failed to append",
                                        trans,
                                        "to an My track"
                                    );
                                    break;
                            }
                        }
                    );
                }
            });

            for (let i = 0; i < track.nodes.length; i++) {
                const node = track.nodes[i];

                if (!this.contents.nodes[node]) break;

                const mixer = new THREE.AnimationMixer(
                    this.contents.nodes[node]
                );

                this.createClip(
                    mixer,
                    ".position",
                    translationTimes,
                    translation,
                    interpolation
                );
                this.createClip(
                    mixer,
                    ".quaternion",
                    rotationTimes,
                    rotation,
                    interpolation
                );
                this.createClip(
                    mixer,
                    ".scale",
                    scaleTimes,
                    scale,
                    interpolation
                );
            }
        }

        this.timestamps = data.timestamps;

        return this;
    }

    /**
     * Creates an animation for a car
     * @param {Object} data
     * @returns
     */
    fromObject(data) {
        // INFORMATION
        this.id = data.id;

        // duration is multiplied by the difficulty
        this.duration =
            data.duration * (1 + 0.1 * (2 - this.contents.manager.difficulty));
        this.repeat = data.repeat;
        this.autostart = data.autostart;

        this.tracks = data.tracks;
        this.tracks = new Object();

        this.mixers = [];

        this.actions = [];

        for (let i = 0; i < data.tracks.length; i++) {
            const track = data.tracks[i];

            const translationTimes = [];
            const translation = [];
            const rotationTimes = [];
            const rotation = [];
            const scaleTimes = [];
            const scale = [];

            let interpolation = THREE.InterpolateLinear;

            switch (track.interpolation) {
                case "smooth":
                    interpolation = THREE.InterpolateSmooth;
                    break;
                case "discrete":
                    interpolation = THREE.InterpolateDiscrete;
                    break;

                case "linear":
                    interpolation = THREE.InterpolateLinear;
                    break;
            }

            data.timestamps.forEach((timestamp) => {
                // If timestamps has a key that references this track
                if (Object.keys(timestamp.keys).includes(track.id)) {
                    timestamp.keys[track.id].transformations.forEach(
                        (trans) => {
                            switch (trans.type) {
                                case "R":
                                    const eul = new THREE.Euler(
                                        ...trans.rotation
                                    );

                                    const quat =
                                        new THREE.Quaternion().setFromEuler(
                                            eul
                                        );

                                    // time is multiplied by the difficulty
                                    // prettier-ignore
                                    rotationTimes.push(timestamp.value * (1 + 0.1 * (2 - this.contents.manager.difficulty)) );
                                    rotation.push(quat);
                                    break;

                                case "T":
                                    // time is multiplied by the difficulty
                                    // prettier-ignore
                                    translationTimes.push(timestamp.value * (1 + 0.1 * (2 - this.contents.manager.difficulty)) );
                                    translation.push(trans.translate);
                                    break;
                                case "S":
                                    // time is multiplied by the difficulty
                                    // prettier-ignore
                                    scaleTimes.push(timestamp.value * (1 + 0.1 * (2 - this.contents.manager.difficulty)) );
                                    scale.push(trans.scale);
                                    break;
                                default:
                                    console.error(
                                        "failed to append",
                                        trans,
                                        "to an animation track"
                                    );
                                    break;
                            }
                        }
                    );
                }
            });

            for (let i = 0; i < track.nodes.length; i++) {
                const node = track.nodes[i];

                const mixer = new THREE.AnimationMixer(node);

                this.createClip(
                    mixer,
                    ".position",
                    translationTimes,
                    translation,
                    THREE.InterpolateLinear
                );
                this.createClip(
                    mixer,
                    ".quaternion",
                    rotationTimes,
                    rotation,
                    THREE.InterpolateLinear
                );
                this.createClip(
                    mixer,
                    ".scale",
                    scaleTimes,
                    scale,
                    THREE.InterpolateLinear
                );
            }
        }

        this.timestamps = data.timestamps;

        return this;
    }

    createClip(mixer, attribute, times, values, interpolation) {
        if (times.length > 0) {
            let unpacked = [];
            values.forEach((transl) => {
                unpacked.push(...transl);
            });

            let valuesKF;

            if (attribute == ".quaternion") {
                valuesKF = new THREE.QuaternionKeyframeTrack(
                    attribute,
                    times,
                    unpacked,
                    interpolation /* THREE.InterpolateLinear (default), THREE.InterpolateDiscrete,*/
                );
            } else {
                valuesKF = new THREE.VectorKeyframeTrack(
                    attribute,
                    times,
                    unpacked,
                    interpolation /* THREE.InterpolateLinear (default), THREE.InterpolateDiscrete,*/
                );
            }

            const animationAction = mixer.clipAction(
                new THREE.AnimationClip(
                    attribute + "Animation",
                    this.duration,
                    [valuesKF]
                )
            );

            if (this.repeat) {
                animationAction.setLoop(THREE.LoopRepeat);
            } else {
                animationAction.setLoop(THREE.LoopOnce);
            }

            if (this.autostart) {
                animationAction.play();
            }

            this.actions.push(animationAction);
            this.mixers.push(mixer);
        }
    }

    /**
     * Resets the animation
     */
    reset() {
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];
            action.reset();
        }
    }

    /**
     * Plays
     */
    play() {
        for (let i = 0; i < this.mixers.length; i++) {
            const mixer = this.mixers[i];

            mixer.timeScale = 1;
        }
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];

            action.play();
        }
    }

    /**
     * Pauses the execution of the animation.
     */
    pause() {
        for (let i = 0; i < this.mixers.length; i++) {
            const mixer = this.mixers[i];

            mixer.timeScale = 0;
        }
    }

    /**
     * Plays forwards
     */
    playForwards() {
        for (let i = 0; i < this.mixers.length; i++) {
            const mixer = this.mixers[i];

            mixer.timeScale = 1;
        }

        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];
            action.reset();
            action.play();
        }
    }

    /**
     * Plays Backwards
     */
    playBackwards() {
        for (let i = 0; i < this.mixers.length; i++) {
            const mixer = this.mixers[i];

            mixer.timeScale = -1;
        }

        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];
            action.reset();
            action.play();
        }
    }

    /**
     * Stops animation playing
     */
    stop() {
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];

            action.stop();
        }
    }

    setTimeScale(timeScale) {
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];

            action.setEffectiveTimeScale(timeScale);
        }
    }

    /**
     * Calls "func" whenever the animation finishes a loop
     * @param {Function} func
     */
    bindOnFinish(func) {
        console.log("bind");
        if (this.mixers.length > 0) {
            this.mixers[0].addEventListener("loop", (e) => {
                // a mixer has multiple actions, so this is only called when the action is about the position
                if (e.action._clip.name == ".positionAnimation") func();
            });
        }
    }

    update(delta) {
        for (let i = 0; i < this.mixers.length; i++) {
            const mixer = this.mixers[i];

            mixer.update(delta);
        }
    }
}

export { MyAnimation };
