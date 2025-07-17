/* eslint-disable jsx-a11y/label-has-associated-control */
import type { NetworkModifierReturn, NetworkRule } from './options.hook';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { replacePlaceholders, testRedirectPattern } from './utils';

type InputFieldProps = {
  label: string;
  name: string;
  type?: 'text';
  placeholder?: string;
  value: string;
  onChange: (element: ChangeEvent<HTMLInputElement>) => void;
  colSize?: string;
};

// Reusable InputField Component
const InputField = ({ colSize, label, name, type = 'text', placeholder, value, onChange }: InputFieldProps) => (
  <div className={colSize ?? 'col-span-12 md:col-span-6'}>
    <label className="form-label-top">{label}:</label>
    <div className="flex space-x-4">
      <input
        type={type}
        name={name}
        className="form-input-field"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

type RadioGroupProps = {
  label: string;
  name: string;
  placeholder?: string;
  onChange: (element: ChangeEvent<HTMLInputElement>) => void;
  options: { label?: string; id?: string; value: string }[];
  value: string;
  colSize?: string;
};

// Reusable RadioGroup Component
const RadioGroup = ({ label, name, options, value, onChange }: RadioGroupProps) => (
  <div className="col-span-12 md:col-span-6">
    <label className="form-label-top">{label}:</label>
    <div className="flex space-x-4">
      {options.map(option => (
        <div key={option.value} className="flex items-center">
          <input
            id={option.id}
            name={name}
            type="radio"
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            className="form-input-field"
          />
          <label htmlFor={option.id} className="ml-2 text-sm text-gray-900">
            {option.label}
          </label>
        </div>
      ))}
    </div>
  </div>
);

type SelectFieldProps = RadioGroupProps & {
  onChange: (element: ChangeEvent<HTMLSelectElement>) => void;
};

const SelectField = ({ colSize, label, name, value, onChange, options }: SelectFieldProps) => (
  <div className={colSize ?? 'col-span-12 md:col-span-6'}>
    <label className="form-label-top">{label}:</label>
    <div className="flex space-x-4">
      <select className="form-input-field" value={value} name={name} onChange={onChange}>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label || option.value}
          </option>
        ))}
      </select>
    </div>
  </div>
);

type RuleFormProps = Pick<NetworkModifierReturn, 'handleSaveRule' | 'handleCancelEdit' | 'setFormData' | 'formData'>;

