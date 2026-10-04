// ===== INISIALISASI UMUM DAN PEMILIHAN HALAMAN =====
const sittaData = window.SITTA_DATA;

document.addEventListener("DOMContentLoaded", async function () {
    // --- langkah 1 - mulai - pastikan data contoh tersedia
    if (!sittaData) {
        return;
    }
    // --- langkah 1 - selesai - pastikan data contoh tersedia

    const page = document.body.dataset.page;

    // --- langkah 2 - mulai - muat dialog login sebelum memasang kontrolnya
    if (page === "login") {
        await loadComponent("login-modals-placeholder", "component/login-modals.html");
        initializeModalControls();
        initializeLoginPage();
        return;
    }
    // --- langkah 2 - selesai - muat dialog login sebelum memasang kontrolnya

    // --- langkah 3 - mulai - pastikan pengguna sudah masuk sebelum menampilkan halaman internal
    const currentUser = requireSignedInUser();

    if (!currentUser) {
        return;
    }
    // --- langkah 3 - selesai - pastikan pengguna sudah masuk sebelum menampilkan halaman internal

    // --- langkah 4 - mulai - muat navigasi bersama sebelum memasang kontrolnya
    await loadNavigationBar(page);
    initializeSharedPage(currentUser);
    initializeNavigationMenus();
    // --- langkah 4 - selesai - muat navigasi bersama sebelum memasang kontrolnya

    // --- langkah 5 - mulai - siapkan fitur untuk halaman yang sedang dibuka
    if (page === "dashboard") {
        initializeDashboardPage(currentUser);
    } else if (page === "tracking") {
        initializeTrackingPage();
    } else if (page === "stok") {
        initializeStockPage();
    }
    // --- langkah 5 - selesai - siapkan fitur untuk halaman yang sedang dibuka
});

// ===== LOGIN: VALIDASI AKUN DAN MEMBUKA DASHBOARD =====
function initializeLoginPage() {
    const form = document.getElementById("login-form");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // --- langkah 1 - mulai - cari akun contoh yang sesuai
        const email = document.getElementById("login-email").value.trim().toLowerCase();
        const password = document.getElementById("login-password").value;
        const user = sittaData.pengguna.find(function (person) {
            return person.email.toLowerCase() === email && person.password === password;
        });
        // --- langkah 1 - selesai - cari akun contoh yang sesuai

        // --- langkah 2 - mulai - tampilkan pesan jika data login tidak sesuai
        if (!user) {
            window.alert("email/password yang anda masukkan salah");
            return;
        }
        // --- langkah 2 - selesai - tampilkan pesan jika data login tidak sesuai

        // --- langkah 3 - mulai - simpan sesi contoh dan buka dashboard
        sessionStorage.setItem("sittaUserId", String(user.id));
        window.location.assign("dashboard.html");
        // --- langkah 3 - selesai - simpan sesi contoh dan buka dashboard
    });
}

// ===== LOGIN: MODAL LUPA PASSWORD DAN DAFTAR =====
function initializeModalControls() {
    const openButtons = document.querySelectorAll("[data-open-modal]");
    const closeButtons = document.querySelectorAll("[data-close-modal]");
    const modals = document.querySelectorAll(".modal");

    if (modals.length === 0) {
        return;
    }

    // --- langkah 1 - mulai - buka modal melalui tombol login yang sesuai
    openButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            const modal = document.getElementById(button.dataset.openModal);

            if (!modal) {
                return;
            }

            modal.dataset.openedBy = button.id;
            modal.hidden = false;
            modal.querySelector("[data-close-modal]").focus();
        });
    });
    // --- langkah 1 - selesai - buka modal melalui tombol login yang sesuai

    // --- langkah 2 - mulai - tutup modal dan kembalikan fokus ke tombol pemicunya
    closeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            closeModal(button.closest(".modal"));
        });
    });
    // --- langkah 2 - selesai - tutup modal dan kembalikan fokus ke tombol pemicunya

    // --- langkah 3 - mulai - tutup modal saat area latar diklik atau tombol Escape ditekan
    modals.forEach(function (modal) {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") {
            return;
        }

        modals.forEach(function (modal) {
            if (!modal.hidden) {
                closeModal(modal);
            }
        });
    });
    // --- langkah 3 - selesai - tutup modal saat area latar diklik atau tombol Escape ditekan
}

function closeModal(modal) {
    if (!modal) {
        return;
    }

    modal.hidden = true;

    const trigger = document.getElementById(modal.dataset.openedBy);

    if (trigger) {
        trigger.focus();
    }
}

