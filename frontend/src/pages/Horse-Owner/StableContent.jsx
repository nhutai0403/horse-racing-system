import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useHorseOwner } from './HorseOwnerContext';
import StatusBadge from '../../components/StatusBadge';
import MetricBar from '../../components/MetricBar';
import { createHorseAPI, uploadFilesAPI, updateHorseAPI, deleteHorseAPI } from '../../services/owner';

export default function StableContent() {
  const { horses = [], setHorses } = useHorseOwner();
  const [selectedHorseId, setSelectedHorseId] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newHorseData, setNewHorseData] = useState({
    name: '',
    breed: '',
    age: '',
    gender: 'Male',
    status: 'READY',
    image: '',
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editHorseData, setEditHorseData] = useState({
    id: '',
    name: '',
    breed: '',
    age: '',
    gender: 'Male',
    status: 'READY',
    image: '',
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [horseToDelete, setHorseToDelete] = useState(null);

  const activeHorseId = selectedHorseId || horses[0]?.id;
  const selectedHorse = horses.find((h) => h.id === activeHorseId) || horses[0];

  const handleEditClick = (horse) => {
    setEditHorseData({
      id: horse.id,
      name: horse.name,
      breed: horse.breed,
      age: horse.age,
      gender: horse.gender,
      status: horse.status,
      image: horse.image || horse.img || '',
    });
    setShowEditModal(true);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploading(true);
        const urls = await uploadFilesAPI([file]);
        if (urls && urls.length > 0) {
          let url = urls[0];
          if (url.startsWith('/')) {
            url = `http://localhost:8080${url}`;
          }
          setNewHorseData((prev) => ({ ...prev, image: url }));
        }
      } catch (err) {
        alert('Tải ảnh lên thất bại: ' + err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleEditImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setUploading(true);
        const urls = await uploadFilesAPI([file]);
        if (urls && urls.length > 0) {
          let url = urls[0];
          if (url.startsWith('/')) {
            url = `http://localhost:8080${url}`;
          }
          setEditHorseData((prev) => ({ ...prev, image: url }));
        }
      } catch (err) {
        alert('Tải ảnh lên thất bại: ' + err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editHorseData.name.trim()) {
      alert('Please enter a horse name.');
      return;
    }
    if (!editHorseData.breed.trim()) {
      alert('Please enter a breed.');
      return;
    }
    const ageNum = parseInt(editHorseData.age);
    if (isNaN(ageNum) || ageNum <= 0) {
      alert('Please enter a valid age.');
      return;
    }

    try {
      const response = await updateHorseAPI(editHorseData.id, {
        name: editHorseData.name.trim(),
        breedName: editHorseData.breed.trim(),
        age: ageNum,
        gender: editHorseData.gender,
        imageUrl: editHorseData.image || '',
        status: editHorseData.status
      });

      setHorses((prev) =>
        prev.map((h) =>
          h.id === editHorseData.id
            ? {
                ...h,
                name: response.name,
                breed: response.breedName || response.breed || editHorseData.breed.trim(),
                age: response.age,
                gender: response.gender,
                status: response.status || editHorseData.status,
                image: response.imageUrl || response.image || '',
              }
            : h,
        ),
      );
      setShowEditModal(false);
    } catch (err) {
      alert('Cập nhật thông tin ngựa thất bại: ' + err.message);
    }
  };

  const handleDeleteClick = (horse) => {
    setHorseToDelete(horse);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (horseToDelete) {
      try {
        await deleteHorseAPI(horseToDelete.id);
        const remainingHorses = horses.filter((h) => h.id !== horseToDelete.id);
        setHorses(remainingHorses);
        setSelectedHorseId(remainingHorses[0]?.id || null);
        setShowDeleteModal(false);
        setHorseToDelete(null);
      } catch (err) {
        alert('Xóa ngựa thất bại: ' + err.message);
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!newHorseData.name.trim()) {
      alert('Please enter a horse name.');
      return;
    }
    if (!newHorseData.breed.trim()) {
      alert('Please enter a breed.');
      return;
    }
    const ageNum = parseInt(newHorseData.age);
    if (isNaN(ageNum) || ageNum <= 0) {
      alert('Please enter a valid age.');
      return;
    }

    try {
      const response = await createHorseAPI({
        name: newHorseData.name.trim(),
        breedName: newHorseData.breed.trim(),
        age: ageNum,
        gender: newHorseData.gender,
        imageUrl: newHorseData.image,
      });

      const newHorse = {
        id: response.id,
        name: response.name,
        breed: response.breedName,
        age: response.age,
        gender: response.gender,
        status: response.status || 'READY',
        matchesPlayed: response.totalRaces || 0,
        winRate: Math.round(response.top1Rate || 0),
        image: response.imageUrl || '',
        top1Rate: Math.round(response.top1Rate || 0),
        top2Rate: Math.round(response.top2Rate || 0),
        top3Rate: Math.round(response.top3Rate || 0),
        metrics: { speed: 85, stamina: 80, gatePerformance: 90 },
      };

      setHorses((prev) => [...prev, newHorse]);
      setSelectedHorseId(response.id);

      // Reset and close
      setNewHorseData({
        name: '',
        breed: '',
        age: '',
        gender: 'Male',
        status: 'READY',
        image: '',
      });
      setShowRegisterModal(false);
    } catch (err) {
      alert('Thêm ngựa mới thất bại: ' + err.message);
    }
  };

  const horseMetrics = selectedHorse
    ? [
        {
          label: 'Top 1 Rate',
          val: selectedHorse.top1Rate ?? selectedHorse.winRate ?? 0,
          color: 'var(--ho-primary-dark)',
          suffix: '%',
        },
        {
          label: 'Top 2 Rate',
          val: selectedHorse.top2Rate ?? 0,
          color: 'var(--ho-accent-gold-text)',
          suffix: '%',
        },
        {
          label: 'Top 3 Rate',
          val: selectedHorse.top3Rate ?? 0,
          color: 'var(--ho-primary-medium)',
          suffix: '%',
        },
      ]
    : [];

  return (
    <div className="container-fluid p-0 animate-fade-in" style={{ maxWidth: '1440px' }}>
      <div className="row g-4" style={{ minHeight: 'calc(100vh - 180px)' }}>
        {/* Left Roster list */}
        <div className="col-12 col-md-5 d-flex flex-column">
          <div className="glass-card d-flex flex-column h-100 overflow-y-auto">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2
                className="ho-font-epilogue fs-4 fw-bold m-0"
                style={{ color: 'var(--ho-primary-dark)' }}
              >
                Stable Roster
              </h2>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="ho-btn ho-btn-gold-solid py-1 px-3 d-flex align-items-center gap-1"
                style={{ fontSize: '12px' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  add
                </span>
                Add Horse
              </button>
            </div>

            <div className="d-flex flex-column gap-2 flex-grow-1">
              {horses.map((horse) => {
                const isSelected = horse.id === activeHorseId;
                return (
                  <div
                    key={horse.id}
                    onClick={() => setSelectedHorseId(horse.id)}
                    className="d-flex align-items-center p-3 rounded border cursor-pointer transition-all"
                    style={{
                      backgroundColor: isSelected ? 'rgba(0, 56, 32, 0.08)' : 'transparent',
                      borderColor: isSelected ? 'var(--ho-primary-dark)' : 'transparent',
                      transition: 'background-color 0.2s ease, border-color 0.2s ease',
                    }}
                  >
                    <div
                      className="rounded-circle overflow-hidden me-3 border d-flex align-items-center justify-content-center bg-light text-secondary text-center shadow-sm"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderColor: '#c0c9c0',
                        flexShrink: 0,
                      }}
                    >
                      {horse.image || horse.img ? (
                        <img
                          src={horse.image || horse.img}
                          alt={horse.name}
                          className="w-100 h-100 object-fit-cover"
                        />
                      ) : (
                        <div
                          className="d-flex flex-column align-items-center justify-content-center"
                          style={{ lineHeight: 1.1 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            image
                          </span>
                          <span
                            style={{
                              fontSize: '7px',
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              letterSpacing: '0.2px',
                            }}
                          >
                            No Image
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow-1 d-flex justify-content-between align-items-center gap-2">
                      <div>
                        <h4
                          className="fw-bold m-0 mb-1"
                          style={{ color: 'var(--ho-primary-dark)', fontSize: '15px' }}
                        >
                          {horse.name}
                        </h4>
                        <div
                          className="text-secondary small fw-semibold"
                          style={{ fontSize: '11px' }}
                        >
                          {horse.breed} • {horse.matchesPlayed} Matches
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <StatusBadge status={horse.status} iconOnly={true} />

                        {/* Compact & Elegant CRUD icons */}
                        <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEditClick(horse)}
                            className="p-1 btn btn-link text-decoration-none border-0 bg-transparent hover-scale"
                            style={{ outline: 'none' }}
                            title="Edit Horse"
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '18px', color: 'var(--ho-accent-gold-text)' }}
                            >
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(horse)}
                            className="p-1 btn btn-link text-decoration-none border-0 bg-transparent hover-scale"
                            style={{ outline: 'none' }}
                            title="Delete Horse"
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: '18px', color: 'var(--ho-error-text)' }}
                            >
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Details panel */}
        <div className="col-12 col-md-7">
          {selectedHorse ? (
            <div className="glass-card h-100 overflow-y-auto">
              {/* Header */}
              <div
                className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 border-bottom pb-4 mb-4"
                style={{ borderColor: 'var(--ho-border-muted)' }}
              >
                <div className="d-flex gap-4 align-items-center">
                  <div
                    className="rounded overflow-hidden border shadow-sm d-flex align-items-center justify-content-center bg-light text-secondary text-center"
                    style={{ width: '90px', height: '90px', borderColor: '#c0c9c0', flexShrink: 0 }}
                  >
                    {selectedHorse.image || selectedHorse.img ? (
                      <img
                        src={selectedHorse.image || selectedHorse.img}
                        alt={selectedHorse.name}
                        className="w-100 h-100 object-fit-cover"
                      />
                    ) : (
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <span
                          className="material-symbols-outlined mb-1"
                          style={{ fontSize: '28px' }}
                        >
                          image
                        </span>
                        <span
                          className="fw-bold"
                          style={{
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          No Image
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2
                      className="ho-font-epilogue fs-3 fw-bold mb-2 d-flex align-items-center gap-3"
                      style={{ color: 'var(--ho-primary-dark)' }}
                    >
                      {selectedHorse.name}
                      <StatusBadge status={selectedHorse.status} />
                    </h2>
                    <div
                      className="text-secondary ho-font-grotesk fw-bold d-flex flex-wrap gap-3"
                      style={{ fontSize: '12px' }}
                    >
                      <span>
                        <span className="text-dark">Breed:</span> {selectedHorse.breed}
                      </span>
                      <span>
                        <span className="text-dark">Age:</span> {selectedHorse.age}yo{' '}
                        {selectedHorse.gender}
                      </span>
                      <span>
                        <span className="text-dark">Matches:</span> {selectedHorse.matchesPlayed}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="row g-4">
                <div className="col-12">
                  <h3
                    className="ho-font-epilogue fs-6 fw-bold mb-3 d-flex align-items-center gap-2"
                    style={{ color: 'var(--ho-primary-dark)' }}
                  >
                    <span className="material-symbols-outlined fs-5">speed</span>
                    Performance Metrics
                  </h3>
                  <div
                    className="border rounded p-4"
                    style={{ backgroundColor: '#fcfdfc', borderColor: 'var(--ho-border-muted)' }}
                  >
                    {horseMetrics.map((metric, i) => (
                      <MetricBar
                        key={i}
                        label={metric.label}
                        value={metric.val}
                        color={metric.color}
                        suffix={metric.suffix}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card h-100 d-flex align-items-center justify-content-center text-secondary italic">
              Select a horse to view details.
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal Dialog */}
      {showRegisterModal &&
        createPortal(
          <div
            className="modal-overlay"
            style={{ zIndex: 1050 }}
            onClick={() => setShowRegisterModal(false)}
          >
            <div
              className="modal-content-custom animate-scale-up"
              style={{ maxWidth: '550px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="ho-font-epilogue fs-4 fw-bold mb-4"
                style={{ color: 'var(--ho-primary-dark)' }}
              >
                Add New Horse
              </h3>

              <form onSubmit={handleRegisterSubmit}>
                <div
                  className="d-flex flex-column gap-3 mb-4"
                  style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}
                >
                  {/* Horse Image */}
                  <div className="d-flex flex-column align-items-center mb-2">
                    <label className="ho-input-label ho-font-grotesk text-center w-100 mb-2">
                      Horse Image
                    </label>
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div
                        className="rounded-circle overflow-hidden border bg-light d-flex flex-column align-items-center justify-content-center text-center shadow-sm"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderColor: 'var(--ho-border-muted)',
                          flexShrink: 0,
                        }}
                      >
                        {newHorseData.image ? (
                          <img
                            src={newHorseData.image}
                            alt="Preview"
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <div className="d-flex flex-column align-items-center justify-content-center text-secondary">
                            <span
                              className="material-symbols-outlined mb-1"
                              style={{ fontSize: '24px' }}
                            >
                              image
                            </span>
                            <span
                              className="fw-bold"
                              style={{
                                fontSize: '9px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <label
                          htmlFor="add-horse-image"
                          className="ho-btn ho-btn-gold-solid py-1 px-3 m-0 text-center cursor-pointer"
                          style={{
                            fontSize: '11px',
                            opacity: uploading ? 0.6 : 1,
                            pointerEvents: uploading ? 'none' : 'auto',
                          }}
                        >
                          {uploading ? 'Uploading...' : 'Upload Image'}
                        </label>
                        <input
                          id="add-horse-image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="d-none"
                        />
                        {newHorseData.image && (
                          <button
                            type="button"
                            onClick={() => setNewHorseData((prev) => ({ ...prev, image: '' }))}
                            className="btn btn-link text-danger p-0 text-decoration-none small fw-bold"
                            style={{ fontSize: '11px' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Horse Name */}
                  <div>
                    <label className="ho-input-label ho-font-grotesk">Horse Name</label>
                    <input
                      type="text"
                      required
                      value={newHorseData.name}
                      onChange={(e) => setNewHorseData({ ...newHorseData, name: e.target.value })}
                      className="ho-form-input text-dark"
                      placeholder="e.g. Pegasus Gold"
                    />
                  </div>

                  {/* Breed & Age */}
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="ho-input-label ho-font-grotesk">Breed</label>
                      <input
                        type="text"
                        required
                        value={newHorseData.breed}
                        onChange={(e) =>
                          setNewHorseData({ ...newHorseData, breed: e.target.value })
                        }
                        className="ho-form-input text-dark"
                        placeholder="e.g. Thoroughbred"
                      />
                    </div>
                    <div className="col-6">
                      <label className="ho-input-label ho-font-grotesk">Age (Years)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="30"
                        value={newHorseData.age}
                        onChange={(e) => setNewHorseData({ ...newHorseData, age: e.target.value })}
                        className="ho-form-input text-dark"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>

                  {/* Gender & Status */}
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="ho-input-label ho-font-grotesk">Gender</label>
                      <select
                        value={newHorseData.gender}
                        onChange={(e) =>
                          setNewHorseData({ ...newHorseData, gender: e.target.value })
                        }
                        className="ho-form-input text-dark fw-bold"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="ho-input-label ho-font-grotesk">Initial Status</label>
                      <select
                        value={newHorseData.status}
                        onChange={(e) =>
                          setNewHorseData({ ...newHorseData, status: e.target.value })
                        }
                        className="ho-form-input text-dark fw-bold"
                      >
                        <option value="READY">Ready</option>
                        <option value="TRAINING">In Training</option>
                        <option value="SICK">Sick</option>
                        <option value="RECOVERY">Recovery</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-end gap-3 align-items-center border-top pt-3">
                  <button
                    type="button"
                    onClick={() => setShowRegisterModal(false)}
                    className="ho-btn-link text-uppercase tracking-wider small fw-bold"
                    style={{ textDecoration: 'none' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="ho-btn ho-btn-gold-solid py-2 px-4 fw-bold">
                    Add Horse
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* Edit Modal Dialog */}
      {showEditModal &&
        createPortal(
          <div
            className="modal-overlay"
            style={{ zIndex: 1050 }}
            onClick={() => setShowEditModal(false)}
          >
            <div
              className="modal-content-custom animate-scale-up"
              style={{ maxWidth: '550px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                className="ho-font-epilogue fs-4 fw-bold mb-4"
                style={{ color: 'var(--ho-primary-dark)' }}
              >
                Edit Horse Details
              </h3>

              <form onSubmit={handleEditSubmit}>
                <div
                  className="d-flex flex-column gap-3 mb-4"
                  style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}
                >
                  {/* Horse Image */}
                  <div className="d-flex flex-column align-items-center mb-2">
                    <label className="ho-input-label ho-font-grotesk text-center w-100 mb-2">
                      Horse Image
                    </label>
                    <div className="d-flex flex-column align-items-center gap-2">
                      <div
                        className="rounded-circle overflow-hidden border bg-light d-flex flex-column align-items-center justify-content-center text-center shadow-sm"
                        style={{
                          width: '80px',
                          height: '80px',
                          borderColor: 'var(--ho-border-muted)',
                          flexShrink: 0,
                        }}
                      >
                        {editHorseData.image ? (
                          <img
                            src={editHorseData.image}
                            alt="Preview"
                            className="w-100 h-100 object-fit-cover"
                          />
                        ) : (
                          <div className="d-flex flex-column align-items-center justify-content-center text-secondary">
                            <span
                              className="material-symbols-outlined mb-1"
                              style={{ fontSize: '24px' }}
                            >
                              image
                            </span>
                            <span
                              className="fw-bold"
                              style={{
                                fontSize: '9px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              No Image
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <label
                          htmlFor="edit-horse-image"
                          className="ho-btn ho-btn-gold-solid py-1 px-3 m-0 text-center cursor-pointer"
                          style={{
                            fontSize: '11px',
                            opacity: uploading ? 0.6 : 1,
                            pointerEvents: uploading ? 'none' : 'auto',
                          }}
                        >
                          {uploading ? 'Uploading...' : 'Upload Image'}
                        </label>
                        <input
                          id="edit-horse-image"
                          type="file"
                          accept="image/*"
                          onChange={handleEditImageChange}
                          className="d-none"
                        />
                        {editHorseData.image && (
                          <button
                            type="button"
                            onClick={() => setEditHorseData((prev) => ({ ...prev, image: '' }))}
                            className="btn btn-link text-danger p-0 text-decoration-none small fw-bold"
                            style={{ fontSize: '11px' }}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Horse Name */}
                  <div>
                    <label className="ho-input-label ho-font-grotesk">Horse Name</label>
                    <input
                      type="text"
                      required
                      value={editHorseData.name}
                      onChange={(e) => setEditHorseData({ ...editHorseData, name: e.target.value })}
                      className="ho-form-input text-dark"
                      placeholder="e.g. Pegasus Gold"
                    />
                  </div>

                  {/* Breed & Age */}
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="ho-input-label ho-font-grotesk">Breed</label>
                      <input
                        type="text"
                        required
                        value={editHorseData.breed}
                        onChange={(e) =>
                          setEditHorseData({ ...editHorseData, breed: e.target.value })
                        }
                        className="ho-form-input text-dark"
                        placeholder="e.g. Thoroughbred"
                      />
                    </div>
                    <div className="col-6">
                      <label className="ho-input-label ho-font-grotesk">Age (Years)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="30"
                        value={editHorseData.age}
                        onChange={(e) =>
                          setEditHorseData({ ...editHorseData, age: e.target.value })
                        }
                        className="ho-form-input text-dark"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>

                  {/* Gender & Status */}
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="ho-input-label ho-font-grotesk">Gender</label>
                      <select
                        value={editHorseData.gender}
                        onChange={(e) =>
                          setEditHorseData({ ...editHorseData, gender: e.target.value })
                        }
                        className="ho-form-input text-dark fw-bold"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="ho-input-label ho-font-grotesk">Status</label>
                      <select
                        value={editHorseData.status}
                        onChange={(e) =>
                          setEditHorseData({ ...editHorseData, status: e.target.value })
                        }
                        className="ho-form-input text-dark fw-bold"
                      >
                        <option value="READY">Ready</option>
                        <option value="TRAINING">In Training</option>
                        <option value="SICK">Sick</option>
                        <option value="RECOVERY">Recovery</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-end gap-3 align-items-center border-top pt-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="ho-btn-link text-uppercase tracking-wider small fw-bold"
                    style={{ textDecoration: 'none' }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="ho-btn ho-btn-gold-solid py-2 px-4 fw-bold">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}
      {/* Delete Confirmation Modal Dialog */}
      {showDeleteModal &&
        createPortal(
          <div
            className="modal-overlay"
            style={{ zIndex: 1050 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="modal-content-custom animate-scale-up text-center"
              style={{ maxWidth: '420px', padding: '2.5rem 2rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <span
                className="material-symbols-outlined text-danger mb-3"
                style={{ fontSize: '48px' }}
              >
                warning
              </span>
              <h3
                className="ho-font-epilogue fs-5 fw-bold mb-2"
                style={{ color: 'var(--ho-primary-dark)' }}
              >
                Delete Horse
              </h3>
              <p className="text-secondary small fw-medium mb-4" style={{ lineHeight: '1.5' }}>
                Are you sure you want to delete{' '}
                <strong style={{ color: 'var(--ho-primary-dark)' }}>{horseToDelete?.name}</strong>{' '}
                from the roster? This action cannot be undone.
              </p>

              <div className="d-flex justify-content-center gap-3 align-items-center border-top pt-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="ho-btn-link text-uppercase tracking-wider small fw-bold"
                  style={{ textDecoration: 'none' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="ho-btn ho-btn-outline-danger py-2 px-4 fw-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
