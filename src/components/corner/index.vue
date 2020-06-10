<template>
  <a href="https://github.com/PanJiaChen/vue-element-admin" target="_blank" class="github-corner" aria-label="View source on Github">
    <svg
      width="80"
      height="80"
      viewBox="15 100 250 250"
      style="fill:#40c9c6; color:#fff;"
      aria-hidden="true"
    >
      <path d="M0,0 L115,115 L115,115 L142,142 L250,250 L250,0 Z" />
    </svg>
  </a>
</template>

<style scoped>
.corner:hover .octo-arm {
  animation: octocat-wave 560ms ease-in-out
}

@keyframes octocat-wave {
  0%,
  100% {
    transform: rotate(0)
  }
  20%,
  60% {
    transform: rotate(-25deg)
  }
  40%,
  80% {
    transform: rotate(10deg)
  }
}

@media (max-width:500px) {
  .github-corner:hover .octo-arm {
    animation: none
  }
  .github-corner .octo-arm {
    animation: octocat-wave 560ms ease-in-out
  }
}
</style>
