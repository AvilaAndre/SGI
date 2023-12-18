varying vec4 vCoords;
varying vec4 vNormal;

void main() {
	if (vCoords.x > 0.0)
		gl_FragColor =  vNormal;
	else
	{
		gl_FragColor.rgb = abs(vCoords.xyz)/3.0;
		gl_FragColor.a = 1.0;
	}
}