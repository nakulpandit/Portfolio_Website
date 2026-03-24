uniform float uTime;
uniform float uIntensity;
varying vec2 vUv;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float radius = length(uv);
  float angle = atan(uv.y, uv.x);

  float streaks = abs(sin(angle * 28.0 + uTime * 8.0)) * (1.0 - radius);
  float burst = exp(-radius * 3.5);
  float pulse = 0.5 + 0.5 * sin(uTime * 10.0);

  vec3 color = mix(vec3(0.2, 0.45, 0.9), vec3(0.95, 0.95, 1.0), burst);
  float alpha = (streaks * 0.5 + burst * (0.7 + pulse * 0.3)) * uIntensity;

  gl_FragColor = vec4(color, alpha * 0.75);
}
