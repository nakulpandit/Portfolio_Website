uniform float uTime;
uniform vec3 uColor;
uniform float uHover;
varying vec2 vUv;

void main() {
  vec2 centered = (vUv - 0.5) * 2.0;
  float radius = length(centered);
  float angle = atan(centered.y, centered.x);

  float armA = sin(angle * 4.0 - radius * 12.0 + uTime * 0.9);
  float armB = sin(angle * 7.0 + radius * 9.0 - uTime * 0.7);
  float core = smoothstep(0.64, 0.0, radius);
  float spiral = smoothstep(0.85, 0.18, radius) * (0.5 + 0.5 * armA);
  float dust = smoothstep(0.98, 0.32, radius) * (0.5 + 0.5 * armB);
  float halo = smoothstep(1.2, 0.48, radius);
  float pulse = 0.6 + 0.4 * sin(uTime * 1.4 - radius * 7.0);

  vec3 color = uColor * (0.22 + core * 1.4 + spiral * 0.95 + dust * 0.55);
  color += vec3(1.0) * halo * (0.08 + uHover * 0.16);
  color += uColor * pulse * halo * 0.22;

  float alpha = core + spiral * 0.55 + dust * 0.38 + halo * 0.18;
  alpha *= 0.48 + uHover * 0.34;

  gl_FragColor = vec4(color, alpha);
}
