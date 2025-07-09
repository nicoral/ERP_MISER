import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import MyserLogo from '../../assets/myser-logo.jpg';
// Dummy data for demo
const DUMMY_ENTRY_PARTS = [
  {
    id: 1,
    code: 'PI-001',
    date: '2024-06-01',
    warehouse: 'Almacén Central',
    order: 'OC-001',
    receptionist: 'NOA ALVAREZ JOSE LUIS',
    items: [
      {
        id: 1,
        code: 'P-001',
        name: 'Producto 1',
        unit: 'UND',
        quantity: 10,
        received: 10,
        conform: true,
        qualityCert: true,
        guide: true,
        inspection: 'ACEPTADO',
        observation: '',
      },
      {
        id: 2,
        code: 'P-002',
        name: 'Producto 2',
        unit: 'UND',
        quantity: 5,
        received: 4,
        conform: false,
        qualityCert: false,
        guide: true,
        inspection: 'OBSERVADO',
        observation: 'Faltó 1 unidad',
      },
    ],
  },
];

export const EntryPartDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Simular fetch
  const entryPart = DUMMY_ENTRY_PARTS.find(p => p.id.toString() === id);

  if (!entryPart) return <LoadingSpinner />;

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <img src={MyserLogo} alt="MYSER Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                PARTE DE INGRESO
              </h1>
              <h2 className="text-sm text-gray-600 dark:text-gray-400">
                SISTEMA INTEGRADO DE GESTIÓN
              </h2>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">CÓDIGO</p>
            <p className="text-lg font-bold">MYS-LG-FT-15</p>
          </div>
        </div>
      </div>

      {/* Info principal */}
      <div className="border-b border-gray-200 pb-4 dark:border-gray-700 grid grid-cols-5 gap-4 mb-6 text-sm">
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">N° Parte</p>
          <p>{entryPart.code}</p>
        </div>
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Fecha</p>
          <p>{entryPart.date}</p>
        </div>
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Almacén</p>
          <p>{entryPart.warehouse}</p>
        </div>
        <div className="border-r border-gray-200 dark:border-gray-700">
          <p className="font-medium mb-1">Orden de Compra</p>
          <p>{entryPart.order}</p>
        </div>
        <div>
          <p className="font-medium mb-1">Recepcionista</p>
          <p>{entryPart.receptionist}</p>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="mb-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Código
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Descripción
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                UND
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cant. Ordenada
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cant. Recibida
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Conforme
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Cert. Calidad
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Guía Remisión
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Inspección
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Observaciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {entryPart.items.map(item => (
              <tr key={item.id}>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {item.code}
                </td>
                <td className="px-3 py-2 text-sm">{item.name}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm">
                  {item.unit}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                  {item.quantity}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-right">
                  {item.received}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                  {item.conform ? 'Sí' : 'No'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                  {item.qualityCert ? 'Sí' : 'No'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                  {item.guide ? 'Sí' : 'No'}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-center">
                  {item.inspection}
                </td>
                <td className="px-3 py-2 text-sm">{item.observation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Volver
        </button>
      </div>
    </div>
  );
};
