import AuthPresenter from "./auth-presenter";
import NavigationHelper from "../../utils/navigation-helper";

export default class RegisterPage {
  constructor() {
    this.presenter = new AuthPresenter(this);
  }

  async render() {
    return `
      <section class="auth-container" id="main-content">
        <div class="auth-card">
          <h1>Register</h1>
          <form id="register-form">
            <div class="form-group">
              <label for="name">Nama</label>
              <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" name="email" required>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="password" minlength="8" required>
            </div>
            <div class="form-actions">
              <button type="submit">Register</button>
              <span>Sudah punya akun? <a href="#/login">Login</a></span>
            </div>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    NavigationHelper.setupUnauthenticatedNavigation();

    const form = document.querySelector("#register-form");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = form.name.value;
      const email = form.email.value;
      const password = form.password.value;
      await this.presenter.register({ name, email, password });
    });
  }

  onRegisterSuccess() {
    alert("Registrasi berhasil! Silakan login.");
    window.location.hash = "/login";
  }

  onRegisterError(message) {
    alert(message);
  }
}