const RuleForm = ({ handleSaveRule, handleCancelEdit, setFormData, formData }: RuleFormProps) => {
  const [disabledSaveButton, setDisabledSaveButton] = useState<boolean>(false);
  const [testVariablesOutput, setTestVariablesOutput] = useState<{ label: string; value: string }[]>([]);
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    const newValue = type === 'radio' ? value === 'yes' : value;

    setFormData((prevFormData: NetworkRule) => ({
      ...prevFormData, // Spread the previous state to maintain other fields
      [name]: newValue, // Update only the field corresponding to the input's 'name'
    }));
  };

  const { redirectExampleURL, redirectToURL, redirectIncludePattern, isRedirect } = formData;
  useEffect(() => {
    if (isRedirect) {
      const matchPattern = testRedirectPattern({
        sourceUrl: redirectExampleURL,
        pattern: redirectIncludePattern,
      });

      if (matchPattern) {
        setDisabledSaveButton(false);

        const outputs = matchPattern.map((value, index) => ({
          label: '$' + index,
          value: value,
        }));

        const redirectUrl = replacePlaceholders({
          sourceUrl: redirectExampleURL,
          pattern: redirectIncludePattern,
          descUrl: redirectToURL,
        });
        outputs.push({
          label: 'Navigate to URL',
          value: redirectUrl,
        });
        setTestVariablesOutput(outputs);
      } else {
        setDisabledSaveButton(true);
        setTestVariablesOutput([]);
      }
    }
  }, [redirectExampleURL, redirectToURL, redirectIncludePattern, isRedirect]);

  return (
    <div className="" id="ruleFormContainer">
      <div className="rounded-t-lg bg-gray-700 p-1 text-white">
        <h2 className="text-xl font-semibold" id="ruleFormTitle">
          {formData.ruleId ? `Edit Rule: ${formData.ruleName}` : 'Add New Rule'}
        </h2>
      </div>
      <div className="p-2">
        <input type="hidden" id="ruleId" value={formData.ruleId} />

        <div className="mb-4 grid grid-cols-12 gap-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <RadioGroup
            label="Redirect"
            name="isRedirect"
            options={[
              { id: 'isRedirectYes', value: 'yes', label: 'Yes' },
              { id: 'isRedirectNo', value: 'no', label: 'No' },
            ]}
            value={formData.isRedirect ? 'yes' : 'no'}
            onChange={handleInputChange}
          />
          <InputField
            label="Rule Name"
            name="ruleName"
            placeholder="e.g., Block Ads, Mock API"
            value={formData.ruleName}
            onChange={handleInputChange}
          />
        </div>

        {!formData.isRedirect && (
          <div id="httpConfigContainer" className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h6 className="mb-2 text-lg font-semibold text-gray-800">🚀 HTTP Request Configuration</h6>
            <div className="flex flex-row gap-6">
              <div className="grid w-1/2 grid-cols-12 gap-2">
                <InputField
                  label="URL Filter"
                  name="urlFilter"
                  placeholder="*://example.com/* or *"
                  value={formData.urlFilter}
                  onChange={handleInputChange}
                  colSize="col-span-12"
                />
                <SelectField
                  label="HTTP Method"
                  name="urlMethod"
                  value={formData.urlMethod}
                  onChange={handleInputChange}
                  options={[
                    { value: 'POST' },
                    { value: 'GET' },
                    { value: 'PUT' },
                    { value: 'PATCH' },
                    { value: 'DELETE' },
                    { value: 'OPTION' },
                  ]}
                  colSize="col-span-12"
                />
              </div>

              <div className="w-1/2">
                <label className="form-label-top">Mock Response:</label>
                <div className="flex space-x-4">
                  <textarea
                    name="mockResponse"
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder='{"status": "success", "data": "mocked"}'
                    rows={5}
                    value={formData.mockResponse}
                    onChange={handleInputChange}></textarea>
                </div>
              </div>
            </div>
          </div>
        )}

        {formData.isRedirect && (
          <div id="redirectContainer" className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h6 className="mb-2 text-lg font-semibold text-gray-800">🔁 Redirect Configuration</h6>
            <div className="grid grid-cols-12 gap-6">
              <InputField
                label="Example URL"
                name="redirectExampleURL"
                type="text"
                value={formData.redirectExampleURL}
                onChange={handleInputChange}
              />
              <InputField
                label="Include pattern (Regex)"
                name="redirectIncludePattern"
                type="text"
                value={formData.redirectIncludePattern}
                onChange={handleInputChange}
              />
              <InputField
                label="Target URL"
                name="redirectToURL"
                type="text"
                value={formData.redirectToURL}
                onChange={handleInputChange}
              />
              <div className="col-span-12">
                <label className="block text-left text-sm font-medium text-gray-700">Variables Testing:</label>
                <ul id="redirectToURLExampleData" className="list-group mt-2 space-y-1 text-left">
                  {testVariablesOutput.map((item, index) => (
                    <li className="block text-sm font-medium text-gray-700" key={index}>
                      <strong>{item.label}:</strong>
                      <code>{item.value}</code>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <div id="requestHeaderContainer" className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h6 className="mb-2 text-lg font-semibold text-gray-800">📤 Request Header Details</h6>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-5">
                  <input
                    type="text"
                    name="reqHeaderName"
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Header Name (e.g., X-Auth-Token)"
                    value={formData.reqHeaderName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <select
                    name="reqHeaderOp"
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.reqHeaderOp}
                    onChange={handleInputChange}>
                    <option value="set">Set</option>
                    <option value="append">Append</option>
                    <option value="remove">Remove</option>
                  </select>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <input
                    type="text"
                    name="reqHeaderValue"
                    className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Value (leave blank to remove)"
                    value={formData.reqHeaderValue}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-6">
            <div id="responseHeaderContainer" className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h6 className="mb-2 text-lg font-semibold text-gray-800">📥 Response Header Details</h6>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-5">
                  <input
                    type="text"
                    name="resHeaderName"
                    className="form-input-field"
                    placeholder="Header Name (e.g., Access-Control-Allow-Origin)"
                    value={formData.resHeaderName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-span-12 md:col-span-2">
                  <select
                    name="resHeaderOp"
                    className="form-input-field"
                    value={formData.resHeaderOp}
                    onChange={handleInputChange}>
                    <option value="set">Set</option>
                    <option value="append">Append</option>
                    <option value="remove">Remove</option>
                  </select>
                </div>
                <div className="col-span-12 md:col-span-5">
                  <input
                    type="text"
                    name="resHeaderValue"
                    className="form-input-field"
                    placeholder="Value (leave blank to remove)"
                    value={formData.resHeaderValue}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 mt-4 flex justify-end space-x-2">
          <button
            id="saveRuleBtn"
            disabled={isRedirect && disabledSaveButton}
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => handleSaveRule()}>
            💾 Save Rule
          </button>
          <button
            id="cancelEditBtn"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            onClick={handleCancelEdit}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RuleForm;
