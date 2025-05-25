import AuthPresenter from "./auth-presenter";
import NavigationHelper from "../../utils/navigation-helper";

export default class LoginPage {
  constructor() {
    this.presenter = new AuthPresenter(this);
  }

  async render() {
    return `
      <section class="auth-container" id="main-content">
        <div class="auth-card">
          <h1>Login</h1>
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" required>
            </div>
            <div class="form-actions">
              <button type="submit">Login</button>
              <span>Belum punya akun? <a href="#/register">Daftar</a></span>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    NavigationHelper.setupUnauthenticatedNavigation();

    const form = document.querySelector("#login-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const email = form.email.value;
      const password = form.password.value;
      await this.presenter.login({ email, password });
    });
  }

  onLoginSuccess(loginResult) {
    localStorage.setItem("token", loginResult.token);
    localStorage.setItem("userName", loginResult.name);
    window.location.hash = "/";
  }

  onLoginError(message) {
    alert(message);
  }
}
