import React, { useState, useEffect } from "react";

const endpoint =
  "https://script.google.com/macros/s/AKfycbwgqm394g0ZD07F7rBfFgLBQpEmC4H6vZwKY6kwlqHqUrxY4yz51aPrHzRvgTCr9EZS/exec";

// 🔧 Format tanggal dd-mm-yyyy
const formatDateDDMMYYYY = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-");
  return `${day}-${month}-${year}`;
};

// ✅ Form tambah siswa
const StudentForm = ({ onBack, onStudentAdded }) => {
  const [nisn, setNisn] = useState("");
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");

  const handleSubmit = () => {
    if (!nisn || !nama || !kelas) {
      alert("⚠️ Semua field wajib diisi!");
      return;
    }

    fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "siswa",
        nisn,
        nama,
        kelas,
      }),
    })
      .then(() => {
        alert("✅ Siswa berhasil ditambahkan!");

        // Panggil callback untuk update data siswa
        onStudentAdded();

        // Reset form
        setNisn("");
        setNama("");
        setKelas("");

        // Kembali ke halaman utama
        onBack();
      })
      .catch(() => alert("❌ Gagal menambahkan siswa."));
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-center text-blue-600">
        Tambah Data Siswa
      </h2>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="NISN"
          value={nisn}
          onChange={(e) => setNisn(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Nama Siswa"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <input
          type="text"
          placeholder="Kelas"
          value={kelas}
          onChange={(e) => setKelas(e.target.value)}
          className="w-full border px-4 py-2 rounded"
        />
        <div className="flex justify-between">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-400 text-white rounded"
          >
            ← Kembali
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Tambah Siswa
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentAttendanceApp = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showForm, setShowForm] = useState(false);

  // Fungsi untuk mengambil data siswa dari Sheet
  const fetchStudents = () => {
    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data);
      })
      .catch(() => alert("❌ Gagal mengambil data siswa"));
  };

  // Ambil data siswa dari Sheet saat pertama kali load
  useEffect(() => {
    fetchStudents();
  }, []);

  // Inisialisasi status Hadir untuk tanggal
  useEffect(() => {
    if (students.length && !attendance[date]) {
      const init = {};
      students.forEach((s) => (init[s.id] = "Hadir"));
      setAttendance((prev) => ({ ...prev, [date]: init }));
    }
  }, [date, students]);

  const setStatus = (sid, status) => {
    setAttendance((prev) => ({
      ...prev,
      [date]: { ...prev[date], [sid]: status },
    }));
  };

  const handleSave = () => {
    const formattedDate = formatDateDDMMYYYY(date);

    const data = students.map((s) => ({
      tanggal: formattedDate,
      nama: s.name,
      kelas: s.kelas,
      nisn: s.nisn,
      status: attendance[date][s.id],
    }));

    fetch(endpoint, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then(() => alert("✅ Data absensi berhasil dikirim!"))
      .catch(() => alert("❌ Gagal kirim data absensi."));
  };

  // Callback untuk refresh data siswa setelah menambah siswa baru
  const handleStudentAdded = () => {
    fetchStudents();
  };

  const statusColor = {
    Hadir: "bg-green-500",
    Izin: "bg-yellow-400",
    Sakit: "bg-blue-400",
    Alpha: "bg-red-500",
  };

  if (showForm) {
    return (
      <StudentForm
        onBack={() => setShowForm(false)}
        onStudentAdded={handleStudentAdded}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
          📋 Absensi Siswa ({students.length})
        </h1>

        <div className="mb-4 text-center">
          <p className="text-sm text-gray-500">
            Tanggal: {formatDateDDMMYYYY(date)}
          </p>
        </div>

        <div className="mb-6 flex justify-center">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {students.map((s) => (
          <div
            key={s.id}
            className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-800">{s.name}</p>
                <p className="text-sm text-gray-500">
                  {s.kelas} • NISN: {s.nisn}
                </p>
              </div>
              <div className="flex gap-2">
                {["Hadir", "Izin", "Sakit", "Alpha"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatus(s.id, status)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      attendance[date]?.[s.id] === status
                        ? `${statusColor[status]} text-white`
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleSave}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-md transition"
        >
          💾 Simpan Absensi
        </button>

        <button
          onClick={() => setShowForm(true)}
          className="mt-4 w-full bg-gray-600 text-white py-2 rounded-lg"
        >
          ➕ Tambah Data Siswa
        </button>
      </div>
    </div>
  );
};

export default StudentAttendanceApp;
