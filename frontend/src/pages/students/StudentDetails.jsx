import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEdit, FiArrowLeft, FiPhone, FiAlertTriangle } from 'react-icons/fi';
import PageTransition from '../../components/ui/PageTransition';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorState from '../../components/ui/ErrorState';
import DataTable from '../../components/tables/DataTable';
import { studentService } from '../../services/studentService';
import { medicalRecordService } from '../../services/medicalRecordService';
import { getHealthStatusColor, formatDate } from '../../utils/helpers';

const tabs = ['Basic Info', 'Allergies', 'Medical Conditions', 'Emergency Contacts', 'Medical Records'];

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [records, setRecords] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentData, recordsData] = await Promise.all([
        studentService.getById(id),
        medicalRecordService.getByStudent(id),
      ]);
      setStudent(studentData);
      setRecords(recordsData.records || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSpinner className="py-20" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!student) return <div className="py-20 text-center">Student not found</div>;

  const recordColumns = [
    { key: 'date', label: 'Date', render: (r) => formatDate(r.date) },
    { key: 'diagnosis', label: 'Diagnosis' },
    { key: 'doctorName', label: 'Doctor' },
    {
      key: 'visitType',
      label: 'Type',
      render: (r) => (
        <span className="capitalize rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">{r.visitType}</span>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-health-600">
            <FiArrowLeft className="h-4 w-4" /> Back to Students
          </button>
          <Link
            to={`/students/${id}/edit`}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <FiEdit className="h-4 w-4" /> Edit
          </Link>
        </div>

        <div className="glass-card">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-health-500 to-primary-500 text-2xl font-bold text-white">
              {student.firstName[0]}{student.lastName[0]}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-slate-500">{student.studentId} · Age {student.age}</p>
              <div className="mt-2 flex gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getHealthStatusColor(student.healthStatus)}`}>
                  {student.healthStatus}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium dark:bg-slate-800">
                  Blood Type: {student.bloodType}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === i
                  ? 'bg-white text-health-700 shadow-sm dark:bg-slate-900 dark:text-health-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="glass-card">
          {activeTab === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['First Name', student.firstName],
                ['Last Name', student.lastName],
                ['Admission Number', student.studentId],
                ['Age', student.age],
                ['Gender', student.gender],
                ['Blood Type', student.bloodType],
                ['Date of Birth', formatDate(student.dateOfBirth)],
                ['Parent Email', student.parentEmail || 'N/A'],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-xs font-medium text-slate-500">{label}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{value}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 1 && (
            <div className="space-y-3">
              {student.allergies?.length ? student.allergies.map((a) => (
                <div key={a} className="flex items-center gap-3 rounded-xl border-l-4 border-l-red-500 bg-red-50 p-4 dark:bg-red-900/20">
                  <FiAlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="font-medium text-slate-900 dark:text-white">{a}</span>
                </div>
              )) : <p className="text-sm text-slate-500">No known allergies</p>}
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-3">
              {student.medicalConditions?.length ? student.medicalConditions.map((c) => (
                <div key={c} className="rounded-xl border-l-4 border-l-amber-500 bg-amber-50 p-4 dark:bg-amber-900/20">
                  <span className="font-medium text-slate-900 dark:text-white">{c}</span>
                </div>
              )) : <p className="text-sm text-slate-500">No medical conditions recorded</p>}
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-4">
              {student.emergencyContacts?.length ? student.emergencyContacts.map((contact, i) => (
                <div key={i} className="flex items-center gap-4 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-health-100 dark:bg-health-900/30">
                    <FiPhone className="h-5 w-5 text-health-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{contact.name}</p>
                    <p className="text-sm text-slate-500">{contact.relation} · {contact.phone}</p>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">No emergency contacts recorded</p>}
            </div>
          )}

          {activeTab === 4 && (
            <DataTable
              columns={recordColumns}
              data={records}
              onRowClick={(row) => navigate(`/medical-records/${row.id}`)}
              emptyMessage="No medical records found"
            />
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default StudentDetails;
