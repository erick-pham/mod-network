import { useOptionsHook } from './options.hook';
import RuleForm from './RuleForm';
import type { NetworkRule } from './options.hook';
import type { ReactElement } from 'react';

export default function NetworkModifier() {
  const {
    configs,
    handleSaveRule,
    handleCancelEdit,
    formData,
    setFormData,
    handleDeleteRule,
    handleClickEditRule,
    showRuleForm,
    handleClickAddNewRule,
    handleDisableRule,
  } = useOptionsHook();

  return (
    <div className="container py-12">
      <h1 className="mb-6 text-2xl font-bold text-blue-600">🔧 Network Modifier</h1>
      <div className="mb-6 rounded bg-white shadow">
        <div className="flex items-center justify-between rounded-t bg-blue-600 px-4 py-3 text-white">
          <h2 className="text-lg font-semibold">Current Rules</h2>
          <button
            className="rounded border border-blue-600 bg-white px-3 py-1 text-sm text-blue-600 hover:bg-blue-50"
            onClick={handleClickAddNewRule}>
            ➕ Add New Rule
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-[5%] p-2 text-left">#</th>
                <th className="w-[5%] p-2 text-left">Enable</th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Modified description</th>
                <th className="w-[5%] p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {configs.map(
                (item: NetworkRule, index: number): ReactElement => (
                  <tr key={item.ruleId}>
                    <td className="w-[5%] p-2 text-left">{index + 1}</td>
                    <td className="w-[5%] p-2 text-left">
                      <input
                        type="checkbox"
                        checked={!item.disable}
                        onChange={() => {
                          handleDisableRule(item.ruleId, !item.disable);
                        }}
                      />
                    </td>
                    <td className="p-2 text-left">{item.ruleName}</td>
                    <td className="p-2 text-left">URL Filter</td>
                    <td className="w-[5%] p-2 text-right">
                      <div className="mb-4 flex justify-end space-x-2">
                        <button
                          className="rounded-md bg-indigo-600 px-2 py-1 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-indigo-600"
                          onClick={() => handleClickEditRule(item.ruleId)}>
                          Edit
                        </button>
                        <button
                          className="rounded-md bg-red-600 px-2 py-1 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-600"
                          onClick={() => handleDeleteRule(item.ruleId)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}

              {configs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No rules configured yet. Click "Add New Rule" to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mb-6 rounded-t-lg bg-white shadow">
        {showRuleForm && (
          <RuleForm
            handleSaveRule={handleSaveRule}
            handleCancelEdit={handleCancelEdit}
            formData={formData}
            setFormData={setFormData}
          />
        )}
      </div>
    </div>
  );
}
