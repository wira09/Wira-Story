// src/scripts/utils/navigation-helper.js

/**
 * Kelas NavigationHelper untuk menangani logika navigasi
 * Memisahkan logika navigasi dari komponen view (pages) untuk struktur MVP yang lebih baik
 */
class NavigationHelper {
  static drawerToggleHandler = null;
  static documentClickHandler = null;

  /**
   * Mengatur tampilan navigasi untuk halaman yang memerlukan autentikasi
   */
  static setupAuthenticatedNavigation() {
    const token = localStorage.getItem("token");
    const navList = document.querySelector("#nav-list");
    const navDrawer = document.querySelector("#navigation-drawer");
    const drawerButton = document.querySelector("#drawer-button");

    // Jika tidak ada token, berarti user tidak login
    // Arahkan kembali ke halaman login
    if (!token) {
      window.location.hash = "/login";
      return;
    }

    // Tampilkan navigation drawer dan drawer button
    if (navDrawer) {
      navDrawer.style.display = "block";

      // Pastikan button drawer terlihat pada mobile view
      if (drawerButton) {
        // Untuk mobile view - selalu tampilkan tombol toggle
        if (window.innerWidth <= 1000) {
          drawerButton.style.display = "inline-block";

          // Pastikan event listener untuk tombol toggle bekerja
          this._setupDrawerToggle(drawerButton, navDrawer);
        }
        // Untuk desktop view - sembunyikan tombol toggle
        else {
          drawerButton.style.display = "none";
        }
      }
    }

    // Hanya update jika navList ada
    if (!navList) return;

    navList.innerHTML = "";

    // Menambahkan menu navigasi untuk user yang sudah login
    navList.innerHTML = `
      <li>
        <a href="#/" aria-label="Beranda">Beranda</a>
      </li>
      <li>
        <a href="#/add-story" aria-label="Tambah Story">Tambah Story</a>
      </li>
      <li>
        <a href="#/bookmark" aria-label="Simpan Cerita">Simpan Cerita</a>
      </li>
      <li>
        <a href="#/about" aria-label="Tentang Aplikasi">Tentang Aplikasi</a>
      </li>
      <li>
        <a href="#" id="logout-button" aria-label="Logout">Logout</a>
      </li>
    `;

    // Menambahkan event listener untuk tombol logout
    const logoutButton = document.querySelector("#logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        window.location.hash = "/login";
      });
    }

    // Tambahkan event listener untuk penutupan menu saat klik item menu (untuk mobile)
    this._setupMenuItemClick(navList, navDrawer);

    // Tambahkan event untuk resize window agar responsive
    this._setupResizeHandler(navDrawer, drawerButton);
  }

  /**
   * Mengatur tampilan navigasi untuk halaman yang tidak memerlukan autentikasi (login/register)
   */
  static setupUnauthenticatedNavigation() {
    // Hide the navigation drawer entirely for login/register pages
    const navDrawer = document.querySelector("#navigation-drawer");
    if (navDrawer) {
      navDrawer.style.display = "none";
    }

    // Hide the drawer button too
    const drawerButton = document.querySelector("#drawer-button");
    if (drawerButton) {
      drawerButton.style.display = "none";
    }

    // Hapus event listeners
    this._removeEventListeners();
  }

  /**
   * Setup event listener untuk toggle drawer
   * @private
   */
  static _setupDrawerToggle(drawerButton, navDrawer) {
    // Hapus event listener lama jika ada
    this._removeEventListeners();

    // Tambahkan event listener baru untuk toggle drawer
    this.drawerToggleHandler = () => {
      navDrawer.classList.toggle("open");
    };

    drawerButton.addEventListener("click", this.drawerToggleHandler);

    // Klik di luar untuk menutup drawer
    this.documentClickHandler = (event) => {
      // Pastikan kita tidak menutup drawer saat mengklik konten drawer atau tombol drawer itu sendiri
      if (
        navDrawer.classList.contains("open") &&
        !navDrawer.contains(event.target) &&
        !drawerButton.contains(event.target)
      ) {
        navDrawer.classList.remove("open");
      }
    };

    document.addEventListener("click", this.documentClickHandler);
  }

  /**
   * Setup event listener untuk menu item click
   * @private
   */
  static _setupMenuItemClick(navList, navDrawer) {
    if (!navList || !navDrawer) return;

    navList.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth <= 1000) {
          navDrawer.classList.remove("open");
        }
      });
    });
  }

  /**
   * Setup resize handler untuk responsivitas
   * @private
   */
  static _setupResizeHandler(navDrawer, drawerButton) {
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 1000) {
        if (drawerButton) drawerButton.style.display = "inline-block";
      } else {
        if (drawerButton) drawerButton.style.display = "none";
        if (navDrawer) navDrawer.classList.remove("open"); // Close drawer in desktop view
      }
    });
  }

  /**
   * Hapus event listeners untuk mencegah memory leaks
   * @private
   */
  static _removeEventListeners() {
    const drawerButton = document.querySelector("#drawer-button");

    if (drawerButton && this.drawerToggleHandler) {
      drawerButton.removeEventListener("click", this.drawerToggleHandler);
    }

    if (this.documentClickHandler) {
      document.removeEventListener("click", this.documentClickHandler);
    }
  }
}

export default NavigationHelper;
