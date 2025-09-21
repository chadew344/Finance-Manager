document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
    }
  });
}, observerOptions);

document.querySelectorAll(".fade-in").forEach((el) => {
  observer.observe(el);
});

window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.style.background = "rgba(10, 10, 15, 0.95)";
  } else {
    navbar.style.background = "rgba(10, 10, 15, 0.9)";
  }
});

function animateCounter(element, target) {
  let current = 0;
  const increment = target / 100;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }

    if (element.textContent.includes("K")) {
      element.textContent = Math.floor(current / 1000) + "K+";
    } else if (element.textContent.includes("B")) {
      element.textContent = "$" + (current / 1000000000).toFixed(1) + "B";
    } else if (element.textContent.includes("%")) {
      element.textContent = Math.floor(current) + "%";
    } else {
      element.textContent = element.textContent.replace(
        /\d+/,
        Math.floor(current)
      );
    }
  }, 20);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const statNumbers = entry.target.querySelectorAll(".stat-number");
        statNumbers.forEach((stat) => {
          const text = stat.textContent;
          if (text.includes("50K+")) {
            animateCounter(stat, 50000);
          } else if (text.includes("$2.5B")) {
            animateCounter(stat, 2500000000);
          } else if (text.includes("98%")) {
            animateCounter(stat, 98);
          }
        });
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const statsSection = document.querySelector(".stats");
if (statsSection) {
  statsObserver.observe(statsSection);
}