// ===== HALAMAN SETELAH LOGIN: SESI DAN IDENTITAS PENGGUNA =====
function requireSignedInUser() {
    // --- langkah 1 - mulai - cari pengguna yang tersimpan dalam sesi tab ini
    const userId = sessionStorage.getItem("sittaUserId");
    const user = sittaData.pengguna.find(function (person) {
        return String(person.id) === userId;
    });
    // --- langkah 1 - selesai - cari pengguna yang tersimpan dalam sesi tab ini

    // --- langkah 2 - mulai - kembali ke halaman login jika sesi tidak ditemukan
    if (!user) {
        sessionStorage.removeItem("sittaUserId");
        window.location.replace("index.html");
        return null;
    }
    // --- langkah 2 - selesai - kembali ke halaman login jika sesi tidak ditemukan

    return user;
}

function initializeSharedPage(user) {
    // --- langkah 1 - mulai - tampilkan pengguna yang sedang masuk
    const nameElement = document.getElementById("header-user-name");

    if (nameElement) {
        nameElement.textContent = user.nama;
    }
    // --- langkah 1 - selesai - tampilkan pengguna yang sedang masuk

    // --- langkah 2 - mulai - hapus sesi contoh saat pengguna keluar
    document.querySelectorAll("[data-logout]").forEach(function (button) {
        button.addEventListener("click", function () {
            sessionStorage.removeItem("sittaUserId");
            window.location.assign("index.html");
        });
    });
    // --- langkah 2 - selesai - hapus sesi contoh saat pengguna keluar
}

// ===== KOMPONEN HTML: MEMUAT FRAGMEN KE PLACEHOLDER =====
async function loadComponent(placeholderId, componentPath) {
    const placeholder = document.getElementById(placeholderId);

    if (!placeholder) {
        return false;
    }

    try {
        // --- langkah 1 - mulai - ambil file komponen dan sisipkan markup-nya
        const response = await fetch(componentPath);

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        placeholder.innerHTML = await response.text();
        // --- langkah 1 - selesai - ambil file komponen dan sisipkan markup-nya

        return true;
    } catch (error) {
        console.error("Komponen tidak dapat dimuat: " + componentPath, error);
        return false;
    }
}

// ===== NAVBAR: MENANDAI HALAMAN AKTIF =====
async function loadNavigationBar(page) {
    // --- langkah 1 - mulai - muat komponen navigasi bersama
    const loaded = await loadComponent("navbar-placeholder", "component/navbar.html");

    if (!loaded) {
        return;
    }
    // --- langkah 1 - selesai - muat komponen navigasi bersama

    // --- langkah 2 - mulai - tandai halaman yang sedang dibuka pada navigasi bersama
    const placeholder = document.getElementById("navbar-placeholder");
    const activeLink = Array.from(placeholder.querySelectorAll("[data-page-link]")).find(function (link) {
        return link.dataset.pageLink === page;
    });

    if (activeLink) {
        activeLink.classList.add("is-active");
        activeLink.setAttribute("aria-current", "page");
    }
    // --- langkah 2 - selesai - tandai halaman yang sedang dibuka pada navigasi bersama
}

// ===== NAVBAR: DROPDOWN LAPORAN DAN MENU NAVIGASI =====
function initializeNavigationMenus() {
    const dropdowns = document.querySelectorAll(".nav-dropdown");
    const menuActions = document.querySelectorAll("[data-menu-message]");

    if (dropdowns.length === 0) {
        return;
    }

    // --- langkah 1 - mulai - buka atau tutup submenu Laporan
    dropdowns.forEach(function (dropdown) {
        const toggle = dropdown.querySelector("[data-nav-toggle]");
        const menu = dropdown.querySelector(".nav-dropdown-menu");

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            const shouldOpen = toggle.getAttribute("aria-expanded") !== "true";

            closeNavigationDropdowns(dropdowns);
            toggle.setAttribute("aria-expanded", String(shouldOpen));
            menu.hidden = !shouldOpen;
        });
    });
    // --- langkah 1 - selesai - buka atau tutup submenu Laporan

    // --- langkah 2 - mulai - tutup submenu saat fokus berpindah keluar atau tombol Escape ditekan
    document.addEventListener("click", function (event) {
        if (!event.target.closest(".nav-dropdown")) {
            closeNavigationDropdowns(dropdowns);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") {
            return;
        }

        const openDropdown = Array.from(dropdowns).find(function (dropdown) {
            const toggle = dropdown.querySelector("[data-nav-toggle]");
            return toggle && toggle.getAttribute("aria-expanded") === "true";
        });

        if (!openDropdown) {
            return;
        }

        closeNavigationDropdowns(dropdowns);
        openDropdown.querySelector("[data-nav-toggle]").focus();
    });
    // --- langkah 2 - selesai - tutup submenu saat fokus berpindah keluar atau tombol Escape ditekan

    // --- langkah 3 - mulai - jelaskan item menu yang belum memiliki halaman tujuan
    menuActions.forEach(function (button) {
        button.addEventListener("click", function () {
            closeNavigationDropdowns(dropdowns);
            window.alert(button.dataset.menuMessage + " belum memiliki halaman khusus pada tugas ini.");
        });
    });
    // --- langkah 3 - selesai - jelaskan item menu yang belum memiliki halaman tujuan
}

