// src/scripts/pages/about/about-page.js
import NavigationHelper from "../../utils/navigation-helper";

class AboutPage {
  async render() {
    return `
      <section class="container about-page" id="main-content">
        <div class="about-header">
          <h1 class="about-title">About <span class="highlight">Wira</span></h1>
          <div class="title-underline"></div>
        </div>
        
        <div class="about-content">
          <div class="about-description">
            <p>Wira Story adalah platform berbagi cerita yang memungkinkan pengguna untuk membagikan momen dan pengalaman mereka melalui foto dan teks. Aplikasi ini dirancang untuk memberikan pengalaman yang menyenangkan dan intuitif bagi pengguna.</p>
          </div>
        </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    NavigationHelper.setupAuthenticatedNavigation();
  }
}

export default AboutPage;
