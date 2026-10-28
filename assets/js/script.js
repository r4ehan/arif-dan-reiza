AOS.init();

// 1. Musik & Cover
var music = document.querySelector(".music");
var isPlaying = false;

function mulai() {
  window.scrollTo(0, 0);

  // Putar musik
  music.play();
  isPlaying = true;

  // Animasi cover menghilang
  var cover = document.getElementById("cover-section");
  cover.classList.add("open");

  // Aktifkan scroll body
  $("body").removeClass("overflow-hidden");
  $("body").addClass("transition");

  // Hapus cover dari DOM setelah animasi selesai agar tidak menghalangi klik
  setTimeout(() => {
    cover.style.display = "none";
  }, 1200);
}

function toggleMusic(event) {
  event.preventDefault();
  const musicButton = document.getElementById("music-button");

  if (isPlaying) {
    musicButton.innerHTML = '<i class="fas fa-fw fa-pause"></i>';
    musicButton.classList.remove("rotate");
    music.pause();
  } else {
    musicButton.innerHTML = '<i class="fas fa-fw fa-compact-disc"></i>';
    musicButton.classList.add("rotate");
    music.play();
  }
  isPlaying = !isPlaying;
}

// 2. Countdown Wedding
var countdownDate = new Date("Nov 30, 2026 08:00:00").getTime();
var x = setInterval(function () {
  var now = new Date().getTime();
  var distance = countdownDate - now;

  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);

  var countdownElement = document.getElementById("countdown-wedding");
  if (countdownElement && distance > 0) {
    countdownElement.innerHTML = `
      <div class="col-lg-1 col-3"><div class="text-center p-2 rounded text-light"><h5>${days}</h5><small>Hari</small></div></div>
      <div class="col-lg-1 col-3"><div class="text-center p-2 rounded text-light"><h5>${hours}</h5><small>Jam</small></div></div>
      <div class="col-lg-1 col-3"><div class="text-center p-2 rounded text-light"><h5>${minutes}</h5><small>Menit</small></div></div>
      <div class="col-lg-1 col-3"><div class="text-center p-2 rounded text-light"><h5>${seconds}</h5><small>Detik</small></div></div>
    `;
  } else if (countdownElement) {
    clearInterval(x);
    countdownElement.innerHTML =
      "<span class='text-center p-3 rounded text-light m-2'><h2>Sudah dimulai!</h2></span>";
  }
}, 1000);

// 3. Nama Sambutan Tamu (URL Parameter)
const urlParams = new URLSearchParams(window.location.search);
const namaSambutan = document.querySelector("#nama-sambutan");
const namaSambutanCover = document.querySelector("#nama-sambutan-cover");

function setNamaTamu(nama) {
  if (namaSambutan) namaSambutan.innerText = nama;
  if (namaSambutanCover) namaSambutanCover.innerText = nama;
}

if (urlParams.get("to")) {
  setNamaTamu(urlParams.get("to"));
} else {
  const gabungan = (
    (urlParams.get("p") || "") +
    " " +
    (urlParams.get("n") || "")
  ).trim();
  setNamaTamu(gabungan || "Tamu Undangan");
}

// 4. Copy Text (Rekening)
function copyText(el) {
  var content = jQuery(el)
    .siblings("div.card-container")
    .find("div.card-number")
    .text()
    .trim()
    .replace(/\s+/g, "");
  navigator.clipboard.writeText(content).then(() => {
    var originalText = jQuery(el).html();
    jQuery(el).text("Berhasil di copy");
    setTimeout(() => {
      jQuery(el).html(originalText);
    }, 1500);
  });
}