function closeNavigationDropdowns(dropdowns) {
    dropdowns.forEach(function (dropdown) {
        const toggle = dropdown.querySelector("[data-nav-toggle]");
        const menu = dropdown.querySelector(".nav-dropdown-menu");

        if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
        }

        if (menu) {
            menu.hidden = true;
        }
    });
}

// ===== DASHBOARD: GREETING DAN RINGKASAN DATA =====
function initializeDashboardPage(user) {
    // --- langkah 1 - mulai - tentukan sapaan berdasarkan waktu lokal
    const hour = new Date().getHours();
    let greeting = "Selamat malam";

    if (hour >= 5 && hour < 11) {
        greeting = "Selamat pagi";
    } else if (hour >= 11 && hour < 15) {
        greeting = "Selamat siang";
    } else if (hour >= 15 && hour < 18) {
        greeting = "Selamat sore";
    }
    // --- langkah 1 - selesai - tentukan sapaan berdasarkan waktu lokal

    // --- langkah 2 - mulai - tampilkan nama pengguna, tanggal, dan data contoh yang tersedia
    document.getElementById("greeting-title").textContent = greeting + ", " + user.nama;
    document.getElementById("today-date").textContent = new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date());

    document.getElementById("stock-count").textContent = String(sittaData.bahanAjar.length);
    document.getElementById("tracking-count").textContent = String(Object.keys(sittaData.tracking).length);
    // --- langkah 2 - selesai - tampilkan nama pengguna, tanggal, dan data contoh yang tersedia
}

// ===== TRACKING PENGIRIMAN: PENCARIAN DAN HASIL DO =====
function initializeTrackingPage() {
    const form = document.getElementById("tracking-form");
    const feedback = document.getElementById("tracking-feedback");
    const result = document.getElementById("tracking-result");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // --- langkah 1 - mulai - cari nomor DO yang dimasukkan
        const nomorDO = document.getElementById("tracking-number").value.trim();
        const order = sittaData.tracking[nomorDO];
        // --- langkah 1 - selesai - cari nomor DO yang dimasukkan

        // --- langkah 2 - mulai - tampilkan pesan kesalahan atau hasil pengiriman yang sesuai
        if (!order) {
            result.hidden = true;
            feedback.textContent = "Nomor DO tidak ditemukan. Periksa kembali nomor yang dimasukkan.";
            feedback.hidden = false;
            return;
        }

        feedback.hidden = true;
        renderTrackingResult(order);
        result.hidden = false;
        // --- langkah 2 - selesai - tampilkan pesan kesalahan atau hasil pengiriman yang sesuai
    });
}

function renderTrackingResult(order) {
    // --- langkah 1 - mulai - tampilkan identitas dan status DO
    document.getElementById("result-number").textContent = order.nomorDO;
    document.getElementById("result-name").textContent = order.nama;
    document.getElementById("result-status").textContent = order.status;
    // --- langkah 1 - selesai - tampilkan identitas dan status DO

    // --- langkah 2 - mulai - hitung dan jelaskan progres pengiriman
    // Pada data tugas, status "Dikirim" digunakan sebagai tanda pengiriman selesai.
    const isDelivered = order.status === "Dikirim";
    const progress = isDelivered ? 100 : 60;
    const progressTrack = document.getElementById("progress-track");

    document.getElementById("progress-label").textContent = isDelivered
        ? "Paket sudah selesai dikirim"
        : "Paket sedang dalam perjalanan";
    document.getElementById("progress-bar").style.width = progress + "%";
    progressTrack.setAttribute("aria-valuenow", String(progress));
    // --- langkah 2 - selesai - hitung dan jelaskan progres pengiriman

    // --- langkah 3 - mulai - tampilkan detail pengiriman dan riwayat perjalanannya
    renderTrackingDetails(order);
    renderTrackingEvents(order.perjalanan);
    // --- langkah 3 - selesai - tampilkan detail pengiriman dan riwayat perjalanannya
}

