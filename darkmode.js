function checkMode() {
    const mode = getCookie("mode");
    if (mode == "dark") {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
      document.getElementById('mode-toggle').textContent = "☀";
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
      document.getElementById('mode-toggle').textContent = "☾";
    }
  }
  
  document.getElementById('mode-toggle').addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    const mode = document.body.classList.contains('dark-mode') ? "dark" : "light";
    setCookie("mode", mode, 30);
    this.textContent = mode === "dark" ? "☀" : "☾";
  });
  