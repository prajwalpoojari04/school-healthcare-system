import { FiPlus } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import DataTable from '../../components/tables/DataTable';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';
import { medicalRecordService } from '../../services/medicalRecordService';
import { studentService } from '../../services/studentService';
import { formatDate } from '../../utils/helpers';
import { useState, useEffect, useCallback } from 'react';
import { getAIRecommendation } from '../../services/aiService';
import AIRecommendationCard from '../../components/doctor/AIRecommendationCard';


const PrescriptionManagement = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState(null);
  
  const [manualMedicine, setManualMedicine] =
  useState('');

const [manualDosage, setManualDosage] =
  useState('');

const [manualMedicines, setManualMedicines] =
  useState([]);

const [doctorNotes, setDoctorNotes] =
  useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [{ records }, studentsData] = await Promise.all([
        medicalRecordService.getAll(),
        studentService.getAll(),
      ]);
      const derived = records.flatMap((record) =>
        (record.medications || []).map((medication, index) => ({
          id: `${record.id}-${index}`,
          patient: record.studentName,
          medication,
          dosage: 'See medical record',
          status: 'active',
          date: formatDate(record.date),
          recordId: record.id,
        }))
      );
      setPrescriptions(derived);
      setPatients(studentsData.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGenerateAI = async () => {
    if (!selectedPatientId) {
      setAiError('Select a patient before generating a recommendation.');
      return;
    }

    if (!symptoms.trim()) {
      setAiError('Enter current symptoms before generating a recommendation.');
      return;
    }

    try {
      setAiLoading(true);
      setAiError(null);

      const result = await getAIRecommendation(selectedPatientId, symptoms);

      setAiRecommendation(result);

      setSelectedMedicines(
  result.recommendedMedicines || []
);

  //     setSelectedMedicines(
  // (result.recommendedMedicines || []).map((med) => ({
  //   ...med,
  //   selected: true,
  // }))


      toast.success('AI recommendation generated');
    } catch (error) {
      console.error(error);
      setAiError('Failed to generate recommendation. Please try again.');
      toast.error('Failed to generate recommendation');
    } finally {
      setAiLoading(false);
    }
  };


  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);
 
  const toggleMedicine = (medicine) => {
  const exists = selectedMedicines.find(
    (m) => m.name === medicine.name
  );

  if (exists) {
    setSelectedMedicines(
      selectedMedicines.filter(
        (m) => m.name !== medicine.name
      )
    );
  } else {
    setSelectedMedicines([
      ...selectedMedicines,
      medicine,
    ]);
  }
};

const addManualMedicine = () => {
  if (!manualMedicine.trim()) return;

  setManualMedicines([
    ...manualMedicines,
    {
      name: manualMedicine,
      dosage: manualDosage,
    },
  ]);

  setManualMedicine('');
  setManualDosage('');
};


  const columns = [
    { key: 'patient', label: 'Patient' },
    { key: 'medication', label: 'Medication' },
    { key: 'dosage', label: 'Dosage' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => (
        <span className="rounded-full bg-health-100 px-2.5 py-0.5 text-xs font-medium text-health-700 capitalize dark:bg-health-900/30 dark:text-health-400">
          {r.status}
        </span>
      ),
    },
    { key: 'date', label: 'Date' },
  ];

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId);

  const handleSavePrescription = async () => {
  try {
    if (!selectedPatientId) {
      toast.error('Select a patient');
      return;
    }

    if (!aiRecommendation) {
      toast.error('Generate AI recommendation first');
      return;
    }

    const payload = {
      student: selectedPatientId,

      symptoms: symptoms
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),

      diagnosis:
        aiRecommendation.possibleCondition ||
        'AI Suggested Condition',

      medications:
  selectedMedicines
    .filter((med) => med.selected)
    .map((med) => med.name),

      doctorNotes: `
AI Reasoning:
${aiRecommendation.reasoning}

Urgency:
${aiRecommendation.urgencyLevel}

Disclaimer:
${aiRecommendation.disclaimer}
      `,

      treatedBy: 'School Doctor',
    };

    await medicalRecordService.create(payload);

    toast.success('Prescription saved');

    closeModal();

    fetchPrescriptions();
  } catch (error) {
    console.error(error);

    toast.error('Failed to save prescription');
  }
};

