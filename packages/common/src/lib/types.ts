import { SeriesStatus, LanguageKey } from "./enums";

export type ExtensionMetadata = {
  id: string;
  name: string;
  url: string;
  translatedLanguage: LanguageKey | undefined;
};

export type PageRequesterData = {
  server: string;
  hash: string;
  numPages: number;
  pageFilenames: string[];
};

export type WebviewResponse = {
  text: string;
  url: string;
  title: string;
};

export type SeriesListResponse = {
  seriesList: Series[];
  hasMore: boolean;
};

export type Series = {
  id?: string;
  extensionId: string;
  sourceId: string;
  title: string;
  altTitles: string[];
  description: string;
  authors: string[];
  artists: string[];
  tags: string[];
  status: SeriesStatus;
  originalLanguageKey: LanguageKey;
  numberUnread: number;
  remoteCoverUrl: string;
  trackerKeys?: { [trackerId: string]: string };
  categories?: string[];
  preview?: boolean;
};

export type Chapter = {
  id?: string;
  seriesId?: string;
  sourceId: string;
  title: string;
  chapterNumber: string;
  volumeNumber: string;
  languageKey: LanguageKey;
  groupName: string;
  time: number;
  read: boolean;
};

export type Language = {
  key: LanguageKey;
  name: string;
  flagCode: string;
  iso639_1: string;
};

export type FilterValues = { [id: string]: unknown };

export type ExternalExtension = {
  id: string;
  languageKey: LanguageKey;
};

export type ConvertExternalDataResponse = {
  series: Series | undefined;
  chapters: Chapter[];
  messages?: {
    text: string;
    type: "info" | "warning" | "error";
  }[];
};

export type ApkExtensionInfo = {
  filePath: string;
  fileName: string;
  packageName: string;
  sourceKey: string;
  sourceName: string;
  version: string | undefined;
};

export type ApkSourceMapping = {
  apk: ApkExtensionInfo;
  extensionId: string | undefined;
  extensionName: string | undefined;
  supported: boolean;
};

export type ApkUnneededExtensionReason = 'unsupported-source' | 'not-selected-duplicate';

export type ApkUnneededExtensionCandidate = {
  filePath: string;
  fileName: string;
  packageName: string;
  sourceKey: string;
  version: string | undefined;
  reason: ApkUnneededExtensionReason;
  selectedPackageName: string | undefined;
};

export type ApkUnneededExtensionCleanupStatus =
  | 'dry-run'
  | 'removed'
  | 'skipped-missing-file'
  | 'skipped-outside-directory'
  | 'failed';

export type ApkUnneededExtensionCleanupEntry = {
  candidate: ApkUnneededExtensionCandidate;
  status: ApkUnneededExtensionCleanupStatus;
  error: string | undefined;
};

export type ApkUnneededExtensionCleanupResult = {
  apply: boolean;
  policy: ApkUnneededExtensionCleanupPolicy;
  apkDirectory: string;
  totalCandidates: number;
  removedCount: number;
  skippedCount: number;
  failedCount: number;
  results: ApkUnneededExtensionCleanupEntry[];
  unneededAfter: ApkUnneededExtensionCandidate[];
};

export type ApkUnneededExtensionCleanupPolicy = 'all-unneeded' | 'unsupported-only';

export type ApkUnneededExtensionCleanupOptions = {
  apply?: boolean;
  policy?: ApkUnneededExtensionCleanupPolicy;
};

export type ApkSelectionState = {
  [sourceKey: string]: {
    selectedPackageName: string;
    extensionId: string | undefined;
  };
};

export type ApkSelectionCleanupEntry = {
  sourceKey: string;
  selectedPackageName: string;
};

export type ApkSelectionCleanupResult = {
  removed: ApkSelectionCleanupEntry[];
  selectionState: ApkSelectionState;
};

export type ApkSelectionReason = 'newest-supported' | 'persisted-selection' | 'env-override';

export type ApkSelectionRecommendation = {
  sourceKey: string;
  selectedPackageName: string;
  selectedVersion: string | undefined;
  reason: ApkSelectionReason;
};

export type ApkActiveMapping = {
  sourceKey: string;
  selectedPackageName: string;
  extensionId: string;
  extensionName: string;
  filePath: string;
  version: string | undefined;
};

export type ApkRuntimeConfig = {
  apkExtensionsDirectory?: string;
  apkOnlyMode?: boolean;
  adapterRequiredMode?: boolean;
  lastRepair?: ApkLastRepairMetadata;
};

export type ApkLastRepairMetadata = {
  timestamp: string;
  appliedCount: number;
  skippedCount: number;
};

export type ApkRuntimeMessage = {
  type: 'info' | 'warning' | 'error';
  code: string;
  text: string;
};

export type ApkRuntimeDiagnostic = {
  type: 'info' | 'warning' | 'error';
  code: string;
  fileName: string;
  packageName: string;
  sourceKey: string;
  text: string;
};

export type ApkRuntimeHealthSummary = {
  totalApkFiles: number;
  totalSourceGroups: number;
  totalSupportedMappings: number;
  totalUnsupportedMappings: number;
  totalActiveMappings: number;
  totalAdapterReadyActiveMappings: number;
  warningCount: number;
  errorCount: number;
  hasBlockingErrors: boolean;
  blockingCodes: string[];
};

