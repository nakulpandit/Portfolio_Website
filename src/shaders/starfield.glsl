uniform float uTime;
varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float starLayer(vec2 uv, float scale, float threshold, float speed) {
  vec2 grid = floor(uv * scale);
  vec2 cell = fract(uv * scale) - 0.5;
  float sparkle = 0.35 + 0.65 * sin(uTime * speed + hash(grid) * 24.0);
  float mask = step(threshold, hash(grid));
  float star = smoothstep(0.1, 0.0, length(cell));
  return star * sparkle * mask;
}

void main() {
  vec2 uv = vUv;
  vec2 drifted = uv + vec2(uTime * 0.002, -uTime * 0.0015);

  float farStars = starLayer(drifted * 1.4, 34.0, 0.986, 0.5);
  float midStars = starLayer(drifted * 2.6, 48.0, 0.991, 0.85);
  float nearStars = starLayer(drifted * 4.0, 68.0, 0.995, 1.2);

  vec2 centered = uv - 0.5;
  float nebulaA = exp(-length((centered + vec2(0.12, -0.04)) * vec2(1.1, 0.75)) * 4.0);
  float nebulaB = exp(-length((centered - vec2(0.18, 0.12)) * vec2(0.8, 1.2)) * 5.0);
  float glow = exp(-length(centered * vec2(1.0, 0.7)) * 3.4);

  vec3 base = vec3(0.015, 0.025, 0.06);
  vec3 haze = vec3(0.05, 0.09, 0.16) * (1.0 - uv.y) * 0.8;
  vec3 nebula = vec3(0.08, 0.16, 0.22) * nebulaA + vec3(0.16, 0.08, 0.18) * nebulaB;
  vec3 stars = vec3(0.64, 0.86, 1.0) * farStars * 2.0 + vec3(0.85, 0.94, 1.0) * midStars * 2.6 + vec3(1.0, 0.95, 0.82) * nearStars * 3.2;

  gl_FragColor = vec4(base + haze + nebula * 0.45 + glow * vec3(0.05, 0.08, 0.12) + stars, 1.0);
}
