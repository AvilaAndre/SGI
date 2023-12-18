varying vec4 vNormal;
varying vec4 vCoords;

uniform float normScale;
uniform float normalizationFactor;
uniform float displacement;

void main() {
      vec4 vertex = vec4(position + normal * normalizationFactor * (displacement + normScale), 1.0);
      vCoords = vertex / 2.0;
      vNormal = vec4(normal, 1.0);
      gl_Position = projectionMatrix * modelViewMatrix * vertex; 
}