export type ApkRuntimeActionHintCode =
  | 'open-apk-directory-settings'
  | 'add-apk-files'
  | 'review-unsupported-apks'
  | 'review-source-selection'
  | 'select-supported-apk'
  | 'disable-apk-only-mode'
  | 'disable-adapter-required-mode'
  | 'select-adapter-supported-apk'
  | 'repair-applied'
  | 'repair-noop';

export type ApkRuntimeActionHint = {
  code: ApkRuntimeActionHintCode;
  type: 'info' | 'warning' | 'error';
  text: string;
};

export type ApkSourceOption = {
  fileName: string;
  packageName: string;
  version: string | undefined;
  sourceName: string;
  supported: boolean;
  extensionId: string | undefined;
  extensionName: string | undefined;
  hasAdapterProfile: boolean;
  isSelected: boolean;
  isActive: boolean;
};

export type ApkSourceGroup = {
  sourceKey: string;
  sourceName: string;
  extensionId: string | undefined;
  extensionName: string | undefined;
  selectedPackageName: string | undefined;
  options: ApkSourceOption[];
};

export type ApkSourceReadinessStatus =
  | 'ready'
  | 'no-selection'
  | 'selected-not-active'
  | 'unsupported-only'
  | 'adapter-required-missing-adapter';

export type ApkSourceReadinessSummary = {
  sourceKey: string;
  sourceName: string;
  status: ApkSourceReadinessStatus;
  selectedPackageName: string | undefined;
  optionCount: number;
  hasSupportedOption: boolean;
  hasActiveSelection: boolean;
  hasAdapterReadyOption: boolean;
};

export type ApkPreferredSelectionReason =
  | 'selected-still-valid'
  | 'newest-supported'
  | 'adapter-required-supported'
  | 'none-eligible';

export type ApkPreferredSelectionCandidate = {
  sourceKey: string;
  sourceName: string;
  suggestedPackageName: string | undefined;
  suggestedVersion: string | undefined;
  reason: ApkPreferredSelectionReason;
};

export type ApkPreferredSelectionOperationStatus =
  | 'applied'
  | 'skipped-no-source'
  | 'skipped-no-candidate'
  | 'skipped-invalid-candidate'
  | 'skipped-already-selected';

export type ApkPreferredSelectionOperationResult = {
  sourceKey: string;
  status: ApkPreferredSelectionOperationStatus;
  previousPackageName: string | undefined;
  selectedPackageName: string | undefined;
};

export type ApkPreferredSelectionBulkOperationResult = {
  selectionState: ApkSelectionState;
  appliedCount: number;
  skippedCount: number;
  results: ApkPreferredSelectionOperationResult[];
};

export type ApkMigrationStatus = 'adapter-ready' | 'mapped' | 'unmapped';

export type ApkMigrationEntry = {
  extensionId: string;
  extensionName: string;
  sourceKey: string;
  status: ApkMigrationStatus;
  availableApkCount: number;
  selectedPackageName: string | undefined;
  selectedVersion: string | undefined;
  hasSupportedMapping: boolean;
  hasActiveAdapter: boolean;
  hasAnyApkForSourceKey: boolean;
};

export type ApkMigrationReport = {
  summary: {
    total: number;
    adapterReady: number;
    mapped: number;
    unmapped: number;
  };
  entries: ApkMigrationEntry[];
};

export type ApkRuntimeState = {
  runtimeStateVersion: string;
  runtimeConfig: ApkRuntimeConfig;
  adapterSupportedSourceKeys: string[];
  healthSummary: ApkRuntimeHealthSummary;
  actionHints: ApkRuntimeActionHint[];
  apkExtensionsDirectory: string;
  apkExtensions: ApkExtensionInfo[];
  sourceMappings: ApkSourceMapping[];
  sourceGroups: ApkSourceGroup[];
  sourceReadinessSummaries: ApkSourceReadinessSummary[];
  preferredSelectionCandidates: ApkPreferredSelectionCandidate[];
  selectionState: ApkSelectionState;
  selectionRecommendations: ApkSelectionRecommendation[];
  activeMappings: ApkActiveMapping[];
  messages: ApkRuntimeMessage[];
  diagnostics: ApkRuntimeDiagnostic[];
};

export type ApkRuntimeRepairResult = {
  lastRepair: ApkLastRepairMetadata;
  operation: ApkPreferredSelectionBulkOperationResult;
  runtimeState: ApkRuntimeState;
};

export type ApkRuntimeDigest = {
  runtimeStateVersion: string;
  healthSummary: ApkRuntimeHealthSummary;
  lastRepair: ApkLastRepairMetadata | undefined;
};

export type ApkRuntimePollingDecision = {
  changed: boolean;
  digest: ApkRuntimeDigest;
};

export type ApkRuntimeQuickStatus = {
  changed: boolean;
  hasBlockingErrors: boolean;
  shouldAutoRepair: boolean;
  appliedCount: number;
  skippedCount: number;
  runtimePollIntervalHintMs: number;
  suggestedNextAction: ApkRuntimeQuickStatusNextAction;
};

export type ApkRuntimeQuickStatusNextAction = 'none' | 'fetch-runtime-state' | 'run-repair';

export type ApkRuntimeBootstrapResult = {
  quickStatus: ApkRuntimeQuickStatus;
  digest: ApkRuntimeDigest;
  runtimeState: ApkRuntimeState | undefined;
};

export type ApkDirectoryStatus = {
  defaultDirectory: string;
  currentDirectory: string;
  isUsingDefaultDirectory: boolean;
  directoryExists: boolean;
  apkCount: number;
};

