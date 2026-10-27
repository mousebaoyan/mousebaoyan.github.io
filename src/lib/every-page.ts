// 站内跳转由 ClientRouter 替换页面内容，打包的脚本只在第一次出现时运行。
// 页面里的初始化放进 setup：当前页面运行一次，之后每次换页后再运行一次。
// 挂在 window、document 上的监听器要传入 signal，离开页面时自动移除。
export function onEveryPage(setup: (signal: AbortSignal) => void) {
  let controller = new AbortController();
  setup(controller.signal);
  document.addEventListener("astro:after-swap", () => {
    controller.abort();
    controller = new AbortController();
    setup(controller.signal);
  });
}
