// Keep personal links and portfolio content in one place.
export const portfolio = {
  github: "https://github.com/DeathsSong",
  linkedin: "https://www.linkedin.com/in/michelleloudenclos",
  email: "michelle.sherrie@yahoo.com",
  resume: `${import.meta.env.BASE_URL}resume.pdf`,
  skills: [
    "React",
    "JavaScript",
    "TypeScript",
    "HTML & CSS",
    "REST APIs",
    "Git & GitHub",
  ],
};
export const projects = [
  {
    name: "Anaconda",
    kind: "BROWSER GAME",
    description:
      "A fresh take on a familiar classic. Guide your snake, chase the next bite, and see how far you can grow—with keyboard or on-screen controls.",
    tech: ["JavaScript", "HTML", "CSS"],
    live: "https://deathssong.github.io/Anaconda/",
    source: "https://github.com/DeathsSong/Anaconda",
  },
  {
    name: "Trivia Trove",
    kind: "INTERACTIVE WEB APP",
    description:
      "Pick your category. Find your difficulty. Put your curiosity to the test with a quiz experience powered by the Open Trivia Database.",
    tech: ["React", "REST API", "CSS"],
    live: "https://deathssong.github.io/trivia-trove/",
    source: "https://github.com/DeathsSong/trivia-trove",
  },
];
