import { FormInput } from '../../../components/common/FormInput';
import { FormSelect } from '../../../components/common/FormSelect';
import { FormText } from '../../../components/common/FormText';
import { FormInputDate } from '../../../components/common/FormInputDate';
import { FormInputFile } from '../../../components/common/FormInputFile';
import { ADMINISTRATION_TEXTS } from '../../../config/texts';

export const GeneralSettingsForm = () => (
  <form className="mt-6 space-y-4">
    <FormInput
      label={ADMINISTRATION_TEXTS.generalForm.companyName}
      placeholder="Ej: Mi Empresa S.A."
      type="text"
    />
    <FormInput
      label={ADMINISTRATION_TEXTS.generalForm.contactEmail}
      placeholder="correo@empresa.com"
      type="email"
    />
    <FormInput
      label={ADMINISTRATION_TEXTS.generalForm.phone}
      placeholder="+34 600 000 000"
      type="tel"
    />
    <FormText
      label={ADMINISTRATION_TEXTS.generalForm.address}
      placeholder="Dirección fiscal"
    />
    <FormSelect label={ADMINISTRATION_TEXTS.generalForm.currency}>
      <option>EUR</option>
      <option>USD</option>
      <option>MXN</option>
    </FormSelect>
    <FormSelect label={ADMINISTRATION_TEXTS.generalForm.language}>
      <option>Español</option>
      <option>Inglés</option>
    </FormSelect>
    <FormSelect label={ADMINISTRATION_TEXTS.generalForm.timezone}>
      <option>GMT-3</option>
      <option>GMT-5</option>
      <option>GMT+1</option>
    </FormSelect>
    <FormInputDate label={ADMINISTRATION_TEXTS.generalForm.startDate} />
    <FormInputFile label={ADMINISTRATION_TEXTS.generalForm.logo} />
    <button
      type="submit"
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
    >
      {ADMINISTRATION_TEXTS.generalForm.save}
    </button>
  </form>
);
