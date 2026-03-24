uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 456.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);

  float tunnel = smoothstep(1.2, 0.0, radius);
  float streaks = pow(abs(sin(angle * 42.0 + uTime * 10.0)), 7.0);
  float rings = 0.5 + 0.5 * sin(radius * 28.0 - uTime * 11.0);
  float sparks = step(0.93, hash(floor(vec2(angle * 12.0, radius * 26.0))));
  float core = exp(-radius * 5.0);
  float edgeGlow = smoothstep(0.9, 0.35, radius);

  vec3 cyan = vec3(0.35, 0.72, 1.0);
  vec3 warm = vec3(1.0, 0.93, 0.82);
  vec3 color = mix(cyan, warm, core * 0.85 + rings * 0.1);
  float alpha = (streaks * tunnel * 0.8 + core * 1.2 + sparks * edgeGlow * 0.25) * uIntensity;

  gl_FragColor = vec4(color, alpha * 0.72);
}
