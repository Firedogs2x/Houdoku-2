import { BrowserWindow } from 'electron';
import {
  ApkActiveMapping,
  ApkDefaultDirectoryEnforceResult,
  ApkDirectoryStatus,
  ApkExtensionInfo,
  ApkLastRepairMetadata,
  ApkPreferredSelectionBulkOperationResult,
  ApkPreferredSelectionOperationResult,
  ApkMigrationReport,
  ApkPreferredSelectionCandidate,
  ApkRuntimeActionHint,
  ApkRuntimeBootstrapResult,
  ApkRuntimeDigest,
  ApkRuntimeHealthSummary,
  ApkRuntimePollingDecision,
  ApkRuntimeQuickStatus,
  ApkRuntimeRepairResult,
  ApkRuntimeStabilizeResult,
  ApkRuntimeSuggestedActionResult,
  ApkRuntimeStartupPreparationResult,
  ApkRuntimeFilesystemSyncResult,
  ApkHoudokuPollingUpdateResult,
  ApkHoudokuMainProgramMethodOptions,
  ApkHoudokuMainProgramMethodResult,
  ApkHoudokuApkMethodSetupResult,
  ApkHoudokuApkSourceMethodSetupResult,
  ApkHoudokuGoodSourceMethodSetupResult,
  ApkHoudokuApkBulkSourceMethodSetupResult,
  ApkRuntimeMaintenanceCycleOptions,
  ApkRuntimeMaintenanceCycleResult,
  ApkRuntimeStrictStartupGateOptions,
  ApkRuntimeStrictStartupGateRecommendation,
  ApkRuntimeStrictStartupProfile,
  ApkRuntimeStrictStartupGateResult,
  ApkStartupRemediationPlan,
  ApkStartupRemediationOverrides,
  ApkStartupRemediationRunResult,
  ApkStartupExecutionSummary,
  ApkHoudokuTestReadyOptions,
  ApkHoudokuTestReadyResult,
  ApkHoudokuLaunchModel,
  ApkHoudokuLaunchModelOptions,
  ApkHoudokuTestingPreset,
  ApkHoudokuTestingModel,
  ApkHoudokuTestingModelOptions,
  ApkHoudokuIntegrationPlan,
  ApkHoudokuIntegrationExecutionResult,
  ApkHoudokuNextIntegrationStep,
  ApkHoudokuNextIntegrationStepRunResult,
  ApkHoudokuIntegrationControllerModel,
  ApkHoudokuIntegrationControllerCycleResult,
  ApkHoudokuIntegrationCommandSuggestionsResult,
  ApkHoudokuIntegrationCommandSuggestion,
  ApkHoudokuIntegrationCommandExecutionResult,
  ApkHoudokuNextIntegrationCommandExecutionResult,
  ApkHoudokuIntegrationCommandPreflightResult,
  ApkHoudokuNextIntegrationCommandPreflightResult,
  ApkHoudokuIntegrationCommandAuditBundleResult,
  ApkHoudokuNextIntegrationCommandAuditBundleResult,
  ApkHoudokuNextIntegrationCommandTransactionResult,
  ApkHoudokuNextIntegrationCommandTransactionLoopOptions,
  ApkHoudokuNextIntegrationCommandTransactionLoopResult,
  ApkHoudokuIntegrationCompletionPolicyOptions,
  ApkHoudokuIntegrationCompletionPolicyResult,
  ApkHoudokuIntegrationCompletionPolicyPreset,
  ApkHoudokuIntegrationCompletionPolicyPresetRecommendation,
  ApkHoudokuIntegrationCompletionPolicyPresetRunResult,
  ApkHoudokuIntegrationAutopilotSessionResult,
  ApkHoudokuIntegrationAutopilotQuickStatus,
  ApkHoudokuTestingEntryModel,
  ApkHoudokuTestingPrimaryActionRunResult,
  ApkHoudokuTestingSessionRunResult,
  ApkHoudokuTestingSessionLoopOptions,
  ApkHoudokuTestingSessionLoopResult,
  ApkHoudokuTestingControllerModelOptions,
  ApkHoudokuTestingControllerModel,
  ApkHoudokuTestingControllerCycleResult,
  ApkHoudokuTestingAutopilotOptions,
  ApkHoudokuTestingAutopilotResult,
  ApkHoudokuTestingCommandSuggestion,
  ApkHoudokuTestingCommandSuggestionsResult,
  ApkHoudokuTestingCommandPreflightResult,
  ApkHoudokuTestingCommandExecutionResult,
  ApkHoudokuNextTestingCommandExecutionResult,
  ApkHoudokuNextTestingCommandPreflightResult,
  ApkHoudokuTestingCommandAuditBundleResult,
  ApkHoudokuNextTestingCommandAuditBundleResult,
  ApkHoudokuNextTestingCommandTransactionResult,
  ApkHoudokuNextTestingCommandTransactionLoopOptions,
  ApkHoudokuNextTestingCommandTransactionLoopResult,
  ApkHoudokuTestingCompletionPolicyOptions,
  ApkHoudokuTestingCompletionPolicyResult,
  ApkHoudokuTestingCompletionPolicyPreset,
  ApkHoudokuTestingCompletionPolicyPresetRecommendation,
  ApkHoudokuTestingCompletionPolicyPresetRunResult,
  ApkHoudokuTestingAutopilotSessionResult,
  ApkHoudokuTestingAutopilotQuickStatus,
  ApkHoudokuTestingExecutionSummary,
  ApkHoudokuTestingQuickStartResult,
  ApkHoudokuTestingFunctionalRunResult,
  ApkHoudokuTestingDispatchModel,
  ApkStartupRemediationUntilStableOptions,
  ApkStartupRemediationUntilStableResult,
  ApkHoudokuReadyStatus,
  ApkUiModel,
  ApkSelectionRecommendation,
  ApkSelectionCleanupResult,
  ApkRuntimeConfig,
  ApkRuntimeState,
  ApkSourceGroup,
  ApkSourceReadinessSummary,
  ApkSelectionState,
  ApkUnneededExtensionCleanupOptions,
  ApkSourceMapping,
  ApkUnneededExtensionCleanupResult,
  ApkUnneededExtensionCandidate,
  Chapter,
  ExtensionMetadata,
  FilterValues,
  PageRequesterData,
  Series,
  SeriesListResponse,
  ExternalExtension,
  ConvertExternalDataResponse,
  WebviewResponse,
} from './types';
import { ExternalClient, SettingType } from './enums';
import { FilterOption } from './filters';

