varying vec2 vUv;

uniform sampler2D uSampler1;
uniform sampler2D uSampler2;
uniform float blendScale;

void main() {
	vec4 color1 = texture2D(uSampler1, vUv);
	vec4 color2 = texture2D(uSampler2, vec2(0.0,0.1)+vUv);
	gl_FragColor = mix(color1, color2, blendScale);
}