const [selectedMedicines, setSelectedMedicines] = useState([]);

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPatientId('');
    setSymptoms('');
    setAiRecommendation(null);
    setAiError(null);
  };

  if (loading) return <LoadingSpinner className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={fetchPrescriptions} />;

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex justify-end">
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 rounded-xl gradient-health px-4 py-2.5 text-sm font-semibold text-white">
            <FiPlus className="h-4 w-4" /> AI Medicine Support
          </button>
        </div>
        <div className="glass-card">
          {prescriptions.length === 0 ? (
            <EmptyState title="No prescriptions" description="Medications from medical records will appear here." />
          ) : (
            <DataTable columns={columns} data={prescriptions} />
          )}
        </div>

        <Modal isOpen={modalOpen} onClose={closeModal} title="AI Medicine Support">
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              Select a patient and enter current symptoms to generate an advisory recommendation.
            </p>

            <div>
              <label htmlFor="prescription-ai-patient" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Patient
              </label>
              <select
                id="prescription-ai-patient"
                value={selectedPatientId}
                onChange={(event) => {
                  setSelectedPatientId(event.target.value);
                  setAiRecommendation(null);
                  setAiError(null);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-health-500 focus:ring-2 focus:ring-health-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} ({patient.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="prescription-ai-symptoms" className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Current Symptoms
              </label>
              <textarea
                id="prescription-ai-symptoms"
                value={symptoms}
                onChange={(event) => {
                  setSymptoms(event.target.value);
                  setAiError(null);
                }}
                rows={4}
                placeholder="Fever, headache, nausea..."
                className="w-full resize-none rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm outline-none focus:border-health-500 focus:ring-2 focus:ring-health-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              />
            </div>

            {aiError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {aiError}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={aiLoading || patients.length === 0}
              className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? 'Generating...' : 'Generate AI Recommendation'}
            </button>

            {aiRecommendation && (
  <>
    <AIRecommendationCard
      recommendation={aiRecommendation}
      patient={selectedPatient}
    />

    {/* Doctor Prescription Builder */}

    <div className="mt-4 space-y-4 rounded-xl border border-slate-700 p-4">

      <h3 className="text-lg font-semibold">
        Doctor Prescription Selection
      </h3>

      {aiRecommendation.recommendedMedicines.map(
        (medicine, index) => (
          <label
            key={index}
            className="flex items-center gap-2"
          >
            <input
              type="checkbox"
              checked={
                !!selectedMedicines.find(
                  (m) => m.name === medicine.name
                )
              }
              onChange={() =>
                toggleMedicine(medicine)
              }
            />

            {medicine.name}
            {medicine.dosage
              ? ` (${medicine.dosage})`
              : ''}
          </label>
        )
      )}

      {/* Manual Medicine Section */}

      <div className="space-y-3">

        <h4 className="font-medium">
          Add Manual Medicine
        </h4>

        <input
          value={manualMedicine}
          onChange={(e) =>
            setManualMedicine(e.target.value)
          }
          placeholder="Medicine Name"
          className="w-full rounded-lg border p-2"
        />

        <input
          value={manualDosage}
          onChange={(e) =>
            setManualDosage(e.target.value)
          }
          placeholder="Dosage"
          className="w-full rounded-lg border p-2"
        />

        <button
          type="button"
          onClick={addManualMedicine}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Add Medicine
        </button>

      </div>

      {/* Final Prescription */}

      <div className="rounded-xl border p-4">

        <h4 className="mb-3 font-semibold">
          Final Prescription
        </h4>

        <ul className="space-y-2">

          {selectedMedicines.map(
            (medicine, index) => (
              <li key={index}>
                • {medicine.name}
                {medicine.dosage
                  ? ` - ${medicine.dosage}`
                  : ''}
              </li>
            )
          )}

          {manualMedicines.map(
            (medicine, index) => (
              <li key={`manual-${index}`}>
                • {medicine.name}
                {medicine.dosage
                  ? ` - ${medicine.dosage}`
                  : ''}
              </li>
            )
          )}

        </ul>

      </div>

      {/* Doctor Notes */}

      <textarea
        value={doctorNotes}
        onChange={(e) =>
          setDoctorNotes(e.target.value)
        }
        rows={4}
        placeholder="Doctor Notes"
        className="w-full rounded-lg border p-3"
      />

    </div>
  </>
)}

<p className="text-sm text-slate-500">
  Prescriptions are still recorded through medical records after clinical review.
</p>
            <div className="flex gap-3">
  <button
    type="button"
    onClick={handleSavePrescription}
    disabled={!aiRecommendation}
    className="flex-1 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
  >
    Save Prescription
  </button>

  <button
    type="button"
    onClick={closeModal}
    className="flex-1 rounded-xl gradient-health py-2.5 text-sm font-semibold text-white"
  >
    Close
  </button>
</div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default PrescriptionManagement;
