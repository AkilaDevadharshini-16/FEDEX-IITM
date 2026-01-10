if (!localStorage.getItem("cases")) {
  localStorage.setItem("cases", JSON.stringify([]));
}

export function getCases() {
  return JSON.parse(localStorage.getItem("cases"));
}

export function saveCases(cases) {
  localStorage.setItem("cases", JSON.stringify(cases));
}