export type ApkDefaultDirectoryEnforceResult = {
  runtimeConfig: ApkRuntimeConfig;
  directoryStatus: ApkDirectoryStatus;
};

export type ApkRuntimeSuggestedActionResult = {
  action: ApkRuntimeQuickStatusNextAction;
  performed: boolean;
  quickStatus: ApkRuntimeQuickStatus;
  digest: ApkRuntimeDigest;
  runtimeState: ApkRuntimeState | undefined;
  repairResult: ApkRuntimeRepairResult | undefined;
};

export type ApkRuntimeStabilizeStep = {
  action: ApkRuntimeQuickStatusNextAction;
  performed: boolean;
  runtimeStateVersion: string;
  hasBlockingErrors: boolean;
};

export type ApkRuntimeStabilizeResult = {
  steps: ApkRuntimeStabilizeStep[];
  repairsRun: number;
  finalQuickStatus: ApkRuntimeQuickStatus;
  finalDigest: ApkRuntimeDigest;
  finalRuntimeState: ApkRuntimeState | undefined;
};

export type ApkUiModel = {
  directoryStatus: ApkDirectoryStatus;
  bootstrap: ApkRuntimeBootstrapResult;
  migrationReport: ApkMigrationReport;
};

export type ApkRuntimeStartupPreparationResult = {
  directoryStatus: ApkDirectoryStatus;
  runtimeConfig: ApkRuntimeConfig;
  cleanupResult: ApkSelectionCleanupResult;
  autoSelectResult: ApkPreferredSelectionBulkOperationResult;
  runtimeState: ApkRuntimeState;
};

export type ApkRuntimeFilesystemSyncResult = {
  previousRuntimeStateVersion: string | undefined;
  runtimeStateVersion: string;
  changed: boolean;
  activeSourceKeys: string[];
  autoSelectResult: ApkPreferredSelectionBulkOperationResult;
  runtimeState: ApkRuntimeState;
};

export type ApkHoudokuPollingUpdateResult = {
  changed: boolean;
  previousRuntimeStateVersion: string | undefined;
  runtimeStateVersion: string;
  activeSourceKeys: string[];
  sync: ApkRuntimeFilesystemSyncResult;
  launchModel: ApkHoudokuLaunchModel;
};

export type ApkHoudokuMainProgramMethodOptions = {
  targetDirectory?: string;
  sourceKey?: string;
  requestedPackageName?: string;
  previousRuntimeStateVersion?: string;
  profile?: ApkRuntimeStrictStartupProfile;
};

export type ApkHoudokuApkMethodSetupResult = {
  targetDirectory: string;
  startupPreparation: ApkRuntimeStartupPreparationResult;
  readyStatus: ApkHoudokuReadyStatus;
  usesTargetDirectory: boolean;
  apkOnlyMode: boolean;
  activeSourceKeys: string[];
  success: boolean;
  reasons: string[];
};

export type ApkHoudokuApkSourceMethodSetupResult = {
  sourceKey: string;
  requestedPackageName: string | undefined;
  setup: ApkHoudokuApkMethodSetupResult;
  selectedPackageName: string | undefined;
  activePackageName: string | undefined;
  extensionId: string | undefined;
  extensionVisibleInGetExtensions: boolean;
  success: boolean;
  reasons: string[];
};

export type ApkHoudokuGoodSourceMethodSetupResult = {
  sourceKey: string;
  requestedPackageName: string | undefined;
  sourceSetup: ApkHoudokuApkSourceMethodSetupResult;
  usableByHoudoku: boolean;
  reasons: string[];
};

export type ApkHoudokuMainProgramMethodResult = {
  targetDirectory: string;
  sourceKey: string;
  requestedPackageName: string | undefined;
  goodSourceSetup: ApkHoudokuGoodSourceMethodSetupResult;
  pollingUpdate: ApkHoudokuPollingUpdateResult;
  success: boolean;
  reasons: string[];
};

export type ApkHoudokuApkBulkSourceEntryResult = {
  sourceKey: string;
  selectedPackageName: string | undefined;
  activePackageName: string | undefined;
  extensionId: string | undefined;
  extensionVisibleInGetExtensions: boolean;
  success: boolean;
  reasons: string[];
};

export type ApkHoudokuApkBulkSourceMethodSetupResult = {
  setup: ApkHoudokuApkMethodSetupResult;
  sourceResults: ApkHoudokuApkBulkSourceEntryResult[];
  successfulSourceKeys: string[];
  failedSourceKeys: string[];
  success: boolean;
  reasons: string[];
};

export type ApkHoudokuReadyLevel = 'ready' | 'warning' | 'blocked';

export type ApkHoudokuReadyStatus = {
  level: ApkHoudokuReadyLevel;
  isReady: boolean;
  runtimeStateVersion: string;
  directoryStatus: ApkDirectoryStatus;
  activeMappingCount: number;
  unsupportedApkCount: number;
  unneededApkCount: number;
  blockingCodes: string[];
  warningCodes: string[];
  suggestedNextAction: ApkRuntimeQuickStatusNextAction;
};

export type ApkRuntimeMaintenanceCycleOptions = {
  applyUnneededCleanup?: boolean;
  unneededCleanupPolicy?: ApkUnneededExtensionCleanupPolicy;
  stabilizeMaxSteps?: number;
};

