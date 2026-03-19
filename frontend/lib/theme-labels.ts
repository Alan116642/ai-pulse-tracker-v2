const themeLabels: Record<string, string> = {
  agent: "Agent 与工作流",
  developer_tooling: "开发工具化",
  multimodal: "多模态",
  enterprise: "企业化落地",
  open_source: "开源扩散"
};

const mergeTypeLabels: Record<string, string> = {
  same_event: "主事件",
  event_update: "更新链",
  duplicate: "重复来源"
};

const tierLabels: Record<string, string> = {
  T0: "T0 官方源",
  T1: "T1 官方账号",
  T2: "T2 社区首发",
  T3: "T3 科技媒体",
  T4: "T4 二次转载"
};

export function labelTheme(value: string) {
  return themeLabels[value] ?? value;
}

export function labelMergeType(value: string) {
  return mergeTypeLabels[value] ?? value;
}

export function labelTier(value: string) {
  return tierLabels[value] ?? value;
}
