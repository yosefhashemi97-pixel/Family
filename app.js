const $ = id => document.getElementById(id);
let mode = "register";
function setMode(next) {
  mode = next;
  $("formTitle").textContent = mode === "register" ? "عضویت در Family" : "ورود به Family";
  $("registerTab").classList.toggle("active", mode === "register");
  $("loginTab").classList.toggle("active", mode === "login");
  $("usernameLabel").classList.toggle("hidden", mode === "login");
  $("emailLabel").classList.toggle("hidden", mode === "login");
  $("username").required = mode === "register";
  $("email").required = mode === "register";
  $("password").autocomplete = mode === "register" ? "new-password" : "current-password";
  $("submitBtn").textContent = mode === "register" ? "ساخت حساب" : "ورود";
  $("message").textContent = "";
}
$("registerTab").onclick = () => setMode("register");
$("loginTab").onclick = () => setMode("login");

$("authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const payload = mode === "register"
    ? { username: $("username").value, email: $("email").value, password: $("password").value }
    : { identity: $("identity")?.value || $("email").value || $("username").value, password: $("password").value };
  // In login mode the email field is reused for username or email.
  if (mode === "login") payload.identity = $("email").value || $("username").value;
  const endpoint = mode === "register" ? "/api/register" : "/api/login";
  const message = $("message");
  message.className = "message";
  message.textContent = "لطفاً صبر کنید...";
  try {
    const response = await fetch(endpoint, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "خطا در انجام درخواست");
    message.className = "message success";
    message.textContent = mode === "register" ? "حساب شما ساخته شد." : "با موفقیت وارد شدید.";
    $("logoutBtn").classList.remove("hidden");
    $("authForm").reset();
    loadMembers();
    setTimeout(() => { message.textContent = ""; }, 2500);
  } catch(err) { message.textContent = err.message; }
});

// Login uses one identity field; relabel the email input when switching modes.
const emailLabel = $("emailLabel");
const originalEmailLabel = emailLabel.firstChild.textContent;
const observer = new MutationObserver(() => {
  emailLabel.firstChild.textContent = mode === "login" ? "نام کاربری یا ایمیل" : originalEmailLabel;
  $("email").placeholder = mode === "login" ? "نام کاربری یا ایمیل" : "name@example.com";
  $("email").type = mode === "login" ? "text" : "email";
});
observer.observe($("loginTab"), { attributes:true, attributeFilter:["class"] });
$("logoutBtn").onclick = async () => {
  await fetch("/api/logout", { method:"POST" });
  $("logoutBtn").classList.add("hidden");
  $("message").textContent = "از حساب خارج شدید.";
};
async function loadMembers() {
  try {
    const r = await fetch("/api/members");
    const data = await r.json();
    $("memberCount").textContent = `${data.members.length.toLocaleString("fa-IR")} عضو`;
    $("membersList").innerHTML = "";
    if (!data.members.length) {
      $("membersList").innerHTML = '<div class="empty">هنوز عضوی ثبت‌نام نکرده است. اولین نفر باش!</div>';
      return;
    }
    data.members.forEach(member => {
      const card = document.createElement("div");
      card.className = "member";
      const avatar = document.createElement("div");
      avatar.className = "avatar";
      avatar.textContent = member.username.slice(0,1).toUpperCase();
      const info = document.createElement("div");
      const name = document.createElement("strong");
      name.textContent = member.username;
      const date = document.createElement("small");
      date.textContent = "عضو Family";
      info.append(name, date);
      card.append(avatar, info);
      $("membersList").append(card);
    });
  } catch { $("membersList").innerHTML = '<div class="empty">دریافت فهرست اعضا ممکن نشد.</div>'; }
}
async function checkSession() {
  const r = await fetch("/api/me");
  const data = await r.json();
  if (data.user) $("logoutBtn").classList.remove("hidden");
}
checkSession();
loadMembers();
