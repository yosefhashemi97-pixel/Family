@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Vazirmatn, sans-serif;
  background: #0b1220;
  color: #fff;
}

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 7%;
  background: #111c30;
  border-bottom: 1px solid #26344d;
  flex-wrap: wrap;
  gap: 15px;
}

.brand {
  font-size: 28px;
  font-weight: 800;
  color: #9eafff;
  text-decoration: none;
}

nav {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

nav a {
  color: #cbd5e1;
  text-decoration: none;
  font-size: 13px;
}

nav a:hover {
  color: #9eafff;
}

main {
  max-width: 950px;
  margin: auto;
  padding: 25px;
}

.hero {
  text-align: center;
  padding: 85px 15px;
}

.eyebrow {
  color: #9eafff;
  font-size: 14px;
}

.hero h1 {
  font-size: clamp(30px, 6vw, 52px);
  margin: 20px 0;
}

.hero h1 span {
  color: #9eafff;
}

.hero p {
  color: #aab8d0;
}

.panel {
  background: #162238;
  border: 1px solid #293954;
  border-radius: 18px;
  padding: 25px;
  margin: 25px 0;
}

.panel h2 {
  font-size: 21px;
  margin-top: 0;
}

input {
  display: block;
  width: 100%;
  padding: 14px;
  margin: 12px 0;
  background: #0b1528;
  border: 1px solid #354563;
  border-radius: 10px;
  color: white;
  font-family: inherit;
  outline: none;
}

input:focus {
  border-color: #9eafff;
}

button {
  background: #879cff;
  color: #101827;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  font-family: inherit;
  font-weight: 700;
  cursor: pointer;
}

button:hover {
  background: #aab8ff;
}

.auth-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.auth-tabs button {
  flex: 1;
}

#authMessage {
  color: #aab8ff;
}

#membersList,
#messagesList,
#eventsList {
  color: #cbd5e1;
  line-height: 2.2;
}

footer {
  text-align: center;
  padding: 30px;
  color: #8998b2;
  border-top: 1px solid #293954;
}

[hidden] {
  display: none !important;
}

@media (max-width: 600px) {
  .topbar {
    justify-content: center;
  }

  nav {
    justify-content: center;
  }

  .hero {
    padding: 55px 10px;
  }

  main {
    padding: 15px;
  }

  .panel {
    padding: 18px;
  }
}
