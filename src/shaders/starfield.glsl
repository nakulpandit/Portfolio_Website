uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

void main() {
  vec2 uv = vUv * 4.0;
  vec2 grid = floor(uv * 42.0);
  vec2 cell = fract(uv * 42.0) - 0.5;

  float star = smoothstep(0.09, 0.0, length(cell));
  float sparkle = 0.35 + 0.65 * sin(uTime * 0.6 + hash(grid) * 18.0);
  float mask = step(0.985, hash(grid));

  vec3 base = vec3(0.02, 0.04, 0.09);
  vec3 haze = vec3(0.06, 0.12, 0.19) * (1.0 - vUv.y) * 0.7;
  vec3 stars = vec3(0.6, 0.85, 1.0) * star * sparkle * mask * 3.5;

  vec2 centered = vUv - 0.5;
  float nebula = exp(-length(centered * vec2(1.2, 0.8)) * 4.0);
  vec3 cloud = mix(vec3(0.04, 0.03, 0.11), vec3(0.14, 0.08, 0.18), nebula);

  gl_FragColor = vec4(base + haze + cloud * 0.35 + stars, 1.0);
}