function renderTrackingDetails(order) {
    const details = [
        ["Ekspedisi", order.ekspedisi],
        ["Tanggal kirim", order.tanggalKirim],
        ["Kode paket / lokasi", order.paket],
        ["Total pembayaran", order.total]
    ];
    const list = document.getElementById("tracking-details");

    list.replaceChildren();

    details.forEach(function (detail) {
        const term = document.createElement("dt");
        const value = document.createElement("dd");

        term.textContent = detail[0];
        value.textContent = detail[1];
        list.append(term, value);
    });
}

function renderTrackingEvents(events) {
    const list = document.getElementById("tracking-events");

    list.replaceChildren();

    // Satu waktu pada data contoh tidak berurutan; urutkan salinan array untuk tampilan.
    const orderedEvents = events.slice().sort(function (firstEvent, secondEvent) {
        return firstEvent.waktu.localeCompare(secondEvent.waktu);
    });

    orderedEvents.forEach(function (event) {
        const item = document.createElement("li");
        const time = document.createElement("time");
        const description = document.createElement("p");

        time.dateTime = event.waktu.replace(" ", "T");
        time.textContent = event.waktu;
        description.textContent = event.keterangan;
        item.append(time, description);
        list.append(item);
    });
}

// ===== STOK BAHAN AJAR: TAMBAH BARIS DAN TABEL =====
function initializeStockPage() {
    const form = document.getElementById("stock-form");
    const feedback = document.getElementById("stock-feedback");

    // --- langkah 1 - mulai - tampilkan baris stok yang tersedia
    renderStockTable();
    // --- langkah 1 - selesai - tampilkan baris stok yang tersedia

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        // --- langkah 2 - mulai - validasi baris stok baru
        const formData = new FormData(form);
        const newItem = {
            kodeLokasi: formData.get("kodeLokasi").trim(),
            kodeBarang: formData.get("kodeBarang").trim(),
            namaBarang: formData.get("namaBarang").trim(),
            jenisBarang: formData.get("jenisBarang"),
            edisi: formData.get("edisi").trim(),
            stok: Number(formData.get("stok")),
            cover: ""
        };
        const duplicateCode = sittaData.bahanAjar.some(function (item) {
            return item.kodeBarang.toLowerCase() === newItem.kodeBarang.toLowerCase();
        });

        if (duplicateCode) {
            feedback.textContent = "Kode barang tersebut sudah ada di dalam tabel.";
            feedback.classList.add("feedback-error");
            feedback.hidden = false;
            return;
        }
        // --- langkah 2 - selesai - validasi baris stok baru

        // --- langkah 3 - mulai - perbarui tabel dan konfirmasi penambahan
        sittaData.bahanAjar.push(newItem);
        renderStockTable();
        form.reset();
        feedback.textContent = "Baris stok berhasil ditambahkan.";
        feedback.classList.remove("feedback-error");
        feedback.hidden = false;
        // --- langkah 3 - selesai - perbarui tabel dan konfirmasi penambahan
    });
}

function renderStockTable() {
    const tableBody = document.getElementById("stock-table-body");

    // --- langkah 1 - mulai - bangun ulang baris stok berdasarkan data saat ini
    tableBody.replaceChildren();

    sittaData.bahanAjar.forEach(function (item) {
        const row = document.createElement("tr");
        const coverCell = document.createElement("td");

        if (item.cover) {
            const image = document.createElement("img");
            image.className = "book-cover";
            image.src = item.cover;
            image.alt = "Sampul " + item.namaBarang;
            image.loading = "lazy";
            coverCell.append(image);
        } else {
            coverCell.textContent = "—";
        }

        row.append(coverCell);
        row.append(createTableCell(item.kodeBarang, "code-cell"));
        row.append(createTableCell(item.namaBarang, "book-name-cell"));
        row.append(createTableCell(item.kodeLokasi));
        row.append(createTableCell(item.jenisBarang + " / " + item.edisi));
        row.append(createTableCell(String(item.stok), "stock-value"));
        tableBody.append(row);
    });
    // --- langkah 1 - selesai - bangun ulang baris stok berdasarkan data saat ini

    // --- langkah 2 - mulai - selaraskan jumlah stok yang ditampilkan
    const count = document.getElementById("stock-count");

    if (count) {
        count.textContent = String(sittaData.bahanAjar.length);
    }
    // --- langkah 2 - selesai - selaraskan jumlah stok yang ditampilkan
}

function createTableCell(value, className) {
    const cell = document.createElement("td");
    cell.textContent = value;

    if (className) {
        cell.className = className;
    }

    return cell;
}
// ===== STOK BAHAN AJAR: TAMBAH BARIS DAN TABEL =====
