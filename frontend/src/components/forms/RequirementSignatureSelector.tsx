import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MultiSelect } from '../common/MultiSelect';

interface RequirementSignatureSelectorProps {
  onConfigurationChange: (signatures: string[]) => void;
}

const SIGNATURE_OPTIONS = [
  { label: 'Solicitante', value: 'SOLICITANTE' },
  { label: 'Oficina Técnica', value: 'OFICINA_TECNICA' },
  { label: 'Administración', value: 'ADMINISTRACION' },
  { label: 'Gerencia', value: 'GERENCIA' },
];

export const RequirementSignatureSelector: React.FC<
  RequirementSignatureSelectorProps
> = ({ onConfigurationChange }) => {
  const [selectedSignatures, setSelectedSignatures] = useState<string[]>([
    'SOLICITANTE',
    'OFICINA_TECNICA',
    'ADMINISTRACION',
    'GERENCIA',
  ]);

  const handleSignaturesChange = (signatures: string[]) => {
    setSelectedSignatures(signatures);
    onConfigurationChange(signatures);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Firmas Requeridas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Selecciona las firmas que serán requeridas para este requerimiento.
            Por defecto se incluyen todas las firmas.
          </p>

          <MultiSelect
            label="Firmas requeridas"
            options={SIGNATURE_OPTIONS}
            value={selectedSignatures}
            onChange={handleSignaturesChange}
            placeholder="Seleccionar firmas..."
          />

          <p className="text-xs text-gray-500">
            Nota: La firma de Gerencia se aplicará automáticamente según el
            monto del requerimiento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
