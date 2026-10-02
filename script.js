// Set this to your backend/form endpoint (Formspree, Google Apps Script, your own API...).
// Paste your Google Apps Script web app URL here (ends in /exec). Leave empty to skip sending.
const SUBMIT_URL = "https://script.google.com/macros/s/AKfycbwOlhq-19mpqtuW5APByYli1UXsZ2oUody5tKK9_yuoF1JWt1D9DPHJmgwRN-p0z2R0rQ/exec";

const form = document.getElementById("waitlist");
const errorEl = document.getElementById("error");
const viewForm = document.getElementById("view-form");
const viewDone = document.getElementById("view-done");

function show() {
  viewForm.classList.remove("active");
  viewDone.classList.add("active");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  form.querySelectorAll("input").forEach(i => i.removeAttribute("aria-invalid"));
  errorEl.textContent = "";

  const bad = [];
  if (!data.name.trim()) bad.push("name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) bad.push("email");
  if (data.phone.replace(/\D/g, "").length < 7) bad.push("phone");
  if (bad.length) {
    bad.forEach(n => form.elements[n].setAttribute("aria-invalid", "true"));
    errorEl.textContent = "Enter a valid " + bad.join(", ").replace(/, ([^,]*)$/, " and $1") + ".";
    form.elements[bad[0]].focus();
    return;
  }

  const btn = form.querySelector("button");
  btn.disabled = true;
  try {
    if (SUBMIT_URL) {
      // no-cors: the browser sends the data but hides Google's reply, which avoids CORS errors.
      // A failure here only happens on a real network problem; validation already ran above.
      await fetch(SUBMIT_URL, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams({ name: data.name.trim(), email: data.email.trim(), phone: data.phone.trim() })
      });
    }
    show();
  } catch (err) {
    console.error("Waitlist submit failed:", err);
    errorEl.textContent = "Could not join the waitlist. Check your connection and try again.";
    btn.disabled = false;
  }
});