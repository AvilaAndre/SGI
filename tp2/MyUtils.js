import * as THREE from "three";

export function getMagFilterFromString(magFilter) {
    switch (magFilter) {
        case "NearestFilter":
            return THREE.NearestFilter;
        case "NearestMipmapNearestFilter":
            return THREE.NearestMipmapNearestFilter;
        case "NearestMipmapLinearFilter":
            return THREE.NearestMipmapLinearFilter;
        case "LinearFilter":
            return THREE.LinearFilter;
        case "LinearMipmapNearestFilter":
            return THREE.LinearMipmapNearestFilter;
        case "LinearMipmapLinearFilter":
            return THREE.LinearMipmapLinearFilter;
        default:
            return undefined;
    }
}

export function getMinFilterFromString(minFilter) {
    switch (minFilter) {
        case "NearestFilter":
            return THREE.NearestFilter;
        case "NearestMipmapNearestFilter":
            return THREE.NearestMipmapNearestFilter;
        case "NearestMipmapLinearFilter":
            return THREE.NearestMipmapLinearFilter;
        case "LinearFilter":
            return THREE.LinearFilter;
        case "LinearMipmapNearestFilter":
            return THREE.LinearMipmapNearestFilter;
        case "LinearMipmapLinearFilter":
            return THREE.LinearMipmapLinearFilter;
        default:
            return undefined;
    }
}
