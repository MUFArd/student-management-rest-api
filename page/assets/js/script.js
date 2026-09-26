// ============ Konfigurasi ============
const API_BASE = 'http://localhost:3000/siswa'; // sesuaikan dengan base URL API kamu
const ITEMS_PER_PAGE = 8;

// ============ State ============
let allSiswa = [];       // seluruh data dari server
let filteredSiswa = [];  // hasil setelah search + filter
let currentPage = 1;
let editingId = null;
let selectedFotoBase64 = null;
let deleteTargetId = null;

// ============ Elemen ============
const tableBody = document.getElementById('tableBody');
const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterKelas = document.getElementById('filterKelas');
const pageInfo = document.getElementById('pageInfo');
const pageNumbers = document.getElementById('pageNumbers');
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');

const formModal = document.getElementById('formModal');
const siswaForm = document.getElementById('siswaForm');
const modalTitle = document.getElementById('modalTitle');
const formServerError = document.getElementById('formServerError');
const submitSpinner = document.getElementById('submitSpinner');
const submitLabel = document.getElementById('submitLabel');

const deleteModal = document.getElementById('deleteModal');
const toast = document.getElementById('toast');

// ============ Dark mode ============
const darkToggle = document.getElementById('darkToggle');
const iconSun = document.getElementById('iconSun');
const iconMoon = document.getElementById('iconMoon');

function applyDarkMode(isDark) {
  document.documentElement.classList.toggle('dark', isDark);
  iconSun.classList.toggle('hidden', isDark);
  iconMoon.classList.toggle('hidden', !isDark);
  localStorage.setItem('siswa-dark-mode', isDark ? '1' : '0');
}

const savedDark = localStorage.getItem('siswa-dark-mode');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
applyDarkMode(savedDark ? savedDark === '1' : prefersDark);

darkToggle.addEventListener('click', () => {
  applyDarkMode(!document.documentElement.classList.contains('dark'));
});

// ============ Toast ============
function showToast(message, type = 'success') {
  toast.textContent = message;
  toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-lg text-white ${
    type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
  }`;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

// ============ Ambil daftar kelas unik dari data siswa yang sudah di-fetch ============
function populateKelasOptions(kelasList) {
  const filterSelect = document.getElementById('filterKelas');
  const formSelect = document.getElementById('inputKelas');
  const currentFilterValue = filterSelect.value;

  filterSelect.innerHTML = '<option value="">Semua kelas</option>';
  formSelect.innerHTML = '<option value="">Pilih kelas</option>';

  kelasList.forEach(kelas => {
    filterSelect.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(kelas)}">${escapeHtml(kelas)}</option>`);
    formSelect.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(kelas)}">${escapeHtml(kelas)}</option>`);
  });

  // Pertahankan pilihan filter yang sedang aktif setelah data di-refresh
  if (kelasList.includes(currentFilterValue)) {
    filterSelect.value = currentFilterValue;
  }
}

// ============ Fetch data ============
async function fetchSiswa() {
  loadingState.classList.remove('hidden');
  emptyState.classList.add('hidden');
  tableBody.innerHTML = '';

  try {
    const res = await fetch(API_BASE, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    });
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || 'Gagal mengambil data siswa');

    allSiswa = json.data || [];

    // Ambil kelas unik dari data siswa, urutkan alfabetis
    const kelasUnik = [...new Set(allSiswa.map(s => s.kelas).filter(Boolean))].sort();
    populateKelasOptions(kelasUnik);

    applyFilters();
  } catch (err) {
    showToast(err.message || 'Gagal mengambil data siswa', 'error');
    allSiswa = [];
    filteredSiswa = [];
    renderTable();
  } finally {
    loadingState.classList.add('hidden');
  }
}

// ============ Search + Filter ============
function applyFilters() {
  const keyword = searchInput.value.trim().toLowerCase();
  const kelas = filterKelas.value;

  filteredSiswa = allSiswa.filter(s => {
    const matchKeyword = !keyword ||
      s.nama.toLowerCase().includes(keyword) ||
      String(s.nis).includes(keyword);
    const matchKelas = !kelas || s.kelas === kelas;
    return matchKeyword && matchKelas;
  });

  currentPage = 1;
  renderTable();
}

let searchDebounce;
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(applyFilters, 300);
});
filterKelas.addEventListener('change', applyFilters);

