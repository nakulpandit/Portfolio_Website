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
  float swirl = 0.5 + 0.5 * sin(radius * 18.0 - uTime * 1.35 + angle * 6.0);
  float core = smoothstep(0.64, 0.0, radius);
  float spiral = smoothstep(0.85, 0.18, radius) * (0.5 + 0.5 * armA);
  float dust = smoothstep(0.98, 0.32, radius) * (0.5 + 0.5 * armB);
  float halo = smoothstep(1.2, 0.48, radius);
  float pulse = 0.6 + 0.4 * sin(uTime * 1.4 - radius * 7.0);

  vec3 color = uColor * (0.24 + core * 1.45 + spiral * 1.02 + dust * 0.62);
  color += uColor * swirl * (0.18 + uHover * 0.15);
  color += vec3(1.0) * halo * (0.1 + uHover * 0.22);
  color += uColor * pulse * halo * 0.28;

  float alpha = core + spiral * 0.55 + dust * 0.38 + halo * 0.18;
  alpha *= 0.56 + uHover * 0.36;

  gl_FragColor = vec4(color, alpha);
}