/**
 * Get the version of the plugin package.
 *
 * @returns string of npm-style version
 */
export interface GetVersionFunc {
  (): string;
}

/**
 * Get a list of available extensions.
 *
 * @returns list of metadata and instantiated client for all extensions
 */
export interface GetExtensionsFunc {
  (): { [key: string]: { metadata: ExtensionMetadata; client: ExtensionClientInterface } };
}

/**
 * Get a series from the content source.
 *
 * @param id the id of the series on the content source
 * @returns the series populated with fields from the content source, or undefined
 */
export interface GetSeriesFunc {
  (seriesId: string): Promise<Series | undefined>;
}

/**
 * Request chapters for a series from the content source.
 *
 * @param id the id of the series on the content source
 * @returns a list of chapters for the series, populated with fields from the content source
 */
export interface GetChaptersFunc {
  (id: string): Promise<Chapter[]>;
}

/**
 * Request data for a PageRequesterData object containing values used to get individual page URLs.
 *
 * This function is to support handling content sources with a non-uniform method of getting page
 * URLs -- i.e. each chapter may be hosted on an arbitrary server, which can only be identified
 * after requesting the base URL. The PageRequesterData received is solely used for GetPageUrlsFunc.
 *
 * @param seriesSourceId
 * @param chapterSourceId
 * @returns the PageRequesterData for passing to any GetPageUrlsFunc call for the chapter
 */
export interface GetPageRequesterDataFunc {
  (seriesSourceId: string, chapterSourceId: string): Promise<PageRequesterData>;
}

/**
 * Get page URLs for a chapter.
 *
 * Strictly speaking, this function does not necessarily return precise URLs for a resource; it only
 * needs to return identifiers that can locate the actual page source (using the Series object if
 * necessary). Particularly, if the series is an archive file, this function returns a list of paths
 * within the archive that need to be extracted separately.
 *
 * @param pageRequesterData
 * @returns list of URLs that can be used to retrieve page data (using GetImageFunc)
 */
export interface GetPageUrlsFunc {
  (pageRequesterData: PageRequesterData): string[];
}

/**
 * Get resolved data for an image.
 *
 * The return value should either be a string to put inside the src tag of an HTML <img> (usually
 * the URL itself), or an ArrayBuffer that can be made into a Blob.
 *
 * @param series the series the image belongs to
 * @param url the url for this page, e.g. from GetPageUrlsFunc or Series.remoteCoverUrl
 * @returns promise for the data as described above
 */
export interface GetImageFunc {
  (series: Series, url: string): Promise<string | ArrayBuffer>;
}

/**
 * Search the content source for a series.
 *
 * @param text the user's search content, with any entered search params removed
 * @param params a map of user-specified parameters for searching. These are currently entered in
 * the form "key:value" like "author:oda" but this is not currently well-defined.
 * @param page the page number on the source
 * @returns SeriesListResponse with series that have fields set as available
 */
export interface GetSearchFunc {
  (text: string, page: number, filterValues: FilterValues): Promise<SeriesListResponse>;
}

/**
 * Get the directory for the content source (often equivalent to an empty search).
 *
 * @param page the page number on the source
 * @returns SeriesListResponse with series that have fields set as available
 */
export interface GetDirectoryFunc {
  (page: number, filterValues: FilterValues): Promise<SeriesListResponse>;
}

/**
 * Get the types for the extension's settings.
 *
 * @returns a map of settings for the extension and their SettingType
 */
export interface GetSettingTypesFunc {
  (): { [key: string]: SettingType };
}

/**
 * Get the current settings for the extension.
 *
 * @returns a map of settings for the extension (with default/initial values already set)
 */
export interface GetSettingsFunc {
  // biome-ignore lint/suspicious/noExplicitAny: external schema
  (): { [key: string]: any };
}