// 5. RSVP & Ucapan (Disimpan ke LocalStorage untuk Admin)
window.addEventListener("load", function () {
  const form = document.getElementById("rsvp-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const nama = document.getElementById("nama").value.trim();
      const jumlah = document.getElementById("jumlah").value;
      const status = document.getElementById("status").value;
      const pesan = document.getElementById("ucapan-pesan").value.trim();

      if (nama === "" || status === "0") {
        Swal.fire({
          icon: "error",
          text: "Nama dan Status harus diisi!",
          timer: 2000,
        });
        return;
      }

      // Simpan ke LocalStorage (Bisa dibaca oleh admin.html)
      const KEY_RSVp = "undangan_rsvp";
      const KEY_UCAPAN = "undangan_ucapan";

      let daftarRsvp = JSON.parse(localStorage.getItem(KEY_RSVp) || "[]");
      let daftarUcapan = JSON.parse(localStorage.getItem(KEY_UCAPAN) || "[]");

      const dataBaru = {
        id: Date.now(),
        nama: nama,
        jumlah: parseInt(jumlah),
        status: status,
        pesan: pesan,
        tanggal: new Date().toLocaleString("id-ID"),
      };

      daftarRsvp.push(dataBaru);
      localStorage.setItem(KEY_RSVp, JSON.stringify(daftarRsvp));

      if (pesan !== "") {
        daftarUcapan.push(dataBaru);
        localStorage.setItem(KEY_UCAPAN, JSON.stringify(daftarUcapan));
      }

      Swal.fire({
        icon: "success",
        text: "Konfirmasi & Ucapan berhasil terkirim!",
        timer: 2500,
      });
      form.reset();
      currentPage = 1;
      loadUcapan();
    });
  }
  loadUcapan();
});

// 6. Logika Pagination Ucapan
const KEY_UCAPAN = "undangan_ucapan";
const UCAPAN_PER_PAGE = 5;
let currentPage = 1;

function loadUcapan() {
  const daftarUcapan = JSON.parse(localStorage.getItem(KEY_UCAPAN) || "[]");
  const container = document.getElementById("daftar-ucapan");
  const btnPrev = document.getElementById("btn-prev");
  const btnNext = document.getElementById("btn-next");
  const pageInfo = document.getElementById("page-info");

  if (!container) return;

  if (daftarUcapan.length === 0) {
    container.innerHTML = `<div class="text-center py-4"><i class="fas fa-comments text-pink" style="font-size: 48px; opacity: 0.5;"></i><p class="mt-3 text-white">Belum ada ucapan. Jadilah yang pertama!</p></div>`;
    btnPrev.disabled = true;
    btnNext.disabled = true;
    pageInfo.textContent = "Halaman 0";
    return;
  }

  daftarUcapan.sort((a, b) => b.id - a.id); // Urutkan terbaru

  const totalPages = Math.ceil(daftarUcapan.length / UCAPAN_PER_PAGE);
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * UCAPAN_PER_PAGE;
  const end = start + UCAPAN_PER_PAGE;
  const halamanIni = daftarUcapan.slice(start, end);

  container.innerHTML = halamanIni
    .map((ucapan) => {
      const statusColor =
        ucapan.status === "Hadir"
          ? "#28a745"
          : ucapan.status === "Tidak Hadir"
            ? "#dc3545"
            : "#ffc107";
      return `
      <div class="card-ucapan-item p-3 mb-3">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h6 class="mb-1">${escapeHtml(ucapan.nama)}</h6>
            <small>${ucapan.tanggal}</small>
          </div>
          <span class="badge-status" style="background: ${statusColor};">${ucapan.status}</span>
        </div>
        <p class="mb-0">${escapeHtml(ucapan.pesan)}</p>
      </div>
    `;
    })
    .join("");

  pageInfo.textContent = `Halaman ${currentPage} dari ${totalPages}`;
  btnPrev.disabled = currentPage === 1;
  btnNext.disabled = currentPage === totalPages;
}

document.getElementById("btn-prev")?.addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    loadUcapan();
  }
});

document.getElementById("btn-next")?.addEventListener("click", function () {
  currentPage++;
  loadUcapan();
});

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