export type ApkRuntimeMaintenanceCycleResult = {
  options: {
    applyUnneededCleanup: boolean;
    unneededCleanupPolicy: ApkUnneededExtensionCleanupPolicy;
    stabilizeMaxSteps: number;
  };
  startupPreparation: ApkRuntimeStartupPreparationResult;
  unneededCleanup: ApkUnneededExtensionCleanupResult;
  stabilization: ApkRuntimeStabilizeResult;
  readyStatus: ApkHoudokuReadyStatus;
};

export type ApkRuntimeStrictStartupGateOptions = {
  maintenanceOptions?: ApkRuntimeMaintenanceCycleOptions;
  requireReadyLevel?: ApkHoudokuReadyLevel;
  requireNoUnsupportedApks?: boolean;
  requireNoUnneededApks?: boolean;
};

export type ApkRuntimeStrictStartupGateResult = {
  options: {
    requireReadyLevel: ApkHoudokuReadyLevel;
    requireNoUnsupportedApks: boolean;
    requireNoUnneededApks: boolean;
  };
  maintenanceCycle: ApkRuntimeMaintenanceCycleResult;
  readyStatus: ApkHoudokuReadyStatus;
  passed: boolean;
  reasons: string[];
};

export type ApkRuntimeStrictStartupProfile = 'dev' | 'test' | 'prod';

export type ApkRuntimeStrictStartupGateRecommendation = {
  profile: ApkRuntimeStrictStartupProfile;
  options: ApkRuntimeStrictStartupGateOptions;
  notes: string[];
};

export type ApkStartupRemediationMethod =
  | 'setApkExtensionsDirectory'
  | 'refreshApkRuntimeState'
  | 'cleanupUnneededApkExtensions'
  | 'autoSelectAllPreferredApksWithResult'
  | 'setApkOnlyMode'
  | 'setAdapterRequiredMode'
  | 'runApkRuntimeMaintenanceCycle'
  | 'runApkRuntimeStrictStartupGate';

export type ApkStartupRemediationStep = {
  code: string;
  type: 'info' | 'warning' | 'error';
  text: string;
  method: ApkStartupRemediationMethod;
  autoRunnable: boolean;
};

export type ApkStartupRemediationPlan = {
  profile: ApkRuntimeStrictStartupProfile;
  recommendation: ApkRuntimeStrictStartupGateRecommendation;
  strictGate: ApkRuntimeStrictStartupGateResult;
  steps: ApkStartupRemediationStep[];
};

export type ApkStartupRemediationStepRunResult = {
  code: string;
  method: ApkStartupRemediationMethod;
  attempted: boolean;
  performed: boolean;
  note: string;
};

export type ApkStartupRemediationRunResult = {
  profile: ApkRuntimeStrictStartupProfile;
  plan: ApkStartupRemediationPlan;
  usedOverrides: ApkRuntimeStrictStartupGateOptions | undefined;
  beforeGate: ApkRuntimeStrictStartupGateResult;
  afterGate: ApkRuntimeStrictStartupGateResult;
  improved: boolean;
  stepResults: ApkStartupRemediationStepRunResult[];
};

export type ApkStartupRemediationOverrides = ApkRuntimeStrictStartupGateOptions;

export type ApkStartupRemediationUntilStableOptions = {
  profile?: ApkRuntimeStrictStartupProfile;
  overrides?: ApkStartupRemediationOverrides;
  maxRuns?: number;
};

export type ApkStartupRemediationUntilStableStopReason =
  | 'passed'
  | 'no-improvement'
  | 'max-runs';

export type ApkStartupRemediationUntilStableResult = {
  profile: ApkRuntimeStrictStartupProfile;
  maxRuns: number;
  runs: ApkStartupRemediationRunResult[];
  finalRun: ApkStartupRemediationRunResult;
  stopReason: ApkStartupRemediationUntilStableStopReason;
  converged: boolean;
};

export type ApkStartupExecutionSummary = {
  profile: ApkRuntimeStrictStartupProfile;
  runtimeStateVersion: string;
  directoryStatus: ApkDirectoryStatus;
  readyStatus: ApkHoudokuReadyStatus;
  recommendedGatePassed: boolean;
  recommendedGateReasons: string[];
  suggestedNextAction: ApkRuntimeQuickStatusNextAction;
  actionHintsCount: number;
  activeMappingCount: number;
  unsupportedApkCount: number;
  unneededApkCount: number;
};

export type ApkHoudokuTestReadyOptions = {
  profile?: ApkRuntimeStrictStartupProfile;
  overrides?: ApkStartupRemediationOverrides;
  maxRemediationRuns?: number;
};

export type ApkHoudokuTestReadyResult = {
  profile: ApkRuntimeStrictStartupProfile;
  maxRemediationRuns: number;
  usedOverrides: ApkStartupRemediationOverrides | undefined;
  remediation: ApkStartupRemediationUntilStableResult;
  summary: ApkStartupExecutionSummary;
  readyForHoudokuTest: boolean;
  reasons: string[];
};

export type ApkHoudokuLaunchModel = {
  profile: ApkRuntimeStrictStartupProfile;
  uiModel: ApkUiModel;
  startupSummary: ApkStartupExecutionSummary;
  recommendedStrictGate: ApkRuntimeStrictStartupGateRecommendation;
  remediationPlan: ApkStartupRemediationPlan;
  canRunHoudokuTest: boolean;
  blockerReasons: string[];
  usedOverrides?: ApkStartupRemediationOverrides;
};

export type ApkHoudokuLaunchModelOptions = {
  profile?: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion?: string;
  overrides?: ApkStartupRemediationOverrides;
};