// ============ Render tabel + pagination ============
function renderTable() {
  const total = filteredSiswa.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  currentPage = Math.min(currentPage, totalPages);

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageData = filteredSiswa.slice(start, start + ITEMS_PER_PAGE);

  tableBody.innerHTML = '';
  emptyState.classList.toggle('hidden', pageData.length > 0);

  pageData.forEach(s => {
    const tr = document.createElement('tr');
    tr.className = 'row-enter hover:bg-ink/[0.02] dark:hover:bg-slate-800/40 transition-colors';
    tr.innerHTML = `
      <td class="px-5 py-3">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-ink/5 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
            ${s.foto
              ? `<img src="${s.foto}" class="w-full h-full object-cover" alt="Foto ${escapeHtml(s.nama)}">`
              : `<span class="text-xs font-medium text-ink/40 dark:text-slate-500">${escapeHtml(s.nama || '?').charAt(0).toUpperCase()}</span>`}
          </div>
          <span class="font-medium">${escapeHtml(s.nama)}</span>
        </div>
      </td>
      <td class="px-5 py-3 text-ink/70 dark:text-slate-400">${escapeHtml(String(s.nis))}</td>
      <td class="px-5 py-3">
        <span class="px-2 py-0.5 rounded-full text-xs bg-ink/5 dark:bg-slate-800 text-ink/70 dark:text-slate-300">${escapeHtml(s.kelas)}</span>
      </td>
      <td class="px-5 py-3 text-ink/70 dark:text-slate-400">${escapeHtml(s.jurusan)}</td>
      <td class="px-5 py-3 text-ink/70 dark:text-slate-400 max-w-[200px] truncate">${escapeHtml(s.alamat)}</td>
      <td class="px-5 py-3 text-right">
        <button class="text-sm font-medium text-ink/60 dark:text-slate-400 hover:text-ink dark:hover:text-slate-100 mr-3" data-action="edit" data-id="${s.id}">Ubah</button>
        <button class="text-sm font-medium text-red-600 hover:text-red-700" data-action="delete" data-id="${s.id}" data-nama="${escapeHtml(s.nama)}">Hapus</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  pageInfo.textContent = total === 0
    ? 'Tidak ada data'
    : `Menampilkan ${start + 1}-${Math.min(start + ITEMS_PER_PAGE, total)} dari ${total} siswa`;

  renderPageNumbers(totalPages);
  prevPage.disabled = currentPage === 1;
  nextPage.disabled = currentPage === totalPages;
}

function renderPageNumbers(totalPages) {
  pageNumbers.innerHTML = '';
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
    btn.textContent = i;
    btn.addEventListener('click', () => { currentPage = i; renderTable(); });
    pageNumbers.appendChild(btn);
  }
}

prevPage.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTable(); } });
nextPage.addEventListener('click', () => {
  const totalPages = Math.max(1, Math.ceil(filteredSiswa.length / ITEMS_PER_PAGE));
  if (currentPage < totalPages) { currentPage++; renderTable(); }
});

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

// ============ Delegasi klik tombol Ubah/Hapus ============
tableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = btn.dataset.id;

  if (btn.dataset.action === 'edit') {
    openEditForm(id);
  } else if (btn.dataset.action === 'delete') {
    deleteTargetId = id;
    document.getElementById('deleteText').textContent = `"${btn.dataset.nama}" akan dihapus permanen dan tidak dapat dikembalikan.`;
    deleteModal.classList.remove('hidden');
  }
});

// ============ Form: buka/tutup ============
const btnAdd = document.getElementById('btnAdd');
const closeModal = document.getElementById('closeModal');
const cancelForm = document.getElementById('cancelForm');
const modalOverlay = document.getElementById('modalOverlay');

function openAddForm() {
  editingId = null;
  selectedFotoBase64 = null;
  siswaForm.reset();
  clearFormErrors();
  document.getElementById('photoPreview').classList.add('hidden');
  document.getElementById('photoPlaceholder').classList.remove('hidden');
  modalTitle.textContent = 'Tambah Siswa';
  submitLabel.textContent = 'Simpan';
  formModal.classList.remove('hidden');
}

function openEditForm(id) {
  const s = allSiswa.find(x => String(x.id) === String(id));
  if (!s) return;
  editingId = id;
  selectedFotoBase64 = s.foto || null;
  clearFormErrors();

  document.getElementById('inputNis').value = s.nis;
  document.getElementById('inputNama').value = s.nama;
  document.getElementById('inputKelas').value = s.kelas;
  document.getElementById('inputJurusan').value = s.jurusan;
  document.getElementById('inputAlamat').value = s.alamat;

  const preview = document.getElementById('photoPreview');
  if (s.foto) {
    preview.src = s.foto;
    preview.classList.remove('hidden');
    document.getElementById('photoPlaceholder').classList.add('hidden');
  } else {
    preview.classList.add('hidden');
    document.getElementById('photoPlaceholder').classList.remove('hidden');
  }

  modalTitle.textContent = 'Ubah Data Siswa';
  submitLabel.textContent = 'Simpan Perubahan';
  formModal.classList.remove('hidden');
}

function closeForm() {
  formModal.classList.add('hidden');
}

btnAdd.addEventListener('click', openAddForm);
closeModal.addEventListener('click', closeForm);
cancelForm.addEventListener('click', closeForm);
modalOverlay.addEventListener('click', closeForm);

// ============ Upload foto ============
const fotoInput = document.getElementById('fotoInput');
fotoInput.addEventListener('change', () => {
  const file = fotoInput.files[0];
  const errFoto = document.getElementById('err-foto');
  if (!file) return;

  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type) || file.size > 2 * 1024 * 1024) {
    errFoto.classList.remove('hidden');
    fotoInput.value = '';
    return;
  }
  errFoto.classList.add('hidden');

  const reader = new FileReader();
  reader.onload = () => {
    selectedFotoBase64 = reader.result;
    const preview = document.getElementById('photoPreview');
    preview.src = reader.result;
    preview.classList.remove('hidden');
    document.getElementById('photoPlaceholder').classList.add('hidden');
  };
  reader.readAsDataURL(file);
});

// ============ Validasi form ============
function clearFormErrors() {
  ['nis', 'nama', 'kelas', 'jurusan', 'alamat'].forEach(f =>
    document.getElementById(`err-${f}`).classList.add('hidden')
  );
  formServerError.classList.add('hidden');
}

function validateForm(data) {
  let valid = true;
  clearFormErrors();

  if (!data.nis || !/^\d+$/.test(String(data.nis))) {
    document.getElementById('err-nis').classList.remove('hidden');
    valid = false;
  }
  if (!data.nama.trim()) {
    document.getElementById('err-nama').classList.remove('hidden');
    valid = false;
  }
  if (!data.kelas) {
    document.getElementById('err-kelas').classList.remove('hidden');
    valid = false;
  }
  if (!data.jurusan.trim()) {
    document.getElementById('err-jurusan').classList.remove('hidden');
    valid = false;
  }
  if (!data.alamat.trim()) {
    document.getElementById('err-alamat').classList.remove('hidden');
    valid = false;
  }
  return valid;
}

// ============ Submit form (create / update) ============
siswaForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nis: document.getElementById('inputNis').value.trim(),
    nama: document.getElementById('inputNama').value.trim(),
    kelas: document.getElementById('inputKelas').value,
    jurusan: document.getElementById('inputJurusan').value.trim(),
    alamat: document.getElementById('inputAlamat').value.trim(),
    foto: selectedFotoBase64,
  };

  if (!validateForm(data)) return;

  const submitBtn = document.getElementById('submitForm');
  submitBtn.disabled = true;
  submitSpinner.classList.remove('hidden');
  formServerError.classList.add('hidden');

  try {
    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || 'Gagal menyimpan data siswa');

    showToast(editingId ? 'Data siswa berhasil diubah' : 'Data siswa berhasil ditambahkan');
    closeForm();
    fetchSiswa();
  } catch (err) {
    formServerError.textContent = err.message || 'Gagal menyimpan data siswa';
    formServerError.classList.remove('hidden');
  } finally {
    submitBtn.disabled = false;
    submitSpinner.classList.add('hidden');
  }
});

// ============ Hapus data ============
document.getElementById('cancelDelete').addEventListener('click', () => deleteModal.classList.add('hidden'));
document.getElementById('deleteOverlay').addEventListener('click', () => deleteModal.classList.add('hidden'));

document.getElementById('confirmDelete').addEventListener('click', async () => {
  const btn = document.getElementById('confirmDelete');
  btn.disabled = true;
  btn.textContent = 'Menghapus...';

  try {
    const res = await fetch(`${API_BASE}/${deleteTargetId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
    });
    const json = await res.json();

    if (!res.ok) throw new Error(json.message || 'Gagal menghapus data siswa');

    showToast('Data siswa berhasil dihapus');
    deleteModal.classList.add('hidden');
    fetchSiswa();
  } catch (err) {
    showToast(err.message || 'Gagal menghapus data siswa', 'error');
    deleteModal.classList.add('hidden');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Hapus';
  }
});

// ============ Init ============
fetchSiswa();