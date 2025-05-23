import { register, login } from "../../data/api";

export default class AuthPresenter {
  constructor(view) {
    this.view = view;
  }

  async register({ name, email, password }) {
    try {
      const response = await register({ name, email, password });
      if (!response.error) {
        this.view.onRegisterSuccess();
      } else {
        this.view.onRegisterError(response.message);
      }
    } catch (error) {
      this.view.onRegisterError(error.message);
    }
  }

  async login({ email, password }) {
    try {
      const response = await login({ email, password });
      if (!response.error) {
        this.view.onLoginSuccess(response.loginResult);
      } else {
        this.view.onLoginError(response.message);
      }
    } catch (error) {
      this.view.onLoginError(error.message);
    }
  }
}