export type ApkHoudokuTestingPreset = {
  profile: ApkRuntimeStrictStartupProfile;
  overrides: ApkStartupRemediationOverrides;
  notes: string[];
};

export type ApkHoudokuTestingModel = {
  profile: ApkRuntimeStrictStartupProfile;
  preset: ApkHoudokuTestingPreset;
  launchModel: ApkHoudokuLaunchModel;
  testReady: ApkHoudokuTestReadyResult;
};

export type ApkHoudokuTestingModelOptions = {
  profile?: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion?: string;
  maxRemediationRuns?: number;
  overrides?: ApkStartupRemediationOverrides;
};

export type ApkHoudokuIntegrationStep = {
  code: string;
  title: string;
  method: string;
  description: string;
  blocking: boolean;
};

export type ApkHoudokuIntegrationPlan = {
  profile: ApkRuntimeStrictStartupProfile;
  testingModel: ApkHoudokuTestingModel;
  steps: ApkHoudokuIntegrationStep[];
};

export type ApkHoudokuIntegrationStepExecutionResult = {
  code: string;
  method: string;
  executed: boolean;
  note: string;
};

export type ApkHoudokuIntegrationExecutionResult = {
  profile: ApkRuntimeStrictStartupProfile;
  requestedStepCode: string | undefined;
  stepResults: ApkHoudokuIntegrationStepExecutionResult[];
  launchModel: ApkHoudokuLaunchModel;
};

export type ApkHoudokuNextIntegrationStep = {
  profile: ApkRuntimeStrictStartupProfile;
  canRunHoudokuTest: boolean;
  step: ApkHoudokuIntegrationStep | undefined;
  reason: string;
};

export type ApkHoudokuNextIntegrationStepRunResult = {
  profile: ApkRuntimeStrictStartupProfile;
  nextStep: ApkHoudokuNextIntegrationStep;
  execution: ApkHoudokuIntegrationExecutionResult;
};

export type ApkHoudokuIntegrationControllerModel = {
  profile: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion: string | undefined;
  plan: ApkHoudokuIntegrationPlan;
  nextStep: ApkHoudokuNextIntegrationStep;
  canRunHoudokuTest: boolean;
  suggestedStepCode: string | undefined;
};

export type ApkHoudokuIntegrationControllerCycleResult = {
  profile: ApkRuntimeStrictStartupProfile;
  initialModel: ApkHoudokuIntegrationControllerModel;
  nextStepRun: ApkHoudokuNextIntegrationStepRunResult;
  refreshedModel: ApkHoudokuIntegrationControllerModel;
};

export type ApkHoudokuIntegrationCommandSuggestion = {
  stepCode: string;
  method: string;
  argsJson: string;
  blocking: boolean;
  description: string;
  isNextStep: boolean;
};

export type ApkHoudokuIntegrationCommandSuggestionsResult = {
  profile: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion: string | undefined;
  suggestions: ApkHoudokuIntegrationCommandSuggestion[];
  nextStep: ApkHoudokuNextIntegrationStep;
};

export type ApkHoudokuIntegrationCommandExecutionResult = {
  profile: ApkRuntimeStrictStartupProfile;
  command: ApkHoudokuIntegrationCommandSuggestion | undefined;
  allowlisted: boolean;
  parsedArgsValid: boolean;
  executed: boolean;
  error: string | undefined;
  stepExecution: ApkHoudokuIntegrationExecutionResult;
};

export type ApkHoudokuNextIntegrationCommandExecutionResult = {
  profile: ApkRuntimeStrictStartupProfile;
  nextStep: ApkHoudokuNextIntegrationStep;
  command: ApkHoudokuIntegrationCommandSuggestion | undefined;
  execution: ApkHoudokuIntegrationCommandExecutionResult;
};

export type ApkHoudokuIntegrationCommandPreflightResult = {
  profile: ApkRuntimeStrictStartupProfile;
  command: ApkHoudokuIntegrationCommandSuggestion | undefined;
  normalizedMethod: string | undefined;
  normalizedStepCode: string | undefined;
  allowlisted: boolean;
  parsedArgsValid: boolean;
  parsedArgs: unknown[] | undefined;
  error: string | undefined;
};

export type ApkHoudokuNextIntegrationCommandPreflightResult = {
  profile: ApkRuntimeStrictStartupProfile;
  nextStep: ApkHoudokuNextIntegrationStep;
  command: ApkHoudokuIntegrationCommandSuggestion | undefined;
  preflight: ApkHoudokuIntegrationCommandPreflightResult;
};

export type ApkHoudokuIntegrationCommandAuditEntry = {
  command: ApkHoudokuIntegrationCommandSuggestion;
  preflight: ApkHoudokuIntegrationCommandPreflightResult;
  dispatchReady: boolean;
};

export type ApkHoudokuIntegrationCommandAuditBundleResult = {
  profile: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion: string | undefined;
  nextStep: ApkHoudokuNextIntegrationStep;
  entries: ApkHoudokuIntegrationCommandAuditEntry[];
};

export type ApkHoudokuNextIntegrationCommandAuditBundleResult = {
  profile: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion: string | undefined;
  nextStep: ApkHoudokuNextIntegrationStep;
  command: ApkHoudokuIntegrationCommandSuggestion | undefined;
  preflight: ApkHoudokuIntegrationCommandPreflightResult;
  dispatchReady: boolean;
};

