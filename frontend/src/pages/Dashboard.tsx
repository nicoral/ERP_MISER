import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getGraphDistribution,
  getGraphDistributionRequirements,
} from '../services/api/graphService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type {
  GraphDistribution,
  GraphDistributionRequirements,
} from '../types/graph';

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e42',
  '#f44336',
  '#9c27b0',
  '#2196f3',
  '#e91e63',
  '#673ab7',
  '#00bcd4',
  '#ff9800',
];

export const Dashboard = () => {
  const [graphDistribution, setGraphDistribution] = useState<
    GraphDistribution[]
  >([]);
  const [graphDistributionRequirements, setGraphDistributionRequirements] =
    useState<GraphDistributionRequirements[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingRequirements, setLoadingRequirements] = useState(true);

  useEffect(() => {
    getGraphDistributionRequirements().then(data => {
      setGraphDistributionRequirements(data);
      setLoadingRequirements(false);
    });

    getGraphDistribution().then(data => {
      setGraphDistribution(data);
      setLoadingEmployees(false);
    });
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gráfico de barras */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Requerimientos por mes
          </h3>
          {loadingRequirements ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={graphDistributionRequirements}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="PEN" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="USD" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        {/* Gráfico circular */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Distribución de empleados por rol
          </h3>
          {loadingEmployees ? (
            <div className="flex justify-center items-center h-full">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <ResponsiveContainer
                width="100%"
                height={window.innerWidth < 768 ? 180 : 200}
              >
                <PieChart>
                  <Pie
                    data={graphDistribution.map(item => ({
                      name: (() => {
                        const words = item.name.split(' ');
                        if (words.length === 1) {
                          return (
                            words[0].charAt(0).toUpperCase() +
                            words[0].slice(1).toLowerCase()
                          );
                        } else if (words.length === 2) {
                          return `${words[0].charAt(0).toUpperCase()}. ${words[1]}`;
                        } else {
                          return `${words[0].charAt(0).toUpperCase()}. ${words.slice(1).join(' ')}`;
                        }
                      })(),
                      value: item.value,
                    }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={window.innerWidth < 768 ? 60 : 70}
                  >
                    {graphDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  {/* Leyenda nativa solo en desktop */}
                  {window.innerWidth >= 768 && <Legend />}
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              {/* Leyenda custom solo para móvil */}
              <div className="block md:hidden mt-4 overflow-x-auto">
                <div className="flex space-x-4 min-w-max">
                  {graphDistribution.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center space-x-2"
                    >
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-xs whitespace-nowrap">
                        {(() => {
                          const words = item.name.split(' ');
                          if (words.length === 1) {
                            return (
                              words[0].charAt(0).toUpperCase() +
                              words[0].slice(1).toLowerCase()
                            );
                          } else if (words.length === 2) {
                            return `${words[0].charAt(0).toUpperCase()}. ${words[1]}`;
                          } else {
                            return `${words[0].charAt(0).toUpperCase()}. ${words.slice(1).join(' ')}`;
                          }
                        })()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