/**
 * Set the settings for the extension.
 *
 * Use GetSettingsFunc to see available fields and their types.
 *
 * @param settings a map of settings for the extension
 */
export interface SetSettingsFunc {
  // biome-ignore lint/suspicious/noExplicitAny: external schema
  (settings: { [key: string]: any }): void;
}

/**
 * Get supported extensions from external clients.
 *
 * Typically, there will only be one extension per client. However, there may be multiple
 * external extensions that correspond to one Houdoku extension. For example, Tachiyomi
 * has a unique ID for each MangaDex language, but Houdoku only has one MangaDex extension.
 *
 * External extension metadata is only relevant to the external client it is from. For example,
 * an external extension ID should only be used to differentiate it from other extensions
 * from the same client.
 *
 * @returns map of external clients and external extensions which correspond to this extension
 */
export interface GetExternalExtensionsFunc {
  (): { [key in ExternalClient]: ExternalExtension[] };
}

/**
 *
 * The shape of externalData depends on the externalExtension. These are not yet
 * strictly defined.
 *
 * @param externalClient external client the data is coming from
 * @param externalExtension external extension the data is coming from
 * @param externalData data for one series (optionally including chapter data) from the extension
 * @returns ConvertExternalDataResponse with parsed Series and Chapter list (if they were able
 * to be parsed) and optional messages array.
 */
export interface ConvertExternalDataFunc {
  (
    externalClient: ExternalClient,
    externalExtension: ExternalExtension,
    // biome-ignore lint/suspicious/noExplicitAny: external schema
    externalData: { [key: string]: any }
  ): ConvertExternalDataResponse;
}

/**
 * Get the extension's filter options.
 *
 * @returns List[FilterOption]
 */
export interface GetFilterOptionsFunc {
  (): FilterOption[];
}

export interface WebviewFunc {
  (
    url: string,
    options?: {
      httpReferrer?: string;
      userAgent?: string;
      extraHeaders?: string;
      postData?: (
        | { type: 'rawData'; bytes: Buffer }
        | {
            type: 'file';
            filePath: string;
            offset: number;
            length: number;
            modificationTime: number;
          }
      )[];
      baseURLForDataURL?: string;
    }
  ): Promise<WebviewResponse>;
}

export interface ExtensionClientInterface {
  webviewFn: WebviewFunc;
  // biome-ignore lint/suspicious/noExplicitAny: external schema
  settings: { [key: string]: any };

  getSeries: GetSeriesFunc;
  getChapters: GetChaptersFunc;
  getPageRequesterData: GetPageRequesterDataFunc;
  getPageUrls: GetPageUrlsFunc;
  getImage: GetImageFunc;
  getSearch: GetSearchFunc;
  getDirectory: GetDirectoryFunc;
  getSettingTypes: GetSettingTypesFunc;
  getSettings: GetSettingsFunc;
  setSettings: SetSettingsFunc;
  getFilterOptions: GetFilterOptionsFunc;
  getExternalExtensions: GetExternalExtensionsFunc;
  convertExternalData: ConvertExternalDataFunc;
}

export abstract class ExtensionClientAbstract implements ExtensionClientInterface {
  webviewFn: WebviewFunc;
  // biome-ignore lint/suspicious/noExplicitAny: external schema
  settings: { [key: string]: any } = {};

  constructor(webviewFn: WebviewFunc) {
    this.webviewFn = webviewFn;
  }

  getSeries!: GetSeriesFunc;
  getChapters!: GetChaptersFunc;
  getPageRequesterData!: GetPageRequesterDataFunc;
  getPageUrls!: GetPageUrlsFunc;
  getImage!: GetImageFunc;
  getSearch!: GetSearchFunc;
  getDirectory!: GetDirectoryFunc;
  getSettingTypes!: GetSettingTypesFunc;
  getSettings!: GetSettingsFunc;
  setSettings!: SetSettingsFunc;
  getFilterOptions!: GetFilterOptionsFunc;
  getExternalExtensions!: GetExternalExtensionsFunc;
  convertExternalData!: ConvertExternalDataFunc;
}

export interface TiyoClientInterface {
  spoofWindow: BrowserWindow;

  getVersion: GetVersionFunc;
  getExtensions: GetExtensionsFunc;
  getDefaultApkExtensionsDirectoryPath?: () => string;
  useDefaultApkExtensionsDirectory?: () => ApkRuntimeConfig;
  enforceDefaultApkDirectory?: () => ApkDefaultDirectoryEnforceResult;
  getApkDirectoryStatus?: () => ApkDirectoryStatus;
  getApkExtensionsDirectory?: () => string;
  getApkExtensions?: () => ApkExtensionInfo[];
  refreshApkExtensions?: () => ApkExtensionInfo[];
  getApkSourceMappings?: () => ApkSourceMapping[];
  getApkUnneededExtensions?: () => ApkUnneededExtensionCandidate[];
  cleanupUnneededApkExtensions?: (
    options?: boolean | ApkUnneededExtensionCleanupOptions
  ) => ApkUnneededExtensionCleanupResult;
  getApkSourceGroups?: () => ApkSourceGroup[];
  getApkSourceReadinessSummaries?: () => ApkSourceReadinessSummary[];
  getApkPreferredSelectionCandidates?: () => ApkPreferredSelectionCandidate[];
  getApkSelectionState?: () => ApkSelectionState;
  cleanupApkSelectionState?: () => ApkSelectionCleanupResult;
  autoSelectPreferredApkWithResult?: (sourceKey: string) => ApkPreferredSelectionOperationResult;
  autoSelectPreferredApk?: (sourceKey: string) => ApkSelectionState;
  autoSelectAllPreferredApksWithResult?: () => ApkPreferredSelectionBulkOperationResult;
  autoSelectAllPreferredApks?: () => ApkSelectionState;
  getApkSelectionRecommendations?: () => ApkSelectionRecommendation[];
  getActiveApkMappings?: () => ApkActiveMapping[];
  setApkSourceSelection?: (sourceKey: string, selectedPackageName: string) => ApkSelectionState;
  clearApkSourceSelection?: (sourceKey: string) => ApkSelectionState;
  getApkRuntimeConfig?: () => ApkRuntimeConfig;
  getLastApkRepairMetadata?: () => ApkLastRepairMetadata | undefined;
  setApkExtensionsDirectory?: (directory: string) => ApkRuntimeConfig;
  clearApkExtensionsDirectory?: () => ApkRuntimeConfig;
  setApkOnlyMode?: (enabled: boolean) => ApkRuntimeConfig;
  setAdapterRequiredMode?: (enabled: boolean) => ApkRuntimeConfig;
  getApkRuntimeHealthSummary?: () => ApkRuntimeHealthSummary;
  getApkRuntimeActionHints?: () => ApkRuntimeActionHint[];
  getApkRuntimeDigest?: () => ApkRuntimeDigest;
  hasApkRuntimeDigestChanged?: (runtimeStateVersion: string | undefined) => boolean;
  getApkRuntimePollingDecision?: (
    previousRuntimeStateVersion: string | undefined
  ) => ApkRuntimePollingDecision;
  getApkRuntimeQuickStatus?: (
    previousRuntimeStateVersion: string | undefined
  ) => ApkRuntimeQuickStatus;
  getApkRuntimeBootstrap?: (
    previousRuntimeStateVersion: string | undefined
  ) => ApkRuntimeBootstrapResult;
  runApkRuntimeSuggestedAction?: (
    previousRuntimeStateVersion: string | undefined
  ) => ApkRuntimeSuggestedActionResult;
  syncApkRuntimeWithFilesystem?: (
    previousRuntimeStateVersion?: string
  ) => ApkRuntimeFilesystemSyncResult;
  getApkHoudokuPollingUpdate?: (
    previousRuntimeStateVersion?: string,
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkHoudokuPollingUpdateResult;
  runApkHoudokuMainProgramMethod?: (
    options?: ApkHoudokuMainProgramMethodOptions
  ) => ApkHoudokuMainProgramMethodResult;
  stabilizeApkRuntimeState?: (maxSteps?: number) => ApkRuntimeStabilizeResult;
  prepareApkRuntimeForHoudokuStartup?: () => ApkRuntimeStartupPreparationResult;
  runApkHoudokuApkMethodSetup?: (targetDirectory?: string) => ApkHoudokuApkMethodSetupResult;
  runApkHoudokuApkSourceMethodSetup?: (
    sourceKey: string,
    targetDirectory?: string,
    requestedPackageName?: string
  ) => ApkHoudokuApkSourceMethodSetupResult;
  runApkHoudokuGoodSourceMethodSetup?: (
    sourceKey: string,
    targetDirectory?: string,
    requestedPackageName?: string
  ) => ApkHoudokuGoodSourceMethodSetupResult;
  runApkHoudokuApkBulkSourceMethodSetup?: (
    targetDirectory?: string
  ) => ApkHoudokuApkBulkSourceMethodSetupResult;
  runApkHoudokuInstalledApkMethodSetup?: () => ApkHoudokuApkBulkSourceMethodSetupResult;
  runApkRuntimeMaintenanceCycle?: (
    options?: ApkRuntimeMaintenanceCycleOptions
  ) => ApkRuntimeMaintenanceCycleResult;
  runApkRuntimeStrictStartupGate?: (
    options?: ApkRuntimeStrictStartupGateOptions
  ) => ApkRuntimeStrictStartupGateResult;
  getApkRecommendedStrictStartupGate?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkRuntimeStrictStartupGateRecommendation;
  runApkRecommendedStrictStartupGate?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkRuntimeStrictStartupGateResult;
  getApkStartupRemediationPlan?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkStartupRemediationPlan;
  runApkStartupRemediation?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkStartupRemediationRunResult;
  runApkStartupRemediationWithOverrides?: (
    profile?: ApkRuntimeStrictStartupProfile,
    overrides?: ApkStartupRemediationOverrides
  ) => ApkStartupRemediationRunResult;
  runApkStartupRemediationUntilStable?: (
    options?: ApkStartupRemediationUntilStableOptions
  ) => ApkStartupRemediationUntilStableResult;
  getApkStartupExecutionSummary?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkStartupExecutionSummary;
  runApkHoudokuTestReady?: (
    options?: ApkHoudokuTestReadyOptions
  ) => ApkHoudokuTestReadyResult;
  getApkHoudokuLaunchModel?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuLaunchModel;
  getApkHoudokuLaunchModelWithOverrides?: (
    options?: ApkHoudokuLaunchModelOptions
  ) => ApkHoudokuLaunchModel;
  getApkHoudokuTestingPreset?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkHoudokuTestingPreset;
  getApkHoudokuTestingModel?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingModel;
  getApkHoudokuTestingModelWithOptions?: (
    options?: ApkHoudokuTestingModelOptions
  ) => ApkHoudokuTestingModel;
  getApkHoudokuIntegrationPlan?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationPlan;
  runApkHoudokuIntegrationStep?: (
    profile?: ApkRuntimeStrictStartupProfile,
    stepCode?: string,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationExecutionResult;
  runApkHoudokuIntegrationPlan?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationExecutionResult;
  getApkNextHoudokuIntegrationStep?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationStep;
  runApkNextHoudokuIntegrationStep?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationStepRunResult;
  getApkHoudokuIntegrationControllerModel?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationControllerModel;
  runApkHoudokuIntegrationControllerCycle?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationControllerCycleResult;
  getApkHoudokuIntegrationCommandSuggestions?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCommandSuggestionsResult;
  preflightApkHoudokuIntegrationCommandSuggestion?: (
    command?: ApkHoudokuIntegrationCommandSuggestion,
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCommandPreflightResult;
  preflightApkHoudokuNextIntegrationCommandSuggestion?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationCommandPreflightResult;
  getApkHoudokuIntegrationCommandAuditBundle?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCommandAuditBundleResult;
  getApkHoudokuNextIntegrationCommandAuditBundle?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationCommandAuditBundleResult;
  runApkHoudokuNextIntegrationCommandTransaction?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationCommandTransactionResult;
  runApkHoudokuNextIntegrationCommandTransactions?: (
    options?: ApkHoudokuNextIntegrationCommandTransactionLoopOptions
  ) => ApkHoudokuNextIntegrationCommandTransactionLoopResult;
  runApkHoudokuNextIntegrationCommandTransactionsWithCompletionPolicy?: (
    options?: ApkHoudokuIntegrationCompletionPolicyOptions
  ) => ApkHoudokuIntegrationCompletionPolicyResult;
  getApkHoudokuIntegrationCompletionPolicyPreset?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkHoudokuIntegrationCompletionPolicyPreset;
  runApkHoudokuIntegrationCompletionPolicyPreset?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCompletionPolicyResult;
  getApkHoudokuIntegrationCompletionPolicyPresetRecommendation?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCompletionPolicyPresetRecommendation;
  runApkHoudokuIntegrationCompletionPolicyPresetRecommendation?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCompletionPolicyPresetRunResult;
  runApkHoudokuIntegrationAutopilotSession?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationAutopilotSessionResult;
  getApkHoudokuIntegrationAutopilotQuickStatus?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationAutopilotQuickStatus;
  getApkHoudokuTestingEntryModel?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingEntryModel;
  runApkHoudokuTestingPrimaryAction?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingPrimaryActionRunResult;
  runApkHoudokuTestingSession?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingSessionRunResult;
  runApkHoudokuTestingSessionLoop?: (
    options?: ApkHoudokuTestingSessionLoopOptions
  ) => ApkHoudokuTestingSessionLoopResult;
  getApkHoudokuTestingControllerModel?: (
    options?: ApkHoudokuTestingControllerModelOptions
  ) => ApkHoudokuTestingControllerModel;
  runApkHoudokuTestingControllerCycle?: (
    options?: ApkHoudokuTestingControllerModelOptions
  ) => ApkHoudokuTestingControllerCycleResult;
  runApkHoudokuTestingAutopilot?: (
    options?: ApkHoudokuTestingAutopilotOptions
  ) => ApkHoudokuTestingAutopilotResult;
  getApkHoudokuTestingCommandSuggestions?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCommandSuggestionsResult;
  preflightApkHoudokuTestingCommandSuggestion?: (
    command?: ApkHoudokuTestingCommandSuggestion,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCommandPreflightResult;
  runApkHoudokuTestingCommandSuggestion?: (
    command?: ApkHoudokuTestingCommandSuggestion,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCommandExecutionResult;
  runApkHoudokuNextTestingCommandSuggestion?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextTestingCommandExecutionResult;
  preflightApkHoudokuNextTestingCommandSuggestion?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextTestingCommandPreflightResult;
  getApkHoudokuTestingCommandAuditBundle?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCommandAuditBundleResult;
  getApkHoudokuNextTestingCommandAuditBundle?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextTestingCommandAuditBundleResult;
  runApkHoudokuNextTestingCommandTransaction?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextTestingCommandTransactionResult;
  runApkHoudokuNextTestingCommandTransactions?: (
    options?: ApkHoudokuNextTestingCommandTransactionLoopOptions
  ) => ApkHoudokuNextTestingCommandTransactionLoopResult;
  runApkHoudokuNextTestingCommandTransactionsWithCompletionPolicy?: (
    options?: ApkHoudokuTestingCompletionPolicyOptions
  ) => ApkHoudokuTestingCompletionPolicyResult;
  getApkHoudokuTestingCompletionPolicyPreset?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkHoudokuTestingCompletionPolicyPreset;
  runApkHoudokuTestingCompletionPolicyPreset?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCompletionPolicyResult;
  getApkHoudokuTestingCompletionPolicyPresetRecommendation?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCompletionPolicyPresetRecommendation;
  runApkHoudokuTestingCompletionPolicyPresetRecommendation?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCompletionPolicyPresetRunResult;
  runApkHoudokuTestingAutopilotSession?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingAutopilotSessionResult;
  getApkHoudokuTestingAutopilotQuickStatus?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingAutopilotQuickStatus;
  getApkHoudokuTestingExecutionSummary?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingExecutionSummary;
  runApkHoudokuTestingQuickStart?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingQuickStartResult;
  runApkHoudokuTestingFunctionalRun?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingFunctionalRunResult;
  getApkHoudokuTestingDispatchModel?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingDispatchModel;
  runApkHoudokuIntegrationCommandSuggestion?: (
    command?: ApkHoudokuIntegrationCommandSuggestion,
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCommandExecutionResult;
  runApkHoudokuNextIntegrationCommandSuggestion?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationCommandExecutionResult;
  getApkHoudokuReadyStatus?: () => ApkHoudokuReadyStatus;
  getApkUiModel?: (previousRuntimeStateVersion: string | undefined) => ApkUiModel;
  repairApkRuntimeState?: () => ApkRuntimeRepairResult;
  getApkRuntimeState?: () => ApkRuntimeState;
  refreshApkRuntimeState?: () => ApkRuntimeState;
  getApkMigrationReport?: () => ApkMigrationReport;
}

export abstract class TiyoClientAbstract implements TiyoClientInterface {
  spoofWindow: BrowserWindow;

  constructor(spoofWindow: BrowserWindow) {
    this.spoofWindow = spoofWindow;
  }

  getVersion!: GetVersionFunc;
  getExtensions!: GetExtensionsFunc;
  getDefaultApkExtensionsDirectoryPath?: () => string;
  useDefaultApkExtensionsDirectory?: () => ApkRuntimeConfig;
  enforceDefaultApkDirectory?: () => ApkDefaultDirectoryEnforceResult;
  getApkDirectoryStatus?: () => ApkDirectoryStatus;
  getApkExtensionsDirectory?: () => string;
  getApkExtensions?: () => ApkExtensionInfo[];
  refreshApkExtensions?: () => ApkExtensionInfo[];
  getApkSourceMappings?: () => ApkSourceMapping[];
  getApkUnneededExtensions?: () => ApkUnneededExtensionCandidate[];
  cleanupUnneededApkExtensions?: (
    options?: boolean | ApkUnneededExtensionCleanupOptions
  ) => ApkUnneededExtensionCleanupResult;
  getApkSourceGroups?: () => ApkSourceGroup[];
  getApkSourceReadinessSummaries?: () => ApkSourceReadinessSummary[];
  getApkPreferredSelectionCandidates?: () => ApkPreferredSelectionCandidate[];
  getApkSelectionState?: () => ApkSelectionState;
  cleanupApkSelectionState?: () => ApkSelectionCleanupResult;
  autoSelectPreferredApkWithResult?: (sourceKey: string) => ApkPreferredSelectionOperationResult;
  autoSelectPreferredApk?: (sourceKey: string) => ApkSelectionState;
  autoSelectAllPreferredApksWithResult?: () => ApkPreferredSelectionBulkOperationResult;
  autoSelectAllPreferredApks?: () => ApkSelectionState;
  getApkSelectionRecommendations?: () => ApkSelectionRecommendation[];
  getActiveApkMappings?: () => ApkActiveMapping[];
  setApkSourceSelection?: (sourceKey: string, selectedPackageName: string) => ApkSelectionState;
  clearApkSourceSelection?: (sourceKey: string) => ApkSelectionState;
  getApkRuntimeConfig?: () => ApkRuntimeConfig;
  getLastApkRepairMetadata?: () => ApkLastRepairMetadata | undefined;
  setApkExtensionsDirectory?: (directory: string) => ApkRuntimeConfig;
  clearApkExtensionsDirectory?: () => ApkRuntimeConfig;
  setApkOnlyMode?: (enabled: boolean) => ApkRuntimeConfig;
  setAdapterRequiredMode?: (enabled: boolean) => ApkRuntimeConfig;
  getApkRuntimeHealthSummary?: () => ApkRuntimeHealthSummary;
  getApkRuntimeActionHints?: () => ApkRuntimeActionHint[];
  getApkRuntimeDigest?: () => ApkRuntimeDigest;
  hasApkRuntimeDigestChanged?: (runtimeStateVersion: string | undefined) => boolean;
  getApkRuntimePollingDecision?: (
    previousRuntimeStateVersion: string | undefined
  ) => ApkRuntimePollingDecision;
  getApkRuntimeQuickStatus?: (
    previousRuntimeStateVersion: string | undefined
  ) => ApkRuntimeQuickStatus;
  getApkRuntimeBootstrap?: (
    previousRuntimeStateVersion: string | undefined
  ) => ApkRuntimeBootstrapResult;
  runApkRuntimeSuggestedAction?: (
    previousRuntimeStateVersion: string | undefined
  ) => ApkRuntimeSuggestedActionResult;
  syncApkRuntimeWithFilesystem?: (
    previousRuntimeStateVersion?: string
  ) => ApkRuntimeFilesystemSyncResult;
  getApkHoudokuPollingUpdate?: (
    previousRuntimeStateVersion?: string,
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkHoudokuPollingUpdateResult;
  runApkHoudokuMainProgramMethod?: (
    options?: ApkHoudokuMainProgramMethodOptions
  ) => ApkHoudokuMainProgramMethodResult;
  stabilizeApkRuntimeState?: (maxSteps?: number) => ApkRuntimeStabilizeResult;
  prepareApkRuntimeForHoudokuStartup?: () => ApkRuntimeStartupPreparationResult;
  runApkHoudokuApkMethodSetup?: (targetDirectory?: string) => ApkHoudokuApkMethodSetupResult;
  runApkHoudokuApkSourceMethodSetup?: (
    sourceKey: string,
    targetDirectory?: string,
    requestedPackageName?: string
  ) => ApkHoudokuApkSourceMethodSetupResult;
  runApkHoudokuGoodSourceMethodSetup?: (
    sourceKey: string,
    targetDirectory?: string,
    requestedPackageName?: string
  ) => ApkHoudokuGoodSourceMethodSetupResult;
  runApkHoudokuApkBulkSourceMethodSetup?: (
    targetDirectory?: string
  ) => ApkHoudokuApkBulkSourceMethodSetupResult;
  runApkHoudokuInstalledApkMethodSetup?: () => ApkHoudokuApkBulkSourceMethodSetupResult;
  runApkRuntimeMaintenanceCycle?: (
    options?: ApkRuntimeMaintenanceCycleOptions
  ) => ApkRuntimeMaintenanceCycleResult;
  runApkRuntimeStrictStartupGate?: (
    options?: ApkRuntimeStrictStartupGateOptions
  ) => ApkRuntimeStrictStartupGateResult;
  getApkRecommendedStrictStartupGate?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkRuntimeStrictStartupGateRecommendation;
  runApkRecommendedStrictStartupGate?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkRuntimeStrictStartupGateResult;
  getApkStartupRemediationPlan?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkStartupRemediationPlan;
  runApkStartupRemediation?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkStartupRemediationRunResult;
  runApkStartupRemediationWithOverrides?: (
    profile?: ApkRuntimeStrictStartupProfile,
    overrides?: ApkStartupRemediationOverrides
  ) => ApkStartupRemediationRunResult;
  runApkStartupRemediationUntilStable?: (
    options?: ApkStartupRemediationUntilStableOptions
  ) => ApkStartupRemediationUntilStableResult;
  getApkStartupExecutionSummary?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkStartupExecutionSummary;
  runApkHoudokuTestReady?: (
    options?: ApkHoudokuTestReadyOptions
  ) => ApkHoudokuTestReadyResult;
  getApkHoudokuLaunchModel?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuLaunchModel;
  getApkHoudokuLaunchModelWithOverrides?: (
    options?: ApkHoudokuLaunchModelOptions
  ) => ApkHoudokuLaunchModel;
  getApkHoudokuTestingPreset?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkHoudokuTestingPreset;
  getApkHoudokuTestingModel?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingModel;
  getApkHoudokuTestingModelWithOptions?: (
    options?: ApkHoudokuTestingModelOptions
  ) => ApkHoudokuTestingModel;
  getApkHoudokuIntegrationPlan?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationPlan;
  runApkHoudokuIntegrationStep?: (
    profile?: ApkRuntimeStrictStartupProfile,
    stepCode?: string,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationExecutionResult;
  runApkHoudokuIntegrationPlan?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationExecutionResult;
  getApkNextHoudokuIntegrationStep?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationStep;
  runApkNextHoudokuIntegrationStep?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationStepRunResult;
  getApkHoudokuIntegrationControllerModel?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationControllerModel;
  runApkHoudokuIntegrationControllerCycle?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationControllerCycleResult;
  getApkHoudokuIntegrationCommandSuggestions?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCommandSuggestionsResult;
  preflightApkHoudokuIntegrationCommandSuggestion?: (
    command?: ApkHoudokuIntegrationCommandSuggestion,
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCommandPreflightResult;
  preflightApkHoudokuNextIntegrationCommandSuggestion?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationCommandPreflightResult;
  getApkHoudokuIntegrationCommandAuditBundle?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCommandAuditBundleResult;
  getApkHoudokuNextIntegrationCommandAuditBundle?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationCommandAuditBundleResult;
  runApkHoudokuNextIntegrationCommandTransaction?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationCommandTransactionResult;
  runApkHoudokuNextIntegrationCommandTransactions?: (
    options?: ApkHoudokuNextIntegrationCommandTransactionLoopOptions
  ) => ApkHoudokuNextIntegrationCommandTransactionLoopResult;
  runApkHoudokuNextIntegrationCommandTransactionsWithCompletionPolicy?: (
    options?: ApkHoudokuIntegrationCompletionPolicyOptions
  ) => ApkHoudokuIntegrationCompletionPolicyResult;
  getApkHoudokuIntegrationCompletionPolicyPreset?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkHoudokuIntegrationCompletionPolicyPreset;
  runApkHoudokuIntegrationCompletionPolicyPreset?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCompletionPolicyResult;
  getApkHoudokuIntegrationCompletionPolicyPresetRecommendation?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCompletionPolicyPresetRecommendation;
  runApkHoudokuIntegrationCompletionPolicyPresetRecommendation?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCompletionPolicyPresetRunResult;
  runApkHoudokuIntegrationAutopilotSession?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationAutopilotSessionResult;
  getApkHoudokuIntegrationAutopilotQuickStatus?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationAutopilotQuickStatus;
  getApkHoudokuTestingEntryModel?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingEntryModel;
  runApkHoudokuTestingPrimaryAction?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingPrimaryActionRunResult;
  runApkHoudokuTestingSession?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingSessionRunResult;
  runApkHoudokuTestingSessionLoop?: (
    options?: ApkHoudokuTestingSessionLoopOptions
  ) => ApkHoudokuTestingSessionLoopResult;
  getApkHoudokuTestingControllerModel?: (
    options?: ApkHoudokuTestingControllerModelOptions
  ) => ApkHoudokuTestingControllerModel;
  runApkHoudokuTestingControllerCycle?: (
    options?: ApkHoudokuTestingControllerModelOptions
  ) => ApkHoudokuTestingControllerCycleResult;
  runApkHoudokuTestingAutopilot?: (
    options?: ApkHoudokuTestingAutopilotOptions
  ) => ApkHoudokuTestingAutopilotResult;
  getApkHoudokuTestingCommandSuggestions?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCommandSuggestionsResult;
  preflightApkHoudokuTestingCommandSuggestion?: (
    command?: ApkHoudokuTestingCommandSuggestion,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCommandPreflightResult;
  runApkHoudokuTestingCommandSuggestion?: (
    command?: ApkHoudokuTestingCommandSuggestion,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCommandExecutionResult;
  runApkHoudokuNextTestingCommandSuggestion?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextTestingCommandExecutionResult;
  preflightApkHoudokuNextTestingCommandSuggestion?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextTestingCommandPreflightResult;
  getApkHoudokuTestingCommandAuditBundle?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCommandAuditBundleResult;
  getApkHoudokuNextTestingCommandAuditBundle?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextTestingCommandAuditBundleResult;
  runApkHoudokuNextTestingCommandTransaction?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextTestingCommandTransactionResult;
  runApkHoudokuNextTestingCommandTransactions?: (
    options?: ApkHoudokuNextTestingCommandTransactionLoopOptions
  ) => ApkHoudokuNextTestingCommandTransactionLoopResult;
  runApkHoudokuNextTestingCommandTransactionsWithCompletionPolicy?: (
    options?: ApkHoudokuTestingCompletionPolicyOptions
  ) => ApkHoudokuTestingCompletionPolicyResult;
  getApkHoudokuTestingCompletionPolicyPreset?: (
    profile?: ApkRuntimeStrictStartupProfile
  ) => ApkHoudokuTestingCompletionPolicyPreset;
  runApkHoudokuTestingCompletionPolicyPreset?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCompletionPolicyResult;
  getApkHoudokuTestingCompletionPolicyPresetRecommendation?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCompletionPolicyPresetRecommendation;
  runApkHoudokuTestingCompletionPolicyPresetRecommendation?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingCompletionPolicyPresetRunResult;
  runApkHoudokuTestingAutopilotSession?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingAutopilotSessionResult;
  getApkHoudokuTestingAutopilotQuickStatus?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingAutopilotQuickStatus;
  getApkHoudokuTestingExecutionSummary?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingExecutionSummary;
  runApkHoudokuTestingQuickStart?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingQuickStartResult;
  runApkHoudokuTestingFunctionalRun?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingFunctionalRunResult;
  getApkHoudokuTestingDispatchModel?: (
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuTestingDispatchModel;
  runApkHoudokuIntegrationCommandSuggestion?: (
    command?: ApkHoudokuIntegrationCommandSuggestion,
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuIntegrationCommandExecutionResult;
  runApkHoudokuNextIntegrationCommandSuggestion?: (
    profile?: ApkRuntimeStrictStartupProfile,
    previousRuntimeStateVersion?: string
  ) => ApkHoudokuNextIntegrationCommandExecutionResult;
  getApkHoudokuReadyStatus?: () => ApkHoudokuReadyStatus;
  getApkUiModel?: (previousRuntimeStateVersion: string | undefined) => ApkUiModel;
  repairApkRuntimeState?: () => ApkRuntimeRepairResult;
  getApkRuntimeState?: () => ApkRuntimeState;
  refreshApkRuntimeState?: () => ApkRuntimeState;
  getApkMigrationReport?: () => ApkMigrationReport;
}
