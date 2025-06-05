import React from "react";
import { FormInput } from "../../../components/common/FormInput";
import { FormSelect } from "../../../components/common/FormSelect";
import { FormCheckbox } from "../../../components/common/FormCheckbox";
import { FormInputDate } from "../../../components/common/FormInputDate";
import { FormText } from "../../../components/common/FormText";
import { BlockIcon, EditIcon, EyeIcon, TrashIcon } from "../../../components/common/Icons";
import { ADMINISTRATION_TEXTS } from "../../../config/texts";

export const UserRolesForm = () => (
  <div className="mt-6">
    <div className="mb-4 flex justify-between items-center">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{ADMINISTRATION_TEXTS.panels.users.title}</h3>
      <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">{ADMINISTRATION_TEXTS.usersForm.add}</button>
    </div>
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden mb-6">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{ADMINISTRATION_TEXTS.usersForm.name}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{ADMINISTRATION_TEXTS.usersForm.email}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{ADMINISTRATION_TEXTS.usersForm.role}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{ADMINISTRATION_TEXTS.usersForm.status}</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{ADMINISTRATION_TEXTS.usersForm.edit}</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Juan Pérez</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">juan@empresa.com</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Administrador</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Activo</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
              <button
                title={ADMINISTRATION_TEXTS.usersForm.view}
                className="p-2 rounded transition-colors hover:bg-blue-100 dark:hover:bg-blue-900 bg-transparent"
              >
                <EyeIcon className="w-5 h-5 text-green-600" />
              </button>
              <button
                title={ADMINISTRATION_TEXTS.usersForm.edit}
                className="p-2 rounded transition-colors hover:bg-blue-100 dark:hover:bg-blue-900 bg-transparent"
              >
                <EditIcon className="w-5 h-5 text-blue-600" />
              </button>
              <button
                title={ADMINISTRATION_TEXTS.usersForm.block}
                className="p-2 rounded transition-colors hover:bg-red-100 dark:hover:bg-red-900 bg-transparent"
              >
                <BlockIcon className="w-5 h-5 text-red-600" />
              </button>
              <button
                title={ADMINISTRATION_TEXTS.usersForm.delete}
                className="p-2 rounded transition-colors hover:bg-red-100 dark:hover:bg-red-900 bg-transparent"
              >
                <TrashIcon className="w-5 h-5 text-red-600" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <form className="space-y-4 border-t pt-4">
      <h4 className="font-semibold">{ADMINISTRATION_TEXTS.usersForm.edit}</h4>
      <FormInput label={ADMINISTRATION_TEXTS.usersForm.name} type="text" />
      <FormInput label={ADMINISTRATION_TEXTS.usersForm.email} type="email" />
      <FormInputDate label={ADMINISTRATION_TEXTS.usersForm.date} />
      <FormText label={ADMINISTRATION_TEXTS.usersForm.notes} placeholder="Notas adicionales sobre el usuario" />
      <FormSelect label={ADMINISTRATION_TEXTS.usersForm.role}>
        <option>Administrador</option>
        <option>Usuario</option>
        <option>Invitado</option>
      </FormSelect>
      <FormSelect label={ADMINISTRATION_TEXTS.usersForm.status}>
        <option>Activo</option>
        <option>Inactivo</option>
      </FormSelect>
      <div>
        <label className="block font-medium mb-1">{ADMINISTRATION_TEXTS.usersForm.permissions}</label>
        <div className="flex gap-4">
          <FormCheckbox label="Ver" />
          <FormCheckbox label="Editar" />
          <FormCheckbox label="Eliminar" />
        </div>
      </div>
      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">{ADMINISTRATION_TEXTS.usersForm.save}</button>
    </form>
  </div>
) 