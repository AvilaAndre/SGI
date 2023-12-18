uniform vec3 colorA; 
uniform vec3 colorB;


varying vec3 vUv; 
varying vec3 vColorA;
varying vec3 vColorB;

void main() {
      vUv = position;
	vColorA = colorA;
	vColorB = colorB;	
       
      vec4 modelViewPosition = modelViewMatrix * vec4(position, 1.0);
      gl_Position = projectionMatrix * modelViewPosition; 
}