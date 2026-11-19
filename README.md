const $ = (id) => document.getElementById(id);

const registerForm = $("registerForm");
const loginForm = $("loginForm");
const membersList = $("membersList");

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "خطایی رخ داد");
  return data;
}

function showMessage(message) {
  alert(message);
}

registerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await api("/api/register", {
      method: "POST",
      body: JSON.stringify({
        username: $("regName").value.trim(),
        email: $("regEmail").value.trim(),
        password: $("regPassword").value
      })
    });

    showMessage("ثبت‌نام انجام شد. حالا وارد حساب شو.");
    registerForm.reset();
  } catch (error) {
    showMessage(error.message);
  }
});

loginForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await api("/api/login", {
      method: "POST",
      body: JSON.stringify({
        identity: $("loginEmail").value.trim(),
        password: $("loginPassword").value
      })
    });

    showMessage("با موفقیت وارد شدی.");
    loginForm.reset();
    loadMembers();
  } catch (error) {
    showMessage(error.message);
  }
});

async function loadMembers() {
  if (!membersList) return;

  try {
    const data = await api("/api/members");
    membersList.replaceChildren();

    data.members.forEach((member) => {
      const item = document.createElement("li");
      item.textContent = member.username;
      membersList.appendChild(item);
    });
  } catch {
    membersList.textContent = "برای دیدن اعضا ابتدا وارد حساب شو.";
  }
}

loadMembers();
