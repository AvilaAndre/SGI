import * as THREE from "three";
import { MyContents } from "../MyContents.js";

/**
 * This class contains and manages information about an animation
 */
class Animation {
    /**
     *
     * @param {MyContents} contents the contents object
     */
    constructor(contents, data) {
        this.contents = contents;

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

            data.timestamps.forEach((timestamp) => {
                // If timestamps has a key that references this track
                if (Object.keys(timestamp.keys).includes(track.id)) {
                    timestamp.keys[track.id].transformations.forEach(
                        (trans) => {
                            switch (trans.type) {
                                case "R":
                                    rotationTimes.push(timestamp.value);
                                    rotation.push(trans.rotation);
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

                if (!this.contents.nodes[node]) break;

                const mixer = new THREE.AnimationMixer(
                    this.contents.nodes[node]
                );

                this.createClip(
                    mixer,
                    ".position",
                    translationTimes,
                    translation
                );
                this.createClip(mixer, ".rotation", rotationTimes, rotation);
                this.createClip(mixer, ".scale", scaleTimes, scale);
            }
        }

        this.timestamps = data.timestamps;
    }

    createClip(mixer, attribute, times, values) {
        if (times.length > 0) {
            let unpacked = [];
            values.forEach((transl) => {
                unpacked.push(...transl);
            });

            const valuesKF = new THREE.VectorKeyframeTrack(
                attribute,
                times,
                unpacked,
                THREE.InterpolateSmooth /* THREE.InterpolateLinear (default), THREE.InterpolateDiscrete,*/
            );

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
     * Play from the beginning
     */
    playStart() {
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];

            action.reset();
            action.play();
        }
    }

    /**
     * Plays
     */
    play() {
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];

            action.play();
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

            action.play();
        }
    }

    /**
     * Stops animation playing // TODO: test this
     */
    stop() {
        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];

            action.stop();
        }
    }

    update(delta) {
        for (let i = 0; i < this.mixers.length; i++) {
            const mixer = this.mixers[i];

            mixer.update(delta);
        }
    }
}

export { Animation };
