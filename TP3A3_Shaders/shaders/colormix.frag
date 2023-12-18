varying vec3 vUv; 
varying vec3 vColorA; 
varying vec3 vColorB;

void main() {
    gl_FragColor = vec4(mix(vColorA, vColorB, vUv.z), 1.0);
}