export type ApkHoudokuNextIntegrationCommandTransactionResult = {
  profile: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion: string | undefined;
  beforeAudit: ApkHoudokuNextIntegrationCommandAuditBundleResult;
  executed: boolean;
  execution: ApkHoudokuNextIntegrationCommandExecutionResult | undefined;
  afterAudit: ApkHoudokuNextIntegrationCommandAuditBundleResult;
  skippedReason: string | undefined;
};

export type ApkHoudokuNextIntegrationCommandTransactionLoopOptions = {
  profile?: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion?: string;
  maxRuns?: number;
};

export type ApkHoudokuNextIntegrationCommandTransactionLoopStopReason =
  | 'converged'
  | 'skipped-not-ready'
  | 'execution-failed'
  | 'reached-max-runs';

export type ApkHoudokuNextIntegrationCommandTransactionLoopResult = {
  profile: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion: string | undefined;
  maxRuns: number;
  runs: ApkHoudokuNextIntegrationCommandTransactionResult[];
  finalAudit: ApkHoudokuNextIntegrationCommandAuditBundleResult;
  stopReason: ApkHoudokuNextIntegrationCommandTransactionLoopStopReason;
  converged: boolean;
};

export type ApkHoudokuIntegrationCompletionPolicyOptions = {
  profile?: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion?: string;
  maxRuns?: number;
  requiredStepCodes?: string[];
  requireDispatchReady?: boolean;
  requireCanRunHoudokuTest?: boolean;
  stableNextStepRuns?: number;
};

export type ApkHoudokuIntegrationCompletionPolicy = {
  requiredStepCodes: string[];
  requireDispatchReady: boolean;
  requireCanRunHoudokuTest: boolean;
  stableNextStepRuns: number;
};

export type ApkHoudokuIntegrationCompletionPolicyResult = {
  profile: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion: string | undefined;
  policy: ApkHoudokuIntegrationCompletionPolicy;
  loop: ApkHoudokuNextIntegrationCommandTransactionLoopResult;
  completed: boolean;
  reasons: string[];
  completedRequiredStepCodes: string[];
  missingRequiredStepCodes: string[];
  stableNextStepRunsObserved: number;
};

export type ApkHoudokuIntegrationCompletionPolicyPreset = {
  profile: ApkRuntimeStrictStartupProfile;
  maxRuns: number;
  policy: ApkHoudokuIntegrationCompletionPolicy;
  notes: string[];
};

export type ApkHoudokuIntegrationCompletionPolicyPresetRecommendation = {
  previousRuntimeStateVersion: string | undefined;
  recommendedProfile: ApkRuntimeStrictStartupProfile;
  recommendedPreset: ApkHoudokuIntegrationCompletionPolicyPreset;
  reasons: string[];
  overrideOptions: ApkHoudokuIntegrationCompletionPolicyOptions;
  signals: {
    dispatchReady: boolean;
    canRunHoudokuTest: boolean;
    hasBlockingErrors: boolean;
    recommendedStrictGatePassed: boolean;
  };
};

export type ApkHoudokuIntegrationCompletionPolicyPresetRunResult = {
  recommendation: ApkHoudokuIntegrationCompletionPolicyPresetRecommendation;
  result: ApkHoudokuIntegrationCompletionPolicyResult;
};

export type ApkHoudokuIntegrationAutopilotStatus =
  | 'completed'
  | 'incomplete'
  | 'needs-attention';

export type ApkHoudokuIntegrationAutopilotSessionResult = {
  previousRuntimeStateVersion: string | undefined;
  recommendation: ApkHoudokuIntegrationCompletionPolicyPresetRecommendation;
  run: ApkHoudokuIntegrationCompletionPolicyPresetRunResult;
  status: ApkHoudokuIntegrationAutopilotStatus;
  summary: string;
  suggestedNextAction: string;
};

export type ApkHoudokuIntegrationAutopilotQuickStatus = {
  previousRuntimeStateVersion: string | undefined;
  runtimeStateVersion: string;
  changed: boolean;
  runtimeQuickStatus: ApkRuntimeQuickStatus;
  status: ApkHoudokuIntegrationAutopilotStatus;
  recommendedProfile: ApkRuntimeStrictStartupProfile;
  suggestedNextAction: string;
  reason: string;
};

export type ApkHoudokuTestingEntryModel = {
  previousRuntimeStateVersion: string | undefined;
  runtimeDigest: ApkRuntimeDigest;
  runtimeQuickStatus: ApkRuntimeQuickStatus;
  autopilotQuickStatus: ApkHoudokuTestingAutopilotQuickStatus;
  testingPreset: ApkHoudokuTestingPreset;
  completionRecommendation: ApkHoudokuTestingCompletionPolicyPresetRecommendation;
  canStartInteractiveTest: boolean;
  suggestedPrimaryAction: string;
};

export type ApkHoudokuTestingPrimaryActionRunResult = {
  previousRuntimeStateVersion: string | undefined;
  action: string;
  performed: boolean;
  reason: string;
  entryModel: ApkHoudokuTestingEntryModel;
  testReady: ApkHoudokuTestReadyResult | undefined;
  remediationPlan: ApkStartupRemediationPlan | undefined;
};

export type ApkHoudokuTestingSessionRunResult = {
  previousRuntimeStateVersion: string | undefined;
  beforeEntryModel: ApkHoudokuTestingEntryModel;
  primaryActionRun: ApkHoudokuTestingPrimaryActionRunResult;
  afterEntryModel: ApkHoudokuTestingEntryModel;
  completed: boolean;
  reason: string;
};

