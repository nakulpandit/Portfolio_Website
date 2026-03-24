uniform float uTime;
uniform vec3 uColor;
uniform float uHover;
varying vec2 vUv;

void main() {
  vec2 centered = (vUv - 0.5) * 2.0;
  float radius = length(centered);
  float angle = atan(centered.y, centered.x);

  float spiral = sin(angle * 5.0 - radius * 10.0 + uTime * 0.8);
  float core = smoothstep(0.65, 0.0, radius);
  float rim = smoothstep(0.95, 0.5, radius);
  float dust = smoothstep(0.35, 1.0, 0.5 + 0.5 * spiral) * rim;
  float alpha = clamp(core + dust * 0.55, 0.0, 1.0);

  vec3 glow = uColor * (0.6 + uHover * 0.6);
  vec3 color = mix(glow * 0.3, glow * 1.4, core + dust * 0.75);

  gl_FragColor = vec4(color, alpha * (0.55 + uHover * 0.25));
}
