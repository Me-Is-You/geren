export default function initScrollReveal(targetElements, defaultProps) {
  if (!targetElements.length) return;

  if (typeof ScrollReveal === "undefined") {
    document
      .querySelectorAll(".load-hidden")
      .forEach((element) => element.classList.remove("load-hidden"));
    return;
  }

  ScrollReveal({ reset: false });

  targetElements.forEach(({ element, animation }) => {
    ScrollReveal().reveal(element, Object.assign({}, defaultProps, animation));
  });
}