export type ApkHoudokuTestingSessionLoopOptions = {
  previousRuntimeStateVersion?: string;
  maxRuns?: number;
  stableCompletionRuns?: number;
};

export type ApkHoudokuTestingSessionLoopStopReason =
  | 'completed'
  | 'max-runs';

export type ApkHoudokuTestingSessionLoopResult = {
  previousRuntimeStateVersion: string | undefined;
  maxRuns: number;
  stableCompletionRuns: number;
  runs: ApkHoudokuTestingSessionRunResult[];
  finalSession: ApkHoudokuTestingSessionRunResult;
  completed: boolean;
  completedRunCount: number;
  stopReason: ApkHoudokuTestingSessionLoopStopReason;
  reason: string;
};

export type ApkHoudokuTestingControllerModelOptions = {
  previousRuntimeStateVersion?: string;
  maxRuns?: number;
  stableCompletionRuns?: number;
};

export type ApkHoudokuTestingControllerStatus = 'ready' | 'needs-action';

export type ApkHoudokuTestingControllerModel = {
  previousRuntimeStateVersion: string | undefined;
  entryModel: ApkHoudokuTestingEntryModel;
  canRunInteractiveTest: boolean;
  suggestedPrimaryAction: string;
  suggestedLoopOptions: {
    maxRuns: number;
    stableCompletionRuns: number;
  };
  status: ApkHoudokuTestingControllerStatus;
  reason: string;
};

export type ApkHoudokuTestingControllerCycleResult = {
  previousRuntimeStateVersion: string | undefined;
  initialModel: ApkHoudokuTestingControllerModel;
  loop: ApkHoudokuTestingSessionLoopResult;
  refreshedModel: ApkHoudokuTestingControllerModel;
  completed: boolean;
  suggestedNextAction: string;
  reason: string;
};

export type ApkHoudokuTestingAutopilotOptions = {
  previousRuntimeStateVersion?: string;
  maxRuns?: number;
  stableCompletionRuns?: number;
};

export type ApkHoudokuTestingAutopilotStatus = 'completed' | 'incomplete';

export type ApkHoudokuTestingAutopilotResult = {
  previousRuntimeStateVersion: string | undefined;
  controllerModel: ApkHoudokuTestingControllerModel;
  controllerCycle: ApkHoudokuTestingControllerCycleResult;
  launchModel: ApkHoudokuLaunchModel;
  status: ApkHoudokuTestingAutopilotStatus;
  completed: boolean;
  suggestedNextAction: string;
  reason: string;
};

export type ApkHoudokuTestingCommandSuggestion = {
  stepCode: string;
  method: string;
  argsJson: string;
  description: string;
  isNextStep: boolean;
};

export type ApkHoudokuTestingCommandSuggestionsResult = {
  previousRuntimeStateVersion: string | undefined;
  suggestions: ApkHoudokuTestingCommandSuggestion[];
  controllerModel: ApkHoudokuTestingControllerModel;
};

export type ApkHoudokuTestingCommandPreflightResult = {
  previousRuntimeStateVersion: string | undefined;
  command: ApkHoudokuTestingCommandSuggestion | undefined;
  normalizedMethod: string | undefined;
  normalizedStepCode: string | undefined;
  allowlisted: boolean;
  parsedArgsValid: boolean;
  parsedArgs: unknown[] | undefined;
  error: string | undefined;
};

export type ApkHoudokuTestingCommandExecutionResult = {
  previousRuntimeStateVersion: string | undefined;
  command: ApkHoudokuTestingCommandSuggestion | undefined;
  allowlisted: boolean;
  parsedArgsValid: boolean;
  executed: boolean;
  error: string | undefined;
  autopilot: ApkHoudokuTestingAutopilotResult;
};

export type ApkHoudokuNextTestingCommandExecutionResult = {
  previousRuntimeStateVersion: string | undefined;
  command: ApkHoudokuTestingCommandSuggestion | undefined;
  execution: ApkHoudokuTestingCommandExecutionResult;
};

export type ApkHoudokuNextTestingCommandPreflightResult = {
  previousRuntimeStateVersion: string | undefined;
  command: ApkHoudokuTestingCommandSuggestion | undefined;
  preflight: ApkHoudokuTestingCommandPreflightResult;
};

export type ApkHoudokuTestingCommandAuditEntry = {
  command: ApkHoudokuTestingCommandSuggestion;
  preflight: ApkHoudokuTestingCommandPreflightResult;
  dispatchReady: boolean;
};

export type ApkHoudokuTestingCommandAuditBundleResult = {
  previousRuntimeStateVersion: string | undefined;
  entries: ApkHoudokuTestingCommandAuditEntry[];
};

export type ApkHoudokuNextTestingCommandAuditBundleResult = {
  previousRuntimeStateVersion: string | undefined;
  command: ApkHoudokuTestingCommandSuggestion | undefined;
  preflight: ApkHoudokuTestingCommandPreflightResult;
  dispatchReady: boolean;
};

export type ApkHoudokuNextTestingCommandTransactionResult = {
  previousRuntimeStateVersion: string | undefined;
  beforeAudit: ApkHoudokuNextTestingCommandAuditBundleResult;
  executed: boolean;
  execution: ApkHoudokuNextTestingCommandExecutionResult | undefined;
  afterAudit: ApkHoudokuNextTestingCommandAuditBundleResult;
  skippedReason: string | undefined;
};

export type ApkHoudokuNextTestingCommandTransactionLoopOptions = {
  previousRuntimeStateVersion?: string;
  maxRuns?: number;
};

export type ApkHoudokuNextTestingCommandTransactionLoopStopReason =
  | 'converged'
  | 'skipped-not-ready'
  | 'execution-failed'
  | 'reached-max-runs';

export type ApkHoudokuNextTestingCommandTransactionLoopResult = {
  previousRuntimeStateVersion: string | undefined;
  maxRuns: number;
  runs: ApkHoudokuNextTestingCommandTransactionResult[];
  finalAudit: ApkHoudokuNextTestingCommandAuditBundleResult;
  stopReason: ApkHoudokuNextTestingCommandTransactionLoopStopReason;
  converged: boolean;
};

export type ApkHoudokuTestingCompletionPolicyOptions = {
  profile?: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion?: string;
  maxRuns?: number;
  requiredStepCodes?: string[];
  requireDispatchReady?: boolean;
  requireInteractiveTestReady?: boolean;
  stableNextStepRuns?: number;
};

export type ApkHoudokuTestingCompletionPolicy = {
  requiredStepCodes: string[];
  requireDispatchReady: boolean;
  requireInteractiveTestReady: boolean;
  stableNextStepRuns: number;
};

export type ApkHoudokuTestingCompletionPolicyResult = {
  profile: ApkRuntimeStrictStartupProfile;
  previousRuntimeStateVersion: string | undefined;
  policy: ApkHoudokuTestingCompletionPolicy;
  loop: ApkHoudokuNextTestingCommandTransactionLoopResult;
  finalControllerModel: ApkHoudokuTestingControllerModel;
  completed: boolean;
  reasons: string[];
  completedRequiredStepCodes: string[];
  missingRequiredStepCodes: string[];
  stableNextStepRunsObserved: number;
};

export type ApkHoudokuTestingCompletionPolicyPreset = {
  profile: ApkRuntimeStrictStartupProfile;
  maxRuns: number;
  policy: ApkHoudokuTestingCompletionPolicy;
  notes: string[];
};

export type ApkHoudokuTestingCompletionPolicyPresetRecommendation = {
  previousRuntimeStateVersion: string | undefined;
  recommendedProfile: ApkRuntimeStrictStartupProfile;
  recommendedPreset: ApkHoudokuTestingCompletionPolicyPreset;
  reasons: string[];
  overrideOptions: ApkHoudokuTestingCompletionPolicyOptions;
  signals: {
    dispatchReady: boolean;
    canRunInteractiveTest: boolean;
    hasBlockingErrors: boolean;
    recommendedStrictGatePassed: boolean;
  };
};

export type ApkHoudokuTestingCompletionPolicyPresetRunResult = {
  recommendation: ApkHoudokuTestingCompletionPolicyPresetRecommendation;
  result: ApkHoudokuTestingCompletionPolicyResult;
};

export type ApkHoudokuTestingAutopilotSessionResult = {
  previousRuntimeStateVersion: string | undefined;
  recommendation: ApkHoudokuTestingCompletionPolicyPresetRecommendation;
  run: ApkHoudokuTestingCompletionPolicyPresetRunResult;
  status: ApkHoudokuTestingAutopilotStatus;
  summary: string;
  suggestedNextAction: string;
};

export type ApkHoudokuTestingAutopilotQuickStatus = {
  previousRuntimeStateVersion: string | undefined;
  runtimeStateVersion: string;
  changed: boolean;
  runtimeQuickStatus: ApkRuntimeQuickStatus;
  status: ApkHoudokuTestingAutopilotStatus;
  recommendedProfile: ApkRuntimeStrictStartupProfile;
  suggestedNextAction: string;
  reason: string;
};

export type ApkHoudokuTestingExecutionSummary = {
  previousRuntimeStateVersion: string | undefined;
  runtimeStateVersion: string;
  changed: boolean;
  status: 'ready' | 'needs-action' | 'blocked';
  canStartInteractiveTest: boolean;
  dispatchReady: boolean;
  suggestedNextAction: string;
  reason: string;
  autopilotQuickStatus: ApkHoudokuTestingAutopilotQuickStatus;
  completionRecommendation: ApkHoudokuTestingCompletionPolicyPresetRecommendation;
};

export type ApkHoudokuTestingQuickStartResult = {
  previousRuntimeStateVersion: string | undefined;
  beforeSummary: ApkHoudokuTestingExecutionSummary;
  actionRun: ApkHoudokuTestingPrimaryActionRunResult | undefined;
  afterSummary: ApkHoudokuTestingExecutionSummary;
  ready: boolean;
  suggestedNextAction: string;
  reason: string;
};

export type ApkHoudokuTestingFunctionalRunResult = {
  previousRuntimeStateVersion: string | undefined;
  summary: ApkHoudokuTestingExecutionSummary;
  quickStart: ApkHoudokuTestingQuickStartResult;
  launchModel: ApkHoudokuLaunchModel;
  readyForInteractiveTest: boolean;
  suggestedNextAction: string;
  reason: string;
};

export type ApkHoudokuTestingDispatchModel = {
  previousRuntimeStateVersion: string | undefined;
  functionalRun: ApkHoudokuTestingFunctionalRunResult;
  nextCommand: ApkHoudokuTestingCommandSuggestion | undefined;
  dispatchMethod: string | undefined;
  dispatchArgsJson: string | undefined;
  canDispatchCommand: boolean;
  canStartInteractiveTest: boolean;
  suggestedClientAction: 'start-houdoku-test' | 'dispatch-command' | 'wait';
  reason: string;
};
