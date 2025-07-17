import { useEffect, useState } from 'react';

const EMPTY_RULE = {
  ruleId: '',
  isRedirect: false,
  ruleName: '',
  urlMethod: 'POST',
  urlFilter: '',
  redirectExampleURL: 'https://www.google.com/search?hl=en&q=youtube',
  redirectIncludePattern:
    '^(?:https?:\/\/)?(?:www\\.)?google\\.com(?:\\/[^\\?#]*)?(?:\\?|&)(?:[^&]*&)?hl=([^&]*)&q=([^&]*)(?:&.*)?$',
  redirectToURL: 'https://duckduckgo.com/?q=$1$2',
  mockResponse: '',
  reqHeaderName: '',
  reqHeaderOp: 'set',
  reqHeaderValue: '',
  resHeaderName: '',
  resHeaderOp: 'set',
  resHeaderValue: '',
  disable: false,
};

export type NetworkRule = {
  disable: boolean;
  ruleId: string;
  isRedirect: boolean;
  ruleName: string;
  urlMethod: string;
  urlFilter: string;
  redirectExampleURL: string;
  redirectIncludePattern: string;
  redirectToURL: string;
  mockResponse: string;
  reqHeaderName: string;
  reqHeaderOp: string;
  reqHeaderValue: string;
  resHeaderName: string;
  resHeaderOp: string;
  resHeaderValue: string;
};

export type NetworkModifierReturn = {
  configs: NetworkRule[];
  handleSaveRule: () => void;
  handleCancelEdit: () => void;
  formData: NetworkRule;
  setFormData: React.Dispatch<React.SetStateAction<NetworkRule>>;
  handleDeleteRule: (ruleId: string) => void;
  handleClickEditRule: (ruleId: string) => void;
  showRuleForm: boolean;
  handleClickAddNewRule: () => void;
  handleDisableRule: (ruleId: string, disabled: boolean) => void;
};

export const useOptionsHook = (): NetworkModifierReturn => {
  const [configs, setConfigs] = useState<NetworkRule[]>([]);
  const [showRuleForm, setShowRuleForm] = useState(true);

  const [formData, setFormData] = useState<NetworkRule>(EMPTY_RULE);

  useEffect(() => {
    chrome.storage.local.get('mockConfigs', data => {
      setConfigs(data.mockConfigs || []);
      console.log('data.mockConfigs', data.mockConfigs);
    });
  }, []);

  const saveAndUpdate = (newConfigs: NetworkRule[]) => {
    chrome.storage.local.set({ mockConfigs: newConfigs });
  };

  const handleSaveRule = () => {
    const clonedConfigs = [...configs];
    if (formData.ruleId) {
      const matchConfigIndex = configs.findIndex(r => r.ruleId === formData.ruleId);
      clonedConfigs[matchConfigIndex] = formData;
    } else {
      formData.ruleId = crypto.randomUUID();
      clonedConfigs.push(formData);
    }

    setConfigs(clonedConfigs);
    saveAndUpdate(clonedConfigs);
    console.log('clonedConfigs', clonedConfigs);
  };

  const handleCancelEdit = () => {
    setShowRuleForm(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    const newConfig = configs.filter(r => r.ruleId !== ruleId);
    setConfigs(newConfig);
    saveAndUpdate(newConfig);
    console.log(`Deleted rule with ID: ${ruleId}`);
  };

  const handleClickEditRule = (ruleId: string) => {
    const matchConfig = configs.find(r => r.ruleId === ruleId);
    if (matchConfig) {
      setFormData(matchConfig);
    } else {
      alert('Rule not found');
    }
  };

  const handleDisableRule = (ruleId: string, disabled: boolean) => {
    const clonedConfigs = [...configs];

    const matchConfigIndex = configs.findIndex(r => r.ruleId === ruleId);
    clonedConfigs[matchConfigIndex].disable = disabled;
    setConfigs(clonedConfigs);
    saveAndUpdate(clonedConfigs);
  };

  const handleClickAddNewRule = () => {
    setFormData(EMPTY_RULE);
    setShowRuleForm(true);
  };

  return {
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
  };